"use client";

// The approval-gate field: the demo thesis drawn as a particle system.
// Work streams in from the left in loose, wandering orbits; every
// particle slows at a vertical gate at centre screen, flashes the
// accent for the moment it is "approved", then exits right as an
// ordered lattice. Chaos in, order out, a human gate in the middle.
//
// Engineering shape: one Points draw call, all motion computed in the
// vertex shader from a time uniform (zero per-frame JS allocation).
// The canvas pauses when offscreen or the tab is hidden, clamps DPR,
// halves the particle count on small screens, and renders a single
// frozen frame under prefers-reduced-motion. If WebGL is unavailable
// the component renders nothing and the CSS backdrop stands alone.

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2  uBounds;   // visible half-width / half-height at z=0
  uniform float uRows;
  attribute vec4 aSeed;
  varying float vGlow;     // 0..1 proximity to the gate
  varying float vAlpha;

  void main() {
    float halfW = uBounds.x;
    float halfH = uBounds.y;

    // Journey progress: each particle loops left -> right forever,
    // offset and paced by its seed.
    float p = fract(uTime * (0.016 + aSeed.x * 0.012) + aSeed.y);
    // Plateau near the middle: dx/dp dips at p = .5 so particles
    // visibly hesitate at the gate before being let through.
    float pc = p + 0.105 * sin(p * 6.28318);
    float x = mix(-halfW * 1.04, halfW * 1.04, pc);

    // Pre-gate: loose wandering orbits (the unsorted inbox).
    float wanderAmp = 0.55 + aSeed.w * 1.35;
    float chaoticY = (aSeed.z * 2.0 - 1.0) * halfH * 0.88
      + sin(uTime * (0.35 + aSeed.w * 0.5) + aSeed.y * 6.28318) * wanderAmp;
    float chaoticZ = (aSeed.w * 2.0 - 1.0) * 2.6;

    // Post-gate: a calm lattice (the approved, ordered work).
    float row = floor(aSeed.z * uRows);
    float latticeY = (row + 0.5 - uRows * 0.5) * (halfH * 1.62 / uRows)
      + sin(uTime * 0.55 + x * 0.9 + row) * 0.05;

    // The snap happens across a narrow band around the gate.
    float order = smoothstep(-1.3, 1.3, x);
    vec3 pos = vec3(
      x,
      mix(chaoticY, latticeY, order),
      mix(chaoticZ, 0.0, order)
    );

    // Gate proximity drives the accent flash and a size bump.
    float g = exp(-x * x * 1.35);
    vGlow = g;

    float edgeFade = smoothstep(halfW * 1.04, halfW * 0.82, abs(x));
    vAlpha = (0.30 + g * 0.62 + order * 0.14) * edgeFade;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.15 + aSeed.x * 1.7 + g * 2.2) * uPixelRatio * (10.5 / -mv.z);
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uAccent;
  varying float vGlow;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.12, d);
    if (disc < 0.01) discard;
    vec3 col = mix(uBase, uAccent, vGlow * 0.92);
    gl_FragColor = vec4(col, disc * vAlpha);
  }
`;

export function GateField({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const small = window.innerWidth < 768;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ alpha: true, antialias: false });
    } catch {
      return; // No WebGL: the CSS backdrop carries the hero alone.
    }
    renderer.setClearColor(0x000000, 0);

    const scene = new Scene();
    const camera = new PerspectiveCamera(50, 1, 0.1, 60);
    camera.position.z = 16;

    const count = small ? 1500 : 3800;
    const seeds = new Float32Array(count * 4);
    // Deterministic PRNG so SSR/CSR and reloads agree on the field.
    let s = 1737;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
    for (let i = 0; i < count * 4; i += 1) seeds[i] = rand();

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute("aSeed", new BufferAttribute(seeds, 4));
    // All real positions come from the vertex shader; keep culling off.
    geometry.boundingSphere = null;

    const uniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uBounds: { value: new Vector2(14, 7.5) },
      uRows: { value: 13 },
      uBase: { value: new Color("#8d8d96") },
      uAccent: { value: new Color("#ff6b6b") },
    };
    const material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms,
    });

    const points = new Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";

    const fit = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      uniforms.uBounds.value.set(halfH * camera.aspect, halfH);
      uniforms.uPixelRatio.value = dpr;
    };
    fit();

    let raf = 0;
    let running = false;
    let last = performance.now();
    let elapsed = 0;

    const frame = (now: number) => {
      elapsed += Math.min(now - last, 64) / 1000;
      last = now;
      uniforms.uTime.value = elapsed;
      renderer.render(scene, camera);
      if (running) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || reducedMotion) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    if (reducedMotion) {
      // One still frame: the field as a poster, no movement.
      uniforms.uTime.value = 38;
      renderer.render(scene, camera);
    } else {
      start();
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(host);

    const onVisibility = () =>
      document.visibilityState === "visible" && !document.hidden ? start() : stop();
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(() => {
      fit();
      if (reducedMotion) renderer.render(scene, camera);
    });
    ro.observe(host);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} aria-hidden className={className} />;
}

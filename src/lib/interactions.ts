// Pointer interactions, all GSAP-driven and all optional. Every effect
// here is a flourish whose total failure costs nothing: nothing is ever
// hidden or displaced in its resting state, so a frozen ticker, a touch
// screen, or reduced motion simply leaves the page as it rendered.
//
//   useSpotlight()   one document listener; any [data-spot] element gets
//                    --mx / --my so its CSS light follows the cursor.
//   useMagnetic()    a CTA leans toward the pointer and springs back.
//   useTilt()        a card tilts in 3D toward the pointer; children with
//                    [data-depth] parallax inside it.
//   ripple()         a press ripple from the click point (pointer only,
//                    never for keyboard activation).

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

function finePointer(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

let spotlightBound = false;

/** Mount once (App does). Cheap: one pointermove, rAF-coalesced. */
export function useSpotlight() {
  useEffect(() => {
    if (spotlightBound || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    spotlightBound = true;
    let frame = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      const el = (e.target as Element | null)?.closest?.<HTMLElement>("[data-spot]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      spotlightBound = false;
    };
  }, []);
}

/** The element drifts toward the cursor while hovered, then springs home. */
export function useMagnetic(ref: RefObject<HTMLElement | null>, strength = 0.28) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !finePointer()) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.45)" });
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform" });
    };
  }, [ref, strength]);
}

/**
 * 3D tilt toward the pointer. `max` is degrees. Children marked
 * [data-depth="n"] shift by n px against the tilt, so layered content
 * (a screenshot inside a frame) reads as depth.
 */
export function useTilt(ref: RefObject<HTMLElement | null>, max = 6) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !finePointer()) return;
    gsap.set(el, { transformPerspective: 1100, transformStyle: "preserve-3d" });
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
    const layers = Array.from(el.querySelectorAll<HTMLElement>("[data-depth]")).map((layer) => ({
      depth: Number(layer.dataset.depth) || 0,
      x: gsap.quickTo(layer, "x", { duration: 0.7, ease: "power3.out" }),
      y: gsap.quickTo(layer, "y", { duration: 0.7, ease: "power3.out" }),
      el: layer,
    }));
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rx(-py * max);
      ry(px * max);
      for (const l of layers) {
        l.x(-px * l.depth);
        l.y(-py * l.depth);
      }
    };
    const onLeave = () => {
      rx(0);
      ry(0);
      for (const l of layers) {
        l.x(0);
        l.y(0);
      }
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform" });
      for (const l of layers) {
        gsap.killTweensOf(l.el);
        gsap.set(l.el, { clearProps: "transform" });
      }
    };
  }, [ref, max]);
}

/** A press ripple from the pointer. Keyboard presses (detail 0) skip it. */
export function ripple(e: React.MouseEvent<HTMLElement>) {
  if (e.detail === 0) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const host = e.currentTarget;
  const r = host.getBoundingClientRect();
  const dot = document.createElement("span");
  dot.className = "btn-ripple";
  dot.setAttribute("aria-hidden", "true");
  dot.style.left = `${e.clientX - r.left}px`;
  dot.style.top = `${e.clientY - r.top}px`;
  host.appendChild(dot);
  const scale = (Math.max(r.width, r.height) / 12) * 2.4;
  gsap.fromTo(
    dot,
    { scale: 0.4, opacity: 0.32 },
    { scale, opacity: 0, duration: 0.6, ease: "power2.out", onComplete: () => dot.remove() },
  );
  // If the ticker is frozen the dot is invisible soon anyway; clean up.
  window.setTimeout(() => dot.remove(), 900);
}

"use client";

// The cascade, made visible. Every scene's signature beat is "act in
// one column, the next column reacts" — this sends a small scene-accent
// orb flying from the clicked control to the receiving column so the
// eye travels WITH the work. The destination's own pg-fresh / pg-cue
// flash then lands the arrival.
//
// Transform/opacity only, a single throwaway element per flight,
// skipped under prefers-reduced-motion, and silently a no-op if the
// target isn't on screen (mobile swipe-columns).

import { gsap } from "@/lib/gsap";

export function flowPulse(source: Element | null, targetName: string) {
  if (typeof window === "undefined" || !source) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const target = document.querySelector(`[data-flow="${targetName}"]`);
  if (!target) return;

  const s = source.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  // Off-screen target (snap-scrolled away on mobile): skip the flight.
  if (t.width === 0 || t.right < 0 || t.left > window.innerWidth) return;

  const from = { x: s.left + s.width / 2, y: s.top + s.height / 2 };
  const to = {
    x: t.left + t.width / 2,
    y: t.top + Math.min(t.height * 0.22, 96),
  };
  // Control point above the straight line: a shallow arc reads as
  // "handed over", a straight line reads as a glitch.
  const cp = {
    x: (from.x + to.x) / 2,
    y: Math.min(from.y, to.y) - 56,
  };

  const accent =
    getComputedStyle(source).getPropertyValue("--color-scene-1").trim() ||
    "#ff6b6b";

  const dot = document.createElement("div");
  dot.setAttribute("aria-hidden", "true");
  Object.assign(dot.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: accent,
    boxShadow: `0 0 14px 2px ${accent}66`,
    pointerEvents: "none",
    zIndex: "60",
    willChange: "transform",
  });
  document.body.appendChild(dot);

  const flight = { p: 0 };
  gsap.set(dot, { x: from.x - 4.5, y: from.y - 4.5, scale: 0.4, opacity: 0 });
  gsap
    .timeline({ onComplete: () => dot.remove() })
    .to(dot, { opacity: 1, scale: 1, duration: 0.12, ease: "power1.out" }, 0)
    .to(
      flight,
      {
        p: 1,
        duration: 0.62,
        ease: "power2.inOut",
        onUpdate: () => {
          const u = flight.p;
          const inv = 1 - u;
          const x = inv * inv * from.x + 2 * inv * u * cp.x + u * u * to.x;
          const y = inv * inv * from.y + 2 * inv * u * cp.y + u * u * to.y;
          gsap.set(dot, { x: x - 4.5, y: y - 4.5 });
        },
      },
      0,
    )
    .to(dot, { scale: 2.2, opacity: 0, duration: 0.26, ease: "power2.out" }, 0.58);
}

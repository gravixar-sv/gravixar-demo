// Index hero. The headline states the loop in three beats; behind it the
// GateField draws the same loop as a living particle system. The
// entrance is a masked line rise in pure CSS (compositor-driven, so it
// survives a throttled rAF) and reduced motion renders the resting
// state. Scrolling away, the copy drifts up and dims (GSAP scrub,
// transform + opacity only; with no JS it simply stays put).

import { lazy, Suspense, useRef, useSyncExternalStore } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMagnetic } from "@/lib/interactions";

const GateFieldLazy = lazy(() =>
  import("@/components/home/GateField").then((m) => ({ default: m.GateField })),
);

const noopSubscribe = () => () => {};

// three.js loads only in the browser, after mount, never in the prerender.
function GateField({ className }: { className?: string }) {
  // false in the prerender and during hydration, true once mounted.
  const onClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!onClient) return null;
  return (
    <Suspense fallback={null}>
      <GateFieldLazy className={className} />
    </Suspense>
  );
}

export function Hero() {
  const scope = useRef<HTMLElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);
  useMagnetic(cta, 0.25);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.to("[data-hero-copy]", {
        yPercent: -14,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: { trigger: scope.current, start: "top top", end: "bottom top", scrub: 0.4 },
      });
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      aria-labelledby="hero-heading"
      className="relative flex min-h-[calc(100dvh-6.5rem)] flex-col overflow-hidden"
    >
      <GateField className="absolute inset-0" />
      <div aria-hidden className="gate-hairline absolute inset-y-[10%] left-1/2 hidden w-px md:block" />
      {/* Contrast scrim behind the copy, and the ember horizon under it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 75% at 20% 50%, rgb(9 8 11 / 0.94) 0%, rgb(9 8 11 / 0.6) 45%, transparent 75%), linear-gradient(to top, var(--color-ink-950) 0%, transparent 28%)",
        }}
      />

      {/* Centred vertically, with the same padding above and below, so the
          headline, the subtext and the button read as one block. */}
      <div
        data-hero-copy
        className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center px-4 py-20 sm:px-6 md:py-24 lg:px-10"
      >
        <h1 id="hero-heading" className="display text-[2.5rem] text-ink-50 sm:text-6xl lg:text-[4.25rem]">
          <span className="block overflow-hidden pb-[0.04em]">
            <span className="hero-line block">AI does the work.</span>
          </span>
          <span className="block overflow-hidden pb-[0.04em]">
            <span className="hero-line hero-line-2 voice block text-scene-soft">You hold the gate.</span>
          </span>
          <span className="block overflow-hidden pb-[0.04em]">
            <span className="hero-line hero-line-3 block">It learns your rules.</span>
          </span>
        </h1>

        <p className="hero-soft mt-8 max-w-xl text-base leading-relaxed text-ink-300 md:text-lg">
          Not slides, not a video, not a signup. Open a scene, press the buttons, and watch a draft move through
          a human gate and teach the system a rule. No sign-in needed.
        </p>
        <div className="hero-soft hero-soft-2 mt-10 flex flex-wrap items-center gap-3">
          <a ref={cta} href="#scenes" className="btn btn-primary btn-lg">
            Open a scene
            <span aria-hidden className="btn-arrow">
              ↓
            </span>
          </a>
          <a href="#loop" className="btn btn-quiet btn-lg">
            How the loop works
          </a>
        </div>
      </div>
    </section>
  );
}

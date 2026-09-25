// Index hero. The headline states the loop in three beats; behind it the
// GateField draws the same loop as a living particle system. The
// entrance is a masked line rise in pure CSS (compositor-driven, so it
// survives a throttled rAF) and reduced motion renders the resting
// state. Scrolling away, the copy drifts up and dims (GSAP scrub,
// transform + opacity only; with no JS it simply stays put).

import { lazy, Suspense, useRef, useSyncExternalStore } from "react";
import { SCENES } from "@/lib/scenes";
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

  const live = SCENES.filter((s) => s.status === "live");

  return (
    <section
      ref={scope}
      aria-labelledby="hero-heading"
      className="relative flex min-h-[calc(100dvh-5.5rem)] flex-col overflow-hidden"
    >
      <GateField className="absolute inset-0" />
      <div aria-hidden className="gate-hairline absolute inset-y-[10%] left-1/2 hidden w-px md:block" />
      {/* Contrast scrim behind the copy, and the ember horizon under it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 20% 85%, rgb(9 8 11 / 0.94) 0%, rgb(9 8 11 / 0.6) 45%, transparent 75%), linear-gradient(to top, var(--color-ink-950) 0%, transparent 28%)",
        }}
      />

      <div
        data-hero-copy
        className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end px-4 pb-10 pt-24 sm:px-6 md:pb-14 lg:px-10"
      >
        <p className="hero-soft flex items-center gap-2.5 text-sm text-ink-400">
          <span aria-hidden className="live-dot text-emerald-400" />
          Five working apps · sample data · no sign-in
        </p>

        <h1 id="hero-heading" className="display mt-6 text-[2.9rem] text-ink-50 sm:text-7xl lg:text-[6.4rem]">
          <span className="block overflow-hidden pb-[0.06em]">
            <span className="hero-line block">AI does the work.</span>
          </span>
          <span className="block overflow-hidden pb-[0.12em]">
            <span className="hero-line hero-line-2 voice block font-normal text-scene-soft">You hold the gate.</span>
          </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <span className="hero-line hero-line-3 block">It learns your rules.</span>
          </span>
        </h1>

        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="hero-soft max-w-xl text-base leading-relaxed text-ink-300 md:text-lg">
              Not slides, not a video, not a signup. Open a scene, press the buttons, and watch a
              draft move through a human gate and teach the system a rule.
            </p>
            <div className="hero-soft hero-soft-2 mt-8 flex flex-wrap items-center gap-3">
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

          <nav aria-label="Jump to a scene" className="hero-soft hero-soft-3">
            <p className="text-xs text-ink-500">Or jump straight in</p>
            <ul className="mt-3 flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
              {live.map((s) => (
                <li key={s.slug}>
                  <a
                    href={`/${s.slug}`}
                    className="group inline-flex items-center gap-2 rounded-full border border-line-strong bg-ink-950/60 px-3.5 py-2 text-[13px] text-ink-200 backdrop-blur transition-[border-color,color,background-color] duration-200 hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
                  >
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full transition-transform duration-300 group-hover:scale-[1.8]"
                      style={{ background: s.theme.accent, boxShadow: `0 0 10px ${s.theme.glow}` }}
                    />
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}

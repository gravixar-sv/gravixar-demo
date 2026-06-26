"use client";

// Index hero. The headline states the loop in three beats; behind it
// the GateField draws the same loop as a living particle system. The
// entrance is a masked line-rise in pure CSS (compositor-driven, so
// it survives rAF-throttled contexts) and reduced motion simply
// renders the resting state.

import dynamic from "next/dynamic";

const GateField = dynamic(
  () => import("@/components/home/GateField").then((m) => m.GateField),
  { ssr: false },
);

const LINES = [
  { text: "AI does the work.", accent: false },
  { text: "You hold the gate.", accent: true },
  { text: "It learns your rules.", accent: false },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-6.5rem)] flex-col overflow-hidden">
      {/* Living backdrop: chaos in, gate, order out */}
      <GateField className="absolute inset-0" />
      {/* The gate itself: one quiet hairline at centre */}
      <div
        aria-hidden
        className="gate-hairline absolute inset-y-[12%] left-1/2 hidden w-px md:block"
      />
      {/* Contrast scrim behind the copy */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 88%, rgba(5,5,8,0.92) 0%, rgba(5,5,8,0.55) 45%, transparent 75%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-6 pb-16 pt-24 md:px-10 md:pb-20 lg:px-12">
        <p className="hero-soft font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          live demo · five working scenes · no sign-in
        </p>

        <h1 className="mt-5 text-[2.6rem] font-medium leading-[1.02] tracking-[-0.035em] text-zinc-50 sm:text-6xl md:text-7xl lg:text-[5.4rem]">
          {LINES.map((line, i) => (
            <span key={line.text} className="block overflow-hidden pb-[0.08em]">
              <span
                className={`hero-line ${i > 0 ? `hero-line-${i + 1}` : ""} block will-change-transform ${
                  line.accent ? "text-[#ff6b6b]" : ""
                }`}
              >
                {line.text}
              </span>
            </span>
          ))}
        </h1>

        <p className="hero-soft mt-6 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">
          Five working apps with sample data. Not slides, not a video, not a
          signup. Open a scene and run the loop yourself.
        </p>

        <div className="hero-soft mt-8 flex flex-wrap items-center gap-4">
          <a
            href="#scenes"
            className="inline-flex items-center gap-2 rounded-lg bg-[#ff6b6b] px-5 py-3 text-sm font-semibold text-[#160808] transition-[transform,filter] duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b6b] active:scale-[0.98]"
          >
            Explore the scenes
            <span aria-hidden>↓</span>
          </a>
          <a
            href="#loop"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-medium text-zinc-200 transition-colors duration-200 hover:border-white/30 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 active:scale-[0.98]"
          >
            How the loop works
          </a>
        </div>

        <div className="hero-soft mt-12 flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
          <span className="hidden items-center gap-2 md:flex">
            <span className="inline-block h-px w-10 bg-zinc-700" aria-hidden />
            work in, chaos
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ff6b6b]/80" aria-hidden />
            your approval
          </span>
          <span className="hidden items-center gap-2 md:flex">
            order out
            <span className="inline-block h-px w-10 bg-zinc-700" aria-hidden />
          </span>
        </div>
      </div>
    </section>
  );
}

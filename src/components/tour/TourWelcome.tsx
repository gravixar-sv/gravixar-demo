"use client";

import { TOUR_COPY } from "@/lib/tour/script";

type Props = {
  onStart: () => void;
};

export function TourWelcome({ onStart }: Props) {
  return (
    <div className="tour-step-enter mx-auto flex min-h-[calc(100dvh-8rem)] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-scene-1)]">
        {TOUR_COPY.welcome.eyebrow}
      </p>
      <h1 className="mt-6 text-4xl font-medium leading-[1.05] tracking-[-0.02em] text-zinc-50 md:text-6xl">
        {TOUR_COPY.welcome.headline}
      </h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-300 md:text-lg">
        {TOUR_COPY.welcome.body}
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-10 inline-flex items-center gap-2 rounded-md border border-[var(--color-scene-1)]/50 bg-[var(--color-scene-1)]/15 px-5 py-3 text-sm font-medium text-[var(--color-scene-1)] transition-colors hover:bg-[var(--color-scene-1)]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-scene-1)]/60"
      >
        {TOUR_COPY.welcome.cta}
      </button>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
        about 60 seconds · auto-advances · pause anytime
      </p>
    </div>
  );
}

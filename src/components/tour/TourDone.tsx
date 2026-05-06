"use client";

// Done screen. Two equal-weight CTAs (try freely, talk to Qamar) +
// optional "take the tour again". External link uses noreferrer.

import Link from "next/link";
import { track } from "@vercel/analytics";
import { TOUR_COPY } from "@/lib/tour/script";

type Props = {
  onRestart: () => void;
};

export function TourDone({ onRestart }: Props) {
  function trackCta(which: "lattice" | "contact") {
    track("tour_cta_clicked", { which });
  }

  return (
    <div className="tour-step-enter mx-auto flex min-h-[calc(100dvh-8rem)] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-scene-1)]">
        {TOUR_COPY.done.eyebrow}
      </p>
      <h2 className="mt-6 text-4xl font-medium leading-[1.05] tracking-[-0.02em] text-zinc-50 md:text-5xl">
        {TOUR_COPY.done.headline}
      </h2>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-300 md:text-lg">
        {TOUR_COPY.done.body}
      </p>

      <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={TOUR_COPY.done.primaryHref}
          onClick={() => trackCta("lattice")}
          className="inline-flex flex-1 items-center justify-center rounded-md border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium text-zinc-100 transition-colors hover:border-white/30 hover:bg-white/[0.08]"
        >
          {TOUR_COPY.done.primaryCta}
        </Link>
        <a
          href={TOUR_COPY.done.secondaryHref}
          rel="noreferrer"
          onClick={() => trackCta("contact")}
          className="inline-flex flex-1 items-center justify-center rounded-md border border-[var(--color-scene-1)]/50 bg-[var(--color-scene-1)]/15 px-5 py-3 text-sm font-medium text-[var(--color-scene-1)] transition-colors hover:bg-[var(--color-scene-1)]/25"
        >
          {TOUR_COPY.done.secondaryCta}
        </a>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 hover:text-zinc-200"
      >
        ↻ {TOUR_COPY.done.restart}
      </button>
    </div>
  );
}

"use client";

// Between-persona transition. Brief shimmer + "Switching to <Name> ·
// <Role>". Lasts 2s and then auto-advances via timer; this component
// just renders the visual state.

import { TOUR_PERSONAS, type TourPersonaKey } from "@/lib/tour/script";

type Props = {
  toPersonaKey: TourPersonaKey;
};

export function TourTransition({ toPersonaKey }: Props) {
  const persona = TOUR_PERSONAS[toPersonaKey];
  return (
    <div className="tour-step-enter mx-auto flex min-h-[calc(100dvh-8rem)] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="relative">
        <span
          aria-hidden
          className="block h-12 w-12 animate-spin rounded-full border-2 border-[var(--color-scene-1)]/20 border-t-[var(--color-scene-1)]"
        />
      </div>
      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        switching to
      </p>
      <p className="mt-2 text-2xl font-medium tracking-[-0.015em] text-zinc-50">
        {persona.name}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
        {persona.role}
      </p>
    </div>
  );
}

"use client";

// Top control bar for the tour: back-to-gallery, progress dots, and
// session controls (pause, restart, sound — sound is disabled in V1).

import Link from "next/link";
import { TOUR_PROGRESS_STEPS, type TourStepId } from "@/lib/tour/script";

type Props = {
  step: TourStepId;
  paused: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
};

const PROGRESS_LABELS: Partial<Record<TourStepId, string>> = {
  welcome: "Welcome",
  login: "Sign in",
  mira: "Client",
  kai: "PM",
  nox: "Admin",
  done: "Recap",
};

// Map any step (incl. transition steps) to its progress-dot index.
function progressIndexForStep(step: TourStepId): number {
  switch (step) {
    case "welcome":
      return 0;
    case "login":
      return 1;
    case "mira":
    case "transition-mira-kai":
      return 2;
    case "kai":
    case "transition-kai-nox":
      return 3;
    case "nox":
      return 4;
    case "done":
      return 5;
  }
}

export function TourTopbar({ step, paused, onTogglePause, onRestart }: Props) {
  const activeIndex = progressIndexForStep(step);
  const showSessionControls = step !== "welcome" && step !== "done";

  return (
    <div className="border-b border-white/5 bg-black/30 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-zinc-300 transition-colors hover:text-white"
        >
          <span aria-hidden>←</span>
          <span className="hidden sm:inline">gallery</span>
          <span className="sm:hidden">exit</span>
        </Link>

        <ol
          aria-label="Tour progress"
          className="flex items-center gap-2"
        >
          {TOUR_PROGRESS_STEPS.map((s, i) => {
            const active = i === activeIndex;
            const done = i < activeIndex;
            return (
              <li
                key={s}
                aria-current={active ? "step" : undefined}
                className="flex items-center gap-1.5"
              >
                <span
                  className={[
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    active
                      ? "bg-[var(--color-scene-1)] shadow-[0_0_0_3px_rgba(255,107,107,0.18)]"
                      : done
                        ? "bg-zinc-300/70"
                        : "bg-zinc-700",
                  ].join(" ")}
                />
                <span
                  className={[
                    "hidden font-mono text-[10px] uppercase tracking-[0.18em] md:inline",
                    active
                      ? "text-zinc-100"
                      : done
                        ? "text-zinc-400"
                        : "text-zinc-600",
                  ].join(" ")}
                >
                  {PROGRESS_LABELS[s]}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="flex items-center gap-2">
          {showSessionControls ? (
            <button
              type="button"
              onClick={onTogglePause}
              aria-pressed={paused}
              className="rounded-md border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
            >
              {paused ? "▶ resume" : "❚❚ pause"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onRestart}
            className="rounded-md border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
          >
            ↻ restart
          </button>
          <span
            aria-disabled
            title="Audio coming in V2"
            className="hidden rounded-md border border-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600 sm:inline"
          >
            🔇 mute
          </span>
        </div>
      </div>
    </div>
  );
}

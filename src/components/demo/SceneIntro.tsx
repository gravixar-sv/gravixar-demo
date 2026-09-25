import type { ReactNode } from "react";
import { findScene } from "@/lib/scenes";
import { Button } from "@/components/ui/Button";

export type TryStep = {
  /** What to do, imperative and short: "Approve a deliverable as Mira". */
  label: string;
  /** Derived from the scene's reducer state, never from a timer. */
  done: boolean;
};

// The top of every scene: what this is, in one heading and two
// sentences, beside a live checklist of the loop. The checklist is the
// scene's instructions and its progress at once: each step ticks from
// the reducer's own state as the visitor does it, and the first undone
// step is lit so there is always an obvious next thing to press.
export function SceneIntro({
  slug,
  title,
  lede,
  steps,
  onReset,
  status,
}: {
  slug: string;
  /** The scene's h1. Short, active: "Watch a deliverable move." */
  title: ReactNode;
  /** One or two sentences. The steps carry the instructions. */
  lede: ReactNode;
  steps: TryStep[];
  onReset: () => void;
  /** Optional live readout beside the eyebrow, e.g. "2 shipped". */
  status?: ReactNode;
}) {
  const scene = findScene(slug)!;
  const done = steps.filter((s) => s.done).length;
  const next = steps.findIndex((s) => !s.done);
  const complete = next === -1;

  return (
    <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] lg:gap-14">
      <header className="scene-rise max-w-3xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="chip chip-accent">
            <span aria-hidden className="live-dot" />
            Live sandbox
          </span>
          <span className="text-xs text-ink-400">
            {scene.whatItIs}, for {scene.personaLabel}
          </span>
          {status}
        </div>
        <h1 className="display mt-5 text-[2.35rem] text-ink-50 sm:text-5xl lg:text-[3.5rem]">{title}</h1>
        <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-ink-400 md:text-[1.0625rem]">{lede}</p>
      </header>

      <section aria-labelledby={`${slug}-try-heading`} className="surface scene-rise-2 rounded-2xl p-4 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 id={`${slug}-try-heading`} className="text-sm font-semibold text-ink-50">
            {complete ? "Loop complete" : "Try the loop"}
          </h2>
          <div className="flex items-center gap-2">
            <span className="label-mono" aria-live="polite">
              <span key={done} className="pop-in inline-block text-ink-200">
                {done}
              </span>{" "}
              of {steps.length}
            </span>
            <Button variant="ghost" size="sm" onClick={onReset} icon="↻" className="font-mono uppercase tracking-[0.08em]">
              Reset
            </Button>
          </div>
        </div>
        <div aria-hidden className="mt-3 h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full origin-left rounded-full bg-scene transition-transform duration-700 ease-[var(--ease-out)]"
            style={{ transform: `scaleX(${steps.length ? done / steps.length : 0})` }}
          />
        </div>
        <ol className="mt-4 space-y-1.5">
          {steps.map((step, i) => {
            const current = i === next;
            return (
              <li
                key={step.label}
                className={`flex items-start gap-3 rounded-lg px-2 py-1.5 transition-colors duration-300 ${
                  current ? "bg-white/[0.04]" : ""
                }`}
              >
                <span
                  aria-hidden
                  key={step.done ? "done" : "todo"}
                  className={`mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] ${
                    step.done
                      ? "pop-in bg-scene text-ink-950"
                      : current
                        ? "text-scene-soft ring-1 ring-[var(--color-scene-1)]"
                        : "text-ink-500 ring-1 ring-white/15"
                  }`}
                >
                  {step.done ? "✓" : i + 1}
                </span>
                <span
                  className={`text-sm leading-snug ${
                    step.done ? "text-ink-500 line-through decoration-ink-600" : current ? "text-ink-50" : "text-ink-300"
                  }`}
                >
                  <span className="sr-only">{step.done ? "Done: " : current ? "Next: " : ""}</span>
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
        {complete ? (
          <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-ink-400">
            That is the whole loop: the work moved, a person decided, and the system kept the rule. Reset to run it again.
          </p>
        ) : null}
      </section>
    </div>
  );
}

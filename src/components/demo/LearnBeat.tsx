// The learn beat, shared by every scene: the rulebook that grows as the
// visitor approves, sends back or discards. One component; scenes pass
// their own copy. The count line ("2 learned from Mira") is also what
// scripts/verify-learn-beat.mjs reads, so keep its shape.

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { vtName } from "@/lib/viewTransition";

/** Structural shape every scene's own Rule type satisfies. */
export type LearnedRule = {
  id: string;
  text: string;
  kind: "do" | "dont";
  /** True when learned from a human action; false for seeded house rules. */
  learned: boolean;
  fresh?: boolean;
};

export function LearnBeat<R extends LearnedRule>({
  rules,
  learnedCount,
  heading,
  sub = "What every decision teaches",
  emptyText,
  headingId = "learn-beat-heading",
  learnedLabel = "learned from you",
  learnedNote = "Learned from your approval",
  flow,
  renderMeta,
}: {
  rules: R[];
  learnedCount: number;
  /** Section heading, sentence case: "House rules". */
  heading: string;
  /** One quiet line beside the heading. */
  sub?: string;
  /** Shown in place of the list when the rulebook is empty. */
  emptyText: string;
  headingId?: string;
  /** Tail of the count line, e.g. "learned from Mira". */
  learnedLabel?: string;
  /** Per-row note under a learned rule. Ignored when renderMeta is set. */
  learnedNote?: string;
  /** Name other columns target with flowPulse(). */
  flow?: string;
  /** Replaces the default learned note with scene-specific row meta. */
  renderMeta?: (rule: R) => ReactNode;
}) {
  return (
    <section
      data-flow={flow}
      aria-labelledby={headingId}
      className="surface scene-rise-3 mt-6 rounded-2xl p-5 md:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--color-scene-1)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-scene-1)_10%,transparent)] text-scene-soft"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M2.5 3.5c2-.8 3.8-.8 5.5.5v9c-1.7-1.3-3.5-1.3-5.5-.5v-9Zm11 0c-2-.8-3.8-.8-5.5.5v9c1.7-1.3 3.5-1.3 5.5-.5v-9Z" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h2 id={headingId} className="heading text-lg text-ink-50">
              {heading}
            </h2>
            <p className="text-xs text-ink-500">{sub}</p>
          </div>
        </div>
        <p className="font-mono text-[11px] text-ink-500">
          {rules.length} {rules.length === 1 ? "rule" : "rules"}
          {learnedCount > 0 ? (
            <>
              {" · "}
              {/* Keyed on the count so each increment pops into place. */}
              <span key={learnedCount} className="pop-in inline-block text-scene-soft">
                {learnedCount} {learnedLabel}
              </span>
            </>
          ) : null}
        </p>
      </div>
      {rules.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-white/[0.1] px-4 py-6 text-center text-xs text-ink-500">
          {emptyText}
        </p>
      ) : (
        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule) => (
            <RuleRow key={rule.id} rule={rule} learnedNote={learnedNote} meta={renderMeta?.(rule)} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function RuleRow({
  rule,
  learnedNote = "Learned from your approval",
  meta,
}: {
  rule: LearnedRule;
  learnedNote?: string;
  meta?: ReactNode;
}) {
  const isDo = rule.kind === "do";
  return (
    <li
      // Named so a new rule slides the others over instead of jumping them.
      style={{ viewTransitionName: vtName("rule", rule.id) }}
      data-spot
      className={cn(
        "item rounded-xl px-3.5 py-3",
        rule.fresh && "pg-fresh border-[color-mix(in_oklab,var(--color-scene-1)_50%,transparent)]",
        rule.learned && !rule.fresh && "border-[color-mix(in_oklab,var(--color-scene-1)_22%,transparent)]",
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden
          className={cn(
            "mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold",
            isDo ? "bg-emerald-400/12 text-emerald-300" : "bg-rose-400/12 text-rose-300",
          )}
        >
          {isDo ? "✓" : "✕"}
        </span>
        <span className="sr-only">{isDo ? "Do:" : "Don't:"}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] leading-relaxed text-ink-200">{rule.text}</p>
          {meta ??
            (rule.learned ? <p className="mt-1 text-[11px] font-medium text-scene-soft">{learnedNote}</p> : null)}
        </div>
      </div>
    </li>
  );
}

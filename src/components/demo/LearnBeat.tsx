// The learn beat, shared by every scene. "What every approval teaches":
// a rulebook that grows as the visitor approves / sends back / discards.
//
// This was copy-pasted into all five scene pages, which is how the five
// copies drifted (different type sizes, different muted greys, one scene
// rendering rows as <div> so the list lost its semantics). One component
// now; scenes pass their own copy.

import type { ReactNode } from "react";

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
  emptyText,
  headingId = "learn-beat-heading",
  learnedLabel = "learned from you",
  learnedNote = "learned from your approval",
  flow,
  renderMeta,
}: {
  rules: R[];
  learnedCount: number;
  /** Section eyebrow, e.g. "house rules · what every approval teaches". */
  heading: string;
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
      className="mt-5 scene-card rounded-2xl p-5"
      aria-labelledby={headingId}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2
          id={headingId}
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500"
        >
          {heading}
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          {rules.length} {rules.length === 1 ? "rule" : "rules"}
          {learnedCount > 0 ? (
            <>
              {" "}
              ·{" "}
              <span className="text-[var(--color-scene-1)]">
                {learnedCount} {learnedLabel}
              </span>
            </>
          ) : null}
        </p>
      </div>
      {rules.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-zinc-500">
          {emptyText}
        </p>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule) => (
            <RuleRow
              key={rule.id}
              rule={rule}
              learnedNote={learnedNote}
              meta={renderMeta?.(rule)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function RuleRow({
  rule,
  learnedNote,
  meta,
}: {
  rule: LearnedRule;
  learnedNote: string;
  meta?: ReactNode;
}) {
  const isDo = rule.kind === "do";
  return (
    <li
      className={[
        "rounded-lg border px-3 py-2",
        rule.fresh
          ? "pg-fresh border-[var(--color-scene-1)]/45"
          : "border-white/10 bg-white/[0.02]",
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        {/* The glyph carries the do/don't meaning, so name it for SRs
            rather than leaving them "check mark" / "ballot X". */}
        <span aria-hidden className={isDo ? "text-emerald-400" : "text-rose-400"}>
          {isDo ? "✓" : "✗"}
        </span>
        <span className="sr-only">{isDo ? "Do:" : "Don't:"}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs leading-relaxed text-zinc-200">{rule.text}</p>
          {meta ??
            (rule.learned ? (
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
                {learnedNote}
              </p>
            ) : null)}
        </div>
      </div>
    </li>
  );
}

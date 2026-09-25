// The "this is real" layer, shared by every scene: a band of outcome
// stats in clearly illustrative sample numbers, and a bridge to the
// matching case study on gravixar.com.
//
// Tiles are derived from the scene's own reducer (outcomeStats(state)),
// so a number the visitor's click moves pops rather than counting again.
// The structure (section[aria-labelledby="outcome-heading"] > dl > div >
// dt + dd) is what scripts/verify-outcomes.mjs reads; keep it.

import { CountUp } from "@/components/demo/CountUp";

export type OutcomeStat = {
  /** Big illustrative number, e.g. "1,284". */
  value: string;
  /** What it counts, e.g. "deliverables approved". */
  label: string;
  /** Optional period / qualifier, e.g. "last 90 days". */
  sub?: string;
};

export function OutcomePanel({
  stats,
  liveProductLabel,
  liveProductHref = "https://gravixar.com",
}: {
  stats: OutcomeStat[];
  /** Anonymized case-study name, e.g. "the agency OS I run". */
  liveProductLabel: string;
  liveProductHref?: string;
}) {
  return (
    <section className="surface mt-6 overflow-hidden rounded-2xl" aria-labelledby="outcome-heading">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-5 pt-5 md:px-6 md:pt-6">
        <div>
          <h2 id="outcome-heading" className="heading text-lg text-ink-50">
            Outcomes
          </h2>
          <p className="text-xs text-ink-500">What this loop ships at production scale</p>
        </div>
        <span className="chip">illustrative sample data</span>
      </div>

      {/* A dl group is dt-then-dd; `order` puts the big number on top
          visually without breaking that. */}
      <dl className="mt-5 grid grid-cols-2 border-t border-line lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            data-spot
            className={`flex flex-col px-5 py-5 md:px-6 ${i % 2 === 1 ? "border-l border-line" : ""} ${
              i >= 2 ? "border-t border-line lg:border-t-0" : ""
            } ${i >= 1 ? "lg:border-l lg:border-line" : ""}`}
          >
            <dt className="order-2 mt-1.5 text-[13px] leading-snug text-ink-300">{s.label}</dt>
            <dd className="display order-1 text-[2rem] tabular-nums text-ink-50 md:text-[2.4rem]">
              <CountUp value={s.value} />
            </dd>
            {s.sub ? <dd className="order-3 mt-1 text-[11px] leading-tight text-ink-500">{s.sub}</dd> : null}
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line bg-white/[0.012] px-5 py-4 md:px-6">
        <a
          href={liveProductHref}
          rel="noreferrer"
          className="group inline-flex items-center gap-2 text-sm font-medium text-scene-soft transition-colors hover:text-white"
        >
          <span className="link-draw">See the live product</span>
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
            ↗
          </span>
          <span className="text-xs font-normal text-ink-500">{liveProductLabel}</span>
        </a>
        <p className="text-[11px] text-ink-500">Sample numbers for the sandbox, not a real company&apos;s metrics.</p>
      </div>
    </section>
  );
}

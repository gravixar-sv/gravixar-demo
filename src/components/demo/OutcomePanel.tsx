// The "this is real" layer, shared by every scene. Two parts:
//
//  - OutcomePanel: a row of outcome stats (deliverables approved,
//    invoices sent, providers credentialed, …) in clearly-illustrative
//    sample numbers. Always labelled as demo data so a visitor never
//    reads these as a real company's KPIs.
//  - A bridge footer: "See the live product →" to the matching
//    anonymized case study on gravixar.com, plus a "this same loop runs
//    our own ops" link to book a call.
//
// Static + CSS-only, so it respects the CSS-first reveal rule and is
// reduced-motion / no-WebGL safe, and it wraps on mobile.

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
  /** Anonymized case-study name, e.g. "the agency OS we run in production". */
  liveProductLabel: string;
  /** Where "see the live product" points (anonymized case study). */
  liveProductHref?: string;
}) {
  return (
    <section
      className="mt-5 scene-card rounded-2xl p-5"
      aria-labelledby="outcome-heading"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2
          id="outcome-heading"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500"
        >
          outcomes · what this loop ships
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          illustrative sample data
        </p>
      </div>

      {/* A dl group is dt-then-dd; `order` puts the big number on top
          visually without breaking that. */}
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col rounded-xl border border-white/10 bg-black/20 p-3.5"
          >
            <dt className="order-2 mt-1 text-xs leading-tight text-zinc-300">
              {s.label}
            </dt>
            <dd className="order-1 text-2xl font-medium tabular-nums tracking-[-0.02em] text-[var(--color-scene-1)]">
              {s.value}
            </dd>
            {s.sub ? (
              <dd className="order-3 mt-0.5 text-[10px] leading-tight text-zinc-500">
                {s.sub}
              </dd>
            ) : null}
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/5 pt-4">
        <a
          href={liveProductHref}
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-scene-1)] transition-colors hover:text-white"
        >
          See the live product
          <span aria-hidden>→</span>
          <span className="font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-zinc-500">
            {liveProductLabel}
          </span>
        </a>
        <a
          href="https://gravixar.com/contact"
          rel="noreferrer"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-200"
        >
          this same loop runs our own ops →
        </a>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-zinc-500">
        Sample numbers for the sandbox, not a real company&apos;s metrics.
      </p>
    </section>
  );
}

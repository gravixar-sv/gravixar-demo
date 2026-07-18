"use client";

// Care Ledger — a HIPAA-conscious medical-billing + credentialing portal
// as a 3-column live workspace. Credentialing intake → finance/billing →
// sales pipeline, with Zoom touchpoints for the intake call and the
// discovery call, an approval gate on billing, a learn beat, and an
// audit trail. The architecture story is front and centre: no PHI in the
// portal, isolated by design. See src/lib/playground/care-ledger-data.ts.
//
// All data is illustrative sample data — no real patient, provider, or
// clinic information, and no real names.

import { useEffect, useReducer } from "react";
import {
  STAGE_LABEL,
  careLedgerReducer,
  createInitialCareLedgerState,
  type BillingItem,
  type CareLedgerEvent,
  type Deal,
  type FinanceTile,
  type Provider,
  type Rule,
  type AuditEntry,
} from "@/lib/playground/care-ledger-data";
import { SceneCTA } from "@/components/demo/SceneCTA";
import { OutcomePanel } from "@/components/demo/OutcomePanel";
import { flowPulse } from "@/lib/flowPulse";

const FRESH_DECAY_MS = 2200;

export default function CareLedgerPortal() {
  const [state, dispatch] = useReducer(
    careLedgerReducer,
    undefined,
    createInitialCareLedgerState,
  );

  useEffect(() => {
    const ids = [
      ...state.providers.filter((p) => p.fresh).map((p) => p.id),
      ...state.billing.filter((b) => b.fresh).map((b) => b.id),
      ...state.deals.filter((d) => d.fresh).map((d) => d.id),
      ...state.rules.filter((r) => r.fresh).map((r) => r.id),
      ...state.feed.filter((f) => f.fresh).map((f) => f.id),
    ];
    if (ids.length === 0) return;
    const timers = ids.map((id) =>
      window.setTimeout(() => dispatch({ type: "DECAY_FRESH", id }), FRESH_DECAY_MS),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [state.providers, state.billing, state.deals, state.rules, state.feed]);

  const credentialed = state.providers.filter((p) => p.status === "credentialed").length;
  const learnedCount = state.rules.filter((r) => r.learned).length;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10 lg:px-12">
      <div aria-hidden className="scene-conduit mb-7" />
      <header className="scene-rise flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-scene-1)]">
            billing &amp; credentialing · HIPAA-conscious · live sandbox
          </p>
          <h1 className="mt-3 text-3xl font-medium leading-tight tracking-[-0.02em] text-zinc-50 md:text-4xl">
            Credential a provider, then bill for the work.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-400">
            A medical-billing portal for a clinic network. Bring a provider
            through credentialing with a Zoom intake call, credential them, and
            billing turns on. Claims and enablement wait behind an approval gate.
            New clinics move through the sales pipeline and send their providers
            back into credentialing. <span className="text-zinc-300">No PHI ever
            touches the portal.</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {credentialed > 0 ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
              {credentialed} credentialed
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => dispatch({ type: "RESET" })}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-zinc-50 active:scale-[0.98] lg:min-h-0"
          >
            ↻ reset
          </button>
        </div>
      </header>

      <ArchitectureCallout />

      <div className="scene-columns mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:pb-0">
        {/* Credentialing intake */}
        <Col label="Credentialing" status="provider intake · Zoom touchpoint" flow="cl-cred">
          {state.providers.map((p) => (
            <ProviderCard key={p.id} p={p} dispatch={dispatch} />
          ))}
        </Col>

        {/* Finance / billing */}
        <Col label="Finance · billing" status="behind an approval gate" flow="cl-billing">
          <div className="grid grid-cols-2 gap-2">
            {state.finance.map((f) => (
              <FinanceCard key={f.id} tile={f} />
            ))}
          </div>
          <p className="mt-1 flex items-start gap-1.5 text-[11px] leading-relaxed text-zinc-300">
            <span aria-hidden className="text-[var(--color-scene-1)]">◆</span>
            <span>Codes and amounts only. No patient records here.</span>
          </p>
          {state.billing.map((b) => (
            <BillingCard key={b.id} item={b} dispatch={dispatch} />
          ))}
        </Col>

        {/* Sales pipeline */}
        <Col label="Sales pipeline" status="clinics · Zoom discovery" flow="cl-sales">
          {state.deals.map((d) => (
            <DealCard key={d.id} deal={d} dispatch={dispatch} />
          ))}
        </Col>
      </div>

      <LearnBeat rules={state.rules} learnedCount={learnedCount} />
      <OutcomePanel
        stats={[
          { value: "1,420", label: "providers credentialed", sub: "across the network" },
          { value: "$612k", label: "claims collected", sub: "this quarter" },
          { value: "9", label: "clinics onboarded", sub: "Zoom-first pipeline" },
          { value: "0", label: "PHI records stored", sub: "isolated by design" },
        ]}
        liveProductLabel="the billing portal we shipped"
      />
      <AuditTrail feed={state.feed} />

      <SceneCTA
        personaLabel="Healthcare & billing"
        noun="clinic network"
        headline="Run credentialing and billing on one rail."
        blurb="This is the HIPAA-conscious billing portal I build for clinic networks: provider credentialing, claims and finance behind an approval gate, and a Zoom-first sales pipeline, with PHI kept out of the portal by design. One call to scope it, no obligation."
      />
    </div>
  );
}

// ─── Architecture callout ───────────────────────────────────────────
// The story that sells this scene: PHI never enters the portal.

function ArchitectureCallout() {
  return (
    <section
      className="scene-rise mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-[var(--color-scene-1)]/25 bg-[var(--color-scene-1)]/[0.05] px-4 py-3"
      aria-label="Architecture note"
    >
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-scene-1)]">
        <span
          aria-hidden
          className="inline-block h-2.5 w-2.5 rounded-[3px] bg-[var(--color-scene-1)]"
        />
        architecture
      </span>
      <p className="text-[13px] leading-relaxed text-zinc-300">
        No PHI in the portal. Claims carry CPT/ICD codes and amounts; patient
        records stay in the clinic&apos;s EHR, isolated by design. The portal
        moves money and credentials, never charts.
      </p>
    </section>
  );
}

// ─── Column shell ───────────────────────────────────────────────────

function Col({
  label,
  status,
  flow,
  children,
}: {
  label: string;
  status: string;
  flow?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      data-flow={flow}
      className="scene-card min-w-[82%] shrink-0 snap-start rounded-2xl p-5 sm:min-w-[48%] lg:min-w-0"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300">{label}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{status}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

// ─── Credentialing ──────────────────────────────────────────────────

function ProviderCard({
  p,
  dispatch,
}: {
  p: Provider;
  dispatch: React.Dispatch<CareLedgerEvent>;
}) {
  const credentialed = p.status === "credentialed";
  const intakeDone = p.intake === "done";
  return (
    <div
      className={[
        "rounded-xl border p-3.5",
        p.fresh
          ? "pg-fresh border-[var(--color-scene-1)]/45"
          : credentialed
            ? "border-emerald-400/30 bg-emerald-400/[0.04]"
            : "border-white/10 bg-black/20",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-100">{p.name}</p>
          <p className="text-[11px] text-zinc-400">{p.specialty}</p>
        </div>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
          {credentialed ? "credentialed" : "in intake"}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {p.creds.map((c) => {
          const ok = c.status === "verified";
          return (
            <span
              key={c.kind}
              className={[
                "rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
                ok
                  ? "border-[var(--color-scene-1)]/40 text-[var(--color-scene-1)]"
                  : "border-amber-400/35 text-amber-300/90",
              ].join(" ")}
            >
              {ok ? "✓" : "○"} {c.kind}
            </span>
          );
        })}
      </div>

      <p className="mt-2.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em]">
        <span className="text-zinc-500">zoom intake</span>
        <span className={intakeDone ? "text-[var(--color-scene-1)]" : "text-amber-300/90"}>
          {intakeDone ? "✓ done" : "○ scheduled"}
        </span>
      </p>

      {credentialed ? (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/80">
          ✓ credentialed · billing enabled →
        </p>
      ) : intakeDone ? (
        <button
          type="button"
          onClick={(e) => {
            flowPulse(e.currentTarget, "cl-billing");
            dispatch({ type: "CREDENTIAL", id: p.id });
          }}
          className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-scene-1)] transition-all hover:bg-[var(--color-scene-1)]/20 active:scale-[0.98] lg:min-h-0"
        >
          Verify &amp; credential →
        </button>
      ) : (
        <button
          type="button"
          onClick={() => dispatch({ type: "COMPLETE_INTAKE", id: p.id })}
          className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition-all hover:bg-amber-400/20 active:scale-[0.98] lg:min-h-0"
        >
          ▸ Complete Zoom intake
        </button>
      )}
    </div>
  );
}

// ─── Finance / billing ──────────────────────────────────────────────

function FinanceCard({ tile }: { tile: FinanceTile }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">{tile.label}</p>
      <p className="mt-1 text-lg font-medium tabular-nums text-[var(--color-scene-1)]">{tile.value}</p>
      <p className="mt-0.5 text-[10px] leading-tight text-zinc-500">{tile.sub}</p>
    </div>
  );
}

function BillingCard({
  item,
  dispatch,
}: {
  item: BillingItem;
  dispatch: React.Dispatch<CareLedgerEvent>;
}) {
  const approved = item.state === "approved";
  return (
    <div
      className={[
        "rounded-xl border p-3.5",
        item.fresh
          ? "pg-fresh border-[var(--color-scene-1)]/45"
          : approved
            ? "border-emerald-400/30 bg-emerald-400/[0.04]"
            : "border-white/10 bg-black/20",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-zinc-100">{item.label}</p>
        {item.amount ? (
          <span className="shrink-0 font-mono text-[11px] text-[var(--color-scene-1)]">{item.amount}</span>
        ) : null}
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{item.detail}</p>
      {approved ? (
        <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/80">
          ✓ approved + submitted
        </p>
      ) : (
        <div className="mt-2.5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber-300/90">
            ⏸ waiting on you · gated
          </p>
          <button
            type="button"
            onClick={(e) => {
              flowPulse(e.currentTarget, "cl-rules");
              dispatch({ type: "APPROVE_BILLING", id: item.id });
            }}
            className="mt-2 inline-flex min-h-10 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition-all hover:bg-emerald-400/20 active:scale-[0.98] lg:min-h-0"
          >
            {item.source === "claims" ? "Approve & submit →" : "Approve billing →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sales pipeline ─────────────────────────────────────────────────

const STAGE_TONE: Record<Deal["stage"], string> = {
  discovery: "border-white/15 text-zinc-300",
  demo: "border-sky-400/40 text-sky-300",
  contract: "border-[var(--color-scene-1)]/45 text-[var(--color-scene-1)]",
  live: "border-emerald-400/40 text-emerald-300",
};

function DealCard({
  deal,
  dispatch,
}: {
  deal: Deal;
  dispatch: React.Dispatch<CareLedgerEvent>;
}) {
  const live = deal.stage === "live";
  return (
    <div
      className={[
        "rounded-xl border p-3.5",
        deal.fresh ? "pg-fresh border-[var(--color-scene-1)]/45" : "border-white/10 bg-black/20",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-100">{deal.clinic}</p>
          <p className="text-[11px] text-zinc-400">{deal.seats}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${STAGE_TONE[deal.stage]}`}
        >
          {STAGE_LABEL[deal.stage]}
        </span>
      </div>

      <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em]">
        <span className="text-zinc-500">zoom discovery</span>
        <span className={deal.zoom === "done" ? "text-[var(--color-scene-1)]" : "text-amber-300/90"}>
          {deal.zoom === "done" ? "✓ done" : "○ scheduled"}
        </span>
      </p>

      {live ? (
        <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/80">
          ✓ live · billing on this clinic
        </p>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            flowPulse(e.currentTarget, "cl-cred");
            dispatch({ type: "ADVANCE_DEAL", id: deal.id });
          }}
          className="mt-2.5 inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-scene-1)] transition-all hover:bg-[var(--color-scene-1)]/20 active:scale-[0.98] lg:min-h-0"
        >
          Advance stage →
        </button>
      )}
    </div>
  );
}

// ─── Learn beat ─────────────────────────────────────────────────────

function LearnBeat({ rules, learnedCount }: { rules: Rule[]; learnedCount: number }) {
  return (
    <section data-flow="cl-rules" className="mt-5 scene-card rounded-2xl p-5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          portal policy · what every approval teaches
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          {rules.length} {rules.length === 1 ? "rule" : "rules"}
          {learnedCount > 0 ? (
            <>
              {" "}
              ·{" "}
              <span className="text-[var(--color-scene-1)]">
                {learnedCount} learned from you
              </span>
            </>
          ) : null}
        </p>
      </div>
      {rules.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-zinc-500">
          Credential a provider or approve a claim batch and the portal starts a policy book.
        </p>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule) => (
            <RuleRow key={rule.id} rule={rule} />
          ))}
        </ul>
      )}
    </section>
  );
}

function RuleRow({ rule }: { rule: Rule }) {
  const isDo = rule.kind === "do";
  return (
    <li
      className={[
        "rounded-lg border px-3 py-2",
        rule.fresh ? "pg-fresh border-[var(--color-scene-1)]/45" : "border-white/10 bg-white/[0.02]",
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        <span className={isDo ? "text-emerald-400" : "text-rose-400"}>{isDo ? "✓" : "✗"}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] leading-relaxed text-zinc-200">{rule.text}</p>
          {rule.learned ? (
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
              learned from your approval
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

// ─── Audit trail ────────────────────────────────────────────────────

function AuditTrail({ feed }: { feed: AuditEntry[] }) {
  return (
    <section className="mt-5 scene-card rounded-2xl p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        audit trail · every action logged
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {feed.slice(0, 6).map((e) => (
          <li
            key={e.id}
            className={[
              "rounded-lg border px-3 py-2 text-xs leading-relaxed",
              e.fresh
                ? "pg-fresh border-[var(--color-scene-1)]/40 text-zinc-100"
                : "border-white/10 bg-white/[0.02] text-zinc-300",
            ].join(" ")}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              {formatRelative(e.ts)}
            </span>
            <p className="mt-1">
              <span className="font-mono font-medium text-zinc-200">{e.actor}</span>{" "}
              <span className="text-zinc-400">{e.action}</span>
              {e.detail ? (
                <>
                  {" "}
                  <span className="text-zinc-600">·</span>{" "}
                  <span className="text-zinc-400">{e.detail}</span>
                </>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatRelative(ts: number): string {
  const deltaSec = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (deltaSec < 30) return "just now";
  if (deltaSec < 90) return "1 min ago";
  if (deltaSec < 3600) return `${Math.round(deltaSec / 60)} min ago`;
  if (deltaSec < 7200) return "1 hr ago";
  return `${Math.round(deltaSec / 3600)} hr ago`;
}

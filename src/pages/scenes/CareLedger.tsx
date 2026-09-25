// Billing & Credentialing (Care Ledger): a HIPAA-conscious medical-billing
// and credentialing portal for a clinic network, as three panes.
// Credentialing intake (NPI, license, DEA, CAQH, with a Zoom intake call)
// -> finance and claims behind an approval gate -> the clinic sales
// pipeline, whose signed clinics send providers back into intake. See
// src/lib/playground/care-ledger-data.ts.
//
// Every card carries a view-transition-name and every action dispatches
// inside a View Transition (useSceneDispatch), so a reflow slides rather
// than jumps. The architecture story sits beside the audit trail: no PHI
// in the portal, isolated by design.
//
// All data is illustrative sample data. No real patient, provider, or
// clinic information, and no real names.

import { useEffect, type ReactNode } from "react";
import {
  STAGE_LABEL,
  careLedgerReducer,
  createInitialCareLedgerState,
  financeTiles,
  outcomeStats,
  trySteps,
  type BillingItem,
  type CareLedgerEvent,
  type CareLedgerState,
  type Credential,
  type Deal,
  type DealStage,
  type Provider,
} from "@/lib/playground/care-ledger-data";
import { formatAmount, formatMoney } from "@/lib/playground/outcomeFormat";
import { Avatar, type AvatarHue } from "@/components/demo/Avatar";
import { SceneLayout } from "@/components/demo/SceneLayout";
import { SceneIntro } from "@/components/demo/SceneIntro";
import { ActivityLog, EmptyState, ItemCard, Pane, Workspace } from "@/components/demo/Workspace";
import { LearnBeat } from "@/components/demo/LearnBeat";
import { OutcomePanel } from "@/components/demo/OutcomePanel";
import { SceneCTA } from "@/components/demo/SceneCTA";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { flowPulse } from "@/lib/flowPulse";
import { useSceneDispatch } from "@/lib/useSceneDispatch";
import { useStartHint } from "@/lib/useStartHint";
import { vtName } from "@/lib/viewTransition";

const FRESH_DECAY_MS = 2200;

type Dispatch = React.Dispatch<CareLedgerEvent>;

export default function CareLedgerPage() {
  return (
    <SceneLayout slug="care-ledger">
      <CareLedgerPortal />
    </SceneLayout>
  );
}

function CareLedgerPortal() {
  const [state, dispatch] = useSceneDispatch(careLedgerReducer, createInitialCareLedgerState);
  const { hint, endHint } = useStartHint();

  useEffect(() => {
    const ids = [
      ...state.providers.filter((p) => p.fresh).map((p) => p.id),
      ...state.billing.filter((b) => b.fresh).map((b) => b.id),
      ...state.deals.filter((d) => d.fresh).map((d) => d.id),
      ...state.rules.filter((r) => r.fresh).map((r) => r.id),
      ...state.feed.filter((f) => f.fresh).map((f) => f.id),
    ];
    if (ids.length === 0) return;
    const timers = ids.map((id) => window.setTimeout(() => dispatch({ type: "DECAY_FRESH", id }), FRESH_DECAY_MS));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [state.providers, state.billing, state.deals, state.rules, state.feed, dispatch]);

  const credentialed = state.providers.filter((p) => p.status === "credentialed").length;
  const inIntake = state.providers.length - credentialed;
  const gated = state.billing.filter((b) => b.state === "pending").length;
  const openDeals = state.deals.filter((d) => d.stage !== "live").length;
  const learnedCount = state.rules.filter((r) => r.learned).length;

  return (
    <>
      <SceneIntro
        slug="care-ledger"
        title="Credential a provider, then bill for the work."
        lede={
          <>
            A billing portal for a clinic network, where claims wait behind an approval gate and signed clinics feed
            the credentialing queue. <span className="text-ink-200">No PHI ever touches the portal.</span>
          </>
        }
        steps={trySteps(state)}
        onReset={() => dispatch({ type: "RESET" })}
        status={
          credentialed > 0 ? (
            <span key={credentialed} className="chip chip-positive pop-in">
              ✓ {credentialed} credentialed
            </span>
          ) : null
        }
      />

      <Workspace
        slug="care-ledger"
        board="Clinic network · credentialing & billing"
        cols="lg:grid-cols-[1.12fr_1fr_1fr]"
        onClickCapture={endHint}
        toolbar={
          <span className="chip hidden md:inline-flex">
            <LockGlyph />
            No PHI in the portal
          </span>
        }
      >
        <Pane
          id="care-ledger-cred"
          flow="cl-cred"
          lead={<PaneIcon kind="cred" />}
          title="Credentialing"
          tag="Intake"
          sub="Provider intake · Zoom touchpoint"
          count={inIntake}
          status="Providers"
        >
          <StatStrip
            items={[
              { label: "In intake", value: String(inIntake) },
              { label: "Credentialed", value: String(credentialed), tone: credentialed > 0 ? "positive" : undefined },
            ]}
          />
          {state.providers.map((p, i) => (
            <ProviderCard key={p.id} p={p} dispatch={dispatch} hint={hint && i === 0} />
          ))}
          <EmptyState show={state.providers.length === 0}>No providers in intake right now.</EmptyState>
        </Pane>

        <Pane
          id="care-ledger-billing"
          flow="cl-billing"
          lead={<PaneIcon kind="billing" />}
          title="Finance"
          tag="Gated"
          sub="Claims and billing behind an approval gate"
          count={gated}
          status="Approval gate"
        >
          <FinanceStrip state={state} />
          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-ink-400">
            <LockGlyph className="mt-[3px] text-scene-soft" />
            <span>Codes and amounts only. No patient records here.</span>
          </p>
          {state.billing.map((b) => (
            <BillingCard key={b.id} item={b} dispatch={dispatch} />
          ))}
          <EmptyState show={state.billing.length === 0}>Nothing waiting on your approval.</EmptyState>
        </Pane>

        <Pane
          id="care-ledger-sales"
          flow="cl-sales"
          lead={<PaneIcon kind="sales" />}
          title="Sales pipeline"
          tag="Clinics"
          sub="New clinics · Zoom discovery"
          count={openDeals}
          status="Deals"
        >
          <StatStrip
            items={STAGES.map((s) => ({
              label: STAGE_SHORT[s],
              value: String(state.deals.filter((d) => d.stage === s).length),
              tone: s === "live" ? ("positive" as const) : undefined,
            }))}
          />
          {state.deals.map((d) => (
            <DealCard key={d.id} deal={d} dispatch={dispatch} />
          ))}
          <EmptyState show={state.deals.length === 0}>No clinics in the pipeline.</EmptyState>
        </Pane>
      </Workspace>

      <LearnBeat
        rules={state.rules}
        learnedCount={learnedCount}
        flow="cl-rules"
        headingId="care-ledger-rules-heading"
        heading="Portal policy"
        sub="What every approval teaches the portal"
        learnedLabel="learned from you"
        emptyText="Credential a provider or approve a claim batch and the portal starts a policy book."
        renderMeta={(rule) => (
          <p className="mt-1 text-[11px] text-ink-500">
            {rule.learned ? (
              <span className="font-medium text-scene-soft">Learned from your approval</span>
            ) : (
              <span>House policy</span>
            )}
          </p>
        )}
      />
      <OutcomePanel stats={outcomeStats(state)} liveProductLabel="the billing portal I shipped" />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <ActivityLog
          id="care-ledger-audit"
          title="Audit trail"
          sub="Every action, logged as it happens"
          entries={state.feed}
          vtPrefix="cl-feed"
        />
        <ArchitecturePanel />
      </div>

      <SceneCTA
        personaLabel="Healthcare & billing"
        noun="clinic network"
        headline={
          <>
            Run credentialing and billing <span className="voice font-normal text-scene-soft">on one rail.</span>
          </>
        }
        blurb="This is the HIPAA-conscious billing portal I build for clinic networks: provider credentialing, claims and finance behind an approval gate, and a Zoom-first sales pipeline, with PHI kept out of the portal by design. One call to scope it, no obligation."
      />
    </>
  );
}

// ─── Pane furniture ─────────────────────────────────────────────────

function PaneIcon({ kind }: { kind: "cred" | "billing" | "sales" }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--color-scene-1)_30%,transparent)] bg-[color-mix(in_oklab,var(--color-scene-1)_8%,transparent)] text-scene-soft"
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        {kind === "cred" ? (
          <>
            <rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1.5" />
            <circle cx="5.5" cy="7.25" r="1.5" />
            <path d="M3.5 10.75c.4-1 1.1-1.5 2-1.5s1.6.5 2 1.5M9.5 6.5h3M9.5 9h2" />
          </>
        ) : kind === "billing" ? (
          <>
            <path d="M3.25 1.75h9.5v12.5l-1.6-1-1.6 1-1.55-1-1.6 1-1.55-1-1.6 1z" />
            <path d="M5.5 5h5M5.5 7.5h5M5.5 10h3" />
          </>
        ) : (
          <path d="M1.75 2.75h12.5l-4.5 5.5v4.5l-3.5 1.5v-6z" />
        )}
      </svg>
    </span>
  );
}

function LockGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 12 12" className={cn("h-3 w-3 shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="2.25" y="5.25" width="7.5" height="5.25" rx="1.2" />
      <path d="M4 5.25V3.75a2 2 0 0 1 4 0v1.5" strokeLinecap="round" />
    </svg>
  );
}

type StatItem = { label: string; value: string; sub?: ReactNode; tone?: "positive" };

/** A ledger row of figures: hairlines, not tiles. Values pop when they move. */
function StatStrip({ items }: { items: StatItem[] }) {
  return (
    <dl
      className="grid divide-x divide-line border-y border-line"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((s) => (
        <div key={s.label} className="flex min-w-0 flex-col px-3 py-2.5 first:pl-0.5">
          <dt className="order-2 mt-0.5 truncate text-[11px] text-ink-500">{s.label}</dt>
          <dd className="order-1">
            <span
              key={s.value}
              className={cn(
                "pop-in inline-block font-mono text-[15px] tabular-nums",
                s.tone === "positive" ? "text-emerald-300" : "text-ink-50",
              )}
            >
              {s.value}
            </span>
          </dd>
          {s.sub ? <dd className="order-3 mt-0.5 truncate text-[10.5px] text-ink-500">{s.sub}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

/** Collected and A/R, from the same projection the outcome tiles read. */
function FinanceStrip({ state }: { state: CareLedgerState }) {
  const cleared = state.billing
    .filter((b) => b.state === "approved" && b.source === "claims")
    .reduce((sum, b) => sum + (b.amountUsd ?? 0), 0);
  const delta = cleared > 0 ? formatMoney("$", cleared) : null;
  return (
    <StatStrip
      items={financeTiles(state).map((f) => ({
        label: `${f.label} · ${f.sub}`,
        value: f.value,
        sub: delta ? (
          <span key={delta} className="pop-in inline-block font-mono text-emerald-300/90">
            {f.id === "f-paid" ? `+${delta} approved` : `−${delta} cleared`}
          </span>
        ) : undefined,
      }))}
    />
  );
}

// ─── Credentialing ──────────────────────────────────────────────────

const PROVIDER_HUES: AvatarHue[] = [
  { from: "#5EEAD4", to: "#0F766E", ink: "#042F2E" },
  { from: "#7DD3FC", to: "#0369A1", ink: "#082F49" },
  { from: "#C4B5FD", to: "#6D28D9", ink: "#1E1033" },
  { from: "#FCD34D", to: "#B45309", ink: "#2A1405" },
];

/** Small, stable string hash for illustrative IDs and hues. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function initialsOf(name: string): string {
  const parts = name.replace(/^Dr\.\s*/, "").split(/\s+/).filter(Boolean);
  return parts.map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

/** A masked, illustrative credential number: "···4821". */
function maskedId(providerName: string, kind: Credential["kind"]): string {
  return `···${String(hash(`${providerName}:${kind}`) % 10000).padStart(4, "0")}`;
}

function ProviderCard({ p, dispatch, hint = false }: { p: Provider; dispatch: Dispatch; hint?: boolean }) {
  const credentialed = p.status === "credentialed";
  const intakeDone = p.intake === "done";
  // "Verify & credential" verifies whatever is outstanding, so once a
  // provider is credentialed every credential reads verified.
  const creds = p.creds.map((c) => ({ ...c, status: credentialed ? ("verified" as const) : c.status }));
  const verified = creds.filter((c) => c.status === "verified").length;

  return (
    <ItemCard vt={vtName("cl-prov", p.id)} fresh={p.fresh} tone={credentialed ? "positive" : "accent"}>
      <div className="flex items-start gap-3">
        <Avatar initials={initialsOf(p.name)} hue={PROVIDER_HUES[hash(p.name) % PROVIDER_HUES.length]!} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-snug text-ink-50">{p.name}</p>
          <p className="mt-0.5 text-[11px] text-ink-400">{p.specialty}</p>
        </div>
        <span
          key={p.status}
          className={cn("chip shrink-0", credentialed ? "chip-positive" : "chip-caution", p.fresh && "pop-in")}
        >
          {credentialed ? "Credentialed" : "In intake"}
        </span>
      </div>

      <ul aria-label={`${p.name} credentials`} className="mt-3.5 grid grid-cols-2 gap-1.5">
        {creds.map((c) => {
          const ok = c.status === "verified";
          return (
            <li
              key={`${c.kind}-${c.status}`}
              className={cn(
                "flex min-w-0 items-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px]",
                ok
                  ? "border-emerald-400/25 bg-emerald-400/[0.05] text-emerald-200"
                  : "border-dashed border-amber-400/35 bg-amber-400/[0.04] text-amber-200",
                p.fresh && "pop-in",
              )}
            >
              <span aria-hidden className={cn("w-3 text-center", ok ? "text-emerald-300" : "text-amber-300")}>
                {ok ? "✓" : "○"}
              </span>
              <span className="font-semibold">{c.kind}</span>
              <span className="sr-only">{ok ? "verified" : "pending"}</span>
              <span className="ml-auto truncate font-mono text-[10.5px] tabular-nums text-ink-400">
                {maskedId(p.name, c.kind)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-ink-400">
          <ZoomGlyph />
          Zoom intake
          <span
            key={p.intake}
            className={cn("font-medium", intakeDone ? "text-emerald-300" : "text-amber-300", p.fresh && "pop-in inline-block")}
          >
            {intakeDone ? "done" : "scheduled"}
          </span>
        </span>
        <span className="ml-auto inline-flex items-center gap-2">
          <span aria-hidden className="h-1 w-14 overflow-hidden rounded-full bg-white/[0.08]">
            <span
              className="block h-full origin-left rounded-full bg-emerald-400/80 transition-transform duration-500 ease-[var(--ease-out)]"
              style={{ transform: `scaleX(${verified / creds.length})` }}
            />
          </span>
          <span className="font-mono tabular-nums text-ink-400">
            {verified}/{creds.length} verified
          </span>
        </span>
      </div>

      {credentialed ? (
        <p className="mt-3 text-[11px] font-medium text-emerald-300/90">
          <span aria-hidden>✓</span> Credentialed · billing enabled <span aria-hidden>→</span>
        </p>
      ) : intakeDone ? (
        <Button
          variant="accent"
          size="sm"
          arrow
          hint={hint}
          className="mt-3"
          onClick={(e) => {
            flowPulse(e.currentTarget, "cl-billing");
            dispatch({ type: "CREDENTIAL", id: p.id });
          }}
        >
          Verify &amp; credential
        </Button>
      ) : (
        <Button
          variant="caution"
          size="sm"
          icon={<ZoomGlyph />}
          hint={hint}
          className="mt-3"
          onClick={() => dispatch({ type: "COMPLETE_INTAKE", id: p.id })}
        >
          Complete Zoom intake
        </Button>
      )}
    </ItemCard>
  );
}

function ZoomGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 14 10" className="h-2.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="0.75" y="1.25" width="8.5" height="7.5" rx="1.6" />
      <path d="M9.25 4.25 13.25 2v6l-4-2.25" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Finance / billing ──────────────────────────────────────────────

function BillingCard({ item, dispatch }: { item: BillingItem; dispatch: Dispatch }) {
  const approved = item.state === "approved";
  return (
    <ItemCard vt={vtName("cl-bill", item.id)} fresh={item.fresh} tone={approved ? "positive" : "accent"}>
      <p className="label-mono">{item.source === "claims" ? "Claims" : "Billing enablement"}</p>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <p className="min-w-0 text-sm font-semibold leading-snug text-ink-50">{item.label}</p>
        {item.amountUsd ? (
          <span className="shrink-0 font-mono text-[13px] tabular-nums text-ink-50">
            {formatAmount("$", item.amountUsd)}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-ink-400">{item.detail}</p>
      {/* The gate flips waiting -> approved in place, so the stable
          wrapper announces it. */}
      <div aria-live="polite" className="mt-3 border-t border-line pt-3">
        {approved ? (
          <span key="approved" className={cn("chip chip-positive", item.fresh && "pop-in")}>
            <span aria-hidden>✓</span> Approved + submitted
          </span>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="chip chip-caution">
              <LockGlyph /> Gated · waiting on you
            </span>
            <Button
              variant="positive"
              size="sm"
              arrow
              onClick={(e) => {
                flowPulse(e.currentTarget, "cl-rules");
                dispatch({ type: "APPROVE_BILLING", id: item.id });
              }}
            >
              {item.source === "claims" ? "Approve & submit" : "Approve billing"}
            </Button>
          </div>
        )}
      </div>
    </ItemCard>
  );
}

// ─── Sales pipeline ─────────────────────────────────────────────────

const STAGES: DealStage[] = ["discovery", "demo", "contract", "live"];
const STAGE_SHORT: Record<DealStage, string> = {
  discovery: "Discovery",
  demo: "Demo",
  contract: "Contract",
  live: "Live",
};
const STAGE_CHIP: Record<DealStage, string> = {
  discovery: "",
  demo: "chip-accent",
  contract: "chip-accent",
  live: "chip-positive",
};
/** What the button does from each stage, named for the move it makes. */
const ADVANCE_LABEL: Record<Exclude<DealStage, "live">, string> = {
  discovery: "Advance to demo",
  demo: "Mark contract signed",
  contract: "Take the clinic live",
};

function DealCard({ deal, dispatch }: { deal: Deal; dispatch: Dispatch }) {
  const live = deal.stage === "live";
  const idx = STAGES.indexOf(deal.stage);
  return (
    <ItemCard vt={vtName("cl-deal", deal.id)} fresh={deal.fresh} tone={live ? "positive" : "accent"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-snug text-ink-50">{deal.clinic}</p>
          <p className="mt-0.5 text-[11px] text-ink-400">{deal.seats}</p>
        </div>
        <span key={deal.stage} className={cn("chip shrink-0", STAGE_CHIP[deal.stage], deal.fresh && "pop-in")}>
          {STAGE_LABEL[deal.stage]}
        </span>
      </div>

      <div className="mt-3.5" aria-label={`Stage ${idx + 1} of ${STAGES.length}: ${STAGE_LABEL[deal.stage]}`} role="img">
        <div className="grid grid-cols-4 gap-1">
          {STAGES.map((s, i) => (
            <span
              key={s}
              className={cn(
                "h-1 rounded-full transition-colors duration-500",
                i <= idx ? (live ? "bg-emerald-400/80" : "bg-scene") : "bg-white/[0.08]",
              )}
            />
          ))}
        </div>
        <div aria-hidden className="mt-1.5 grid grid-cols-4 gap-1 text-[10px]">
          {STAGES.map((s, i) => (
            <span key={s} className={cn("truncate", i === idx ? "font-medium text-ink-100" : "text-ink-500")}>
              {STAGE_SHORT[s]}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-400">
          <ZoomGlyph />
          Zoom discovery
          <span className={cn("font-medium", deal.zoom === "done" ? "text-emerald-300" : "text-amber-300")}>
            {deal.zoom === "done" ? "done" : "scheduled"}
          </span>
        </span>
        {live ? (
          <span className="text-[11px] font-medium text-emerald-300/90">
            <span aria-hidden>✓</span> Live · billing on this clinic
          </span>
        ) : (
          <Button
            variant="accent"
            size="sm"
            arrow
            onClick={(e) => {
              flowPulse(e.currentTarget, "cl-cred");
              dispatch({ type: "ADVANCE_DEAL", id: deal.id });
            }}
          >
            {ADVANCE_LABEL[deal.stage as Exclude<DealStage, "live">]}
          </Button>
        )}
      </div>
    </ItemCard>
  );
}

// ─── Architecture ───────────────────────────────────────────────────
// The story that sells this scene: PHI never enters the portal. A calm
// spec sheet with one boundary diagram, not a grid of cards.

const SPEC: { k: string; v: string }[] = [
  { k: "In the portal", v: "Provider credentials, CPT/ICD codes, claim amounts" },
  { k: "Stays in the EHR", v: "Charts and patient records, the clinic's system of record" },
  { k: "Gate", v: "Claim batches and billing enablement wait for a human" },
  { k: "Audit", v: "Every action logged with who did it and when" },
];

function ArchitecturePanel() {
  return (
    <section className="surface rounded-2xl p-5 md:p-6" aria-labelledby="care-ledger-arch-heading">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="care-ledger-arch-heading" className="heading text-lg text-ink-50">
          Architecture
        </h2>
        <p className="text-xs text-ink-500">Isolated by design</p>
      </div>
      <p className="mt-3 max-w-[62ch] text-[13.5px] leading-relaxed text-ink-300">
        No PHI in the portal. Claims carry CPT/ICD codes and amounts; patient records stay in the clinic&apos;s EHR,
        isolated by design. The portal moves money and credentials, never charts.
      </p>

      <figure className="mt-5" aria-label="Data flow: clinic EHR, then the Care Ledger portal, then payers. PHI stops at the EHR boundary.">
        <div className="flex flex-col items-stretch gap-0 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
          <Node label="Clinic EHR" sub="Charts · PHI" variant="outside" />
          <Connector kind="boundary" text="PHI stops here" />
          <Node label="Care Ledger" sub="Codes · amounts" variant="portal" />
          <Connector kind="flow" text="claims by code" />
          <Node label="Payers" sub="Clearinghouse" variant="plain" />
        </div>
      </figure>

      <dl className="mt-5 divide-y divide-line border-t border-line">
        {SPEC.map((s) => (
          <div key={s.k} className="group grid gap-x-4 gap-y-0.5 py-2.5 sm:grid-cols-[9rem_minmax(0,1fr)]">
            <dt className="label-mono pt-px transition-colors group-hover:text-ink-300">{s.k}</dt>
            <dd className="text-[13px] leading-relaxed text-ink-300">{s.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Node({ label, sub, variant }: { label: string; sub: string; variant: "outside" | "portal" | "plain" }) {
  return (
    <div
      className={cn(
        "rounded-xl px-3.5 py-3 text-center",
        variant === "outside" && "border border-dashed border-white/[0.14] text-ink-400",
        variant === "portal" &&
          "border border-[color-mix(in_oklab,var(--color-scene-1)_45%,transparent)] bg-[color-mix(in_oklab,var(--color-scene-1)_9%,transparent)] text-scene-soft",
        variant === "plain" && "border border-line-strong text-ink-200",
      )}
    >
      <p className="text-[13px] font-semibold">{label}</p>
      <p className="mt-0.5 font-mono text-[10.5px] text-ink-500">{sub}</p>
    </div>
  );
}

function Connector({ kind, text }: { kind: "boundary" | "flow"; text: string }) {
  const boundary = kind === "boundary";
  return (
    <div className="flex items-center justify-center gap-2 py-2 sm:flex-col sm:gap-1 sm:px-2 sm:py-0">
      <span className="flex flex-col items-center sm:w-full sm:flex-row sm:justify-center" aria-hidden>
        <span
          className={cn(
            "h-4 w-px sm:h-px sm:w-7",
            boundary ? "border-l border-dashed border-rose-300/50 sm:border-l-0 sm:border-t" : "bg-[color-mix(in_oklab,var(--color-scene-1)_60%,transparent)]",
          )}
        />
        <span
          className={cn(
            "mx-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px]",
            boundary ? "bg-rose-400/12 text-rose-300" : "text-scene-soft",
          )}
        >
          {boundary ? "✕" : "→"}
        </span>
        <span
          className={cn(
            "h-4 w-px sm:h-px sm:w-7",
            boundary ? "border-l border-dashed border-rose-300/50 sm:border-l-0 sm:border-t" : "bg-[color-mix(in_oklab,var(--color-scene-1)_60%,transparent)]",
          )}
        />
      </span>
      <span className={cn("text-[10px] font-medium", boundary ? "text-rose-300/90" : "text-ink-500")}>{text}</span>
    </div>
  );
}

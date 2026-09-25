// Brand Guardian (Northbeam): a brand AGENT for a DTC team, as one app.
// Requests (plain briefs) > Brand agent (drafts on-brand, or BLOCKS drift
// at the guardrail) > Brand memory (the do/don't rules it LEARNS from
// your decisions). Approve a draft and a rule lands in the memory pane;
// send one back and it learns what to avoid. Activity underneath.
// See src/lib/playground/northbeam-data.ts.
//
// Exception on record: this scene's rules ARE a column (the memory
// pane), so it renders the shared RuleRow inside a Pane rather than the
// shared LearnBeat section. The "N learned from you" count line lives in
// that pane's status, which is what scripts/verify-learn-beat.mjs reads.
//
// Layout: SceneLayout > SceneIntro > Workspace (3 panes) > OutcomePanel
// > ActivityLog + Brand kit > SceneCTA.

import { useEffect, useRef, type ReactNode } from "react";
import {
  createInitialNorthbeamState,
  northbeamReducer,
  outcomeStats,
  trySteps,
  type BrandRequest,
  type BrandRule,
  type Draft,
  type Gate,
  type NorthbeamEvent,
  type NorthbeamState,
} from "@/lib/playground/northbeam-data";
import type { DeliverableKind } from "@/lib/playground/lattice-deliverables";
import { MockupThumb } from "@/components/demo/DeliverableMockup";
import { SceneLayout } from "@/components/demo/SceneLayout";
import { SceneIntro } from "@/components/demo/SceneIntro";
import { ActivityLog, EmptyState, ItemCard, Pane, Workspace } from "@/components/demo/Workspace";
import { RuleRow } from "@/components/demo/LearnBeat";
import { OutcomePanel } from "@/components/demo/OutcomePanel";
import { SceneCTA } from "@/components/demo/SceneCTA";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { flowPulse } from "@/lib/flowPulse";
import { useSceneDispatch } from "@/lib/useSceneDispatch";
import { useStartHint } from "@/lib/useStartHint";
import { vtName } from "@/lib/viewTransition";

const FRESH_DECAY_MS = 2200;

// Northbeam Goods' own palette (the fictional brand's, not the site's).
// The artwork below draws in it, the same as the MockupThumb art.
const NB = {
  ground: "#121a0e",
  groundDeep: "#10160c",
  band: "#18220f",
  sage: "#9DBE6E",
  cream: "#F2DDC1",
  paper: "#f5f5f7",
  mist: "#c3cbb8",
} as const;

type Dispatch = React.Dispatch<NorthbeamEvent>;

export default function NorthbeamPage() {
  return (
    <SceneLayout slug="northbeam">
      <NorthbeamBrandAgent />
    </SceneLayout>
  );
}

function NorthbeamBrandAgent() {
  const [state, dispatch] = useSceneDispatch(northbeamReducer, createInitialNorthbeamState);
  const { hint, endHint } = useStartHint();

  useEffect(() => {
    const ids = [
      ...state.rules.filter((r) => r.fresh).map((r) => r.id),
      ...state.feed.filter((f) => f.fresh).map((f) => f.id),
    ];
    if (ids.length === 0) return;
    const timers = ids.map((id) => window.setTimeout(() => dispatch({ type: "DECAY_FRESH", id }), FRESH_DECAY_MS));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [state.rules, state.feed, dispatch]);

  const learnedCount = state.rules.filter((r) => r.learned).length;
  const houseCount = state.rules.length - learnedCount;
  const openCount = state.requests.filter((r) => r.status === "open").length;
  const published = state.requests.filter((r) => r.status === "published").length;
  const firstOnBrand = state.requests.find((r) => r.status === "open" && !r.offBrand)?.id;

  return (
    <>
      <SceneIntro
        slug="northbeam"
        title="Teach an agent your brand."
        lede={
          <>
            The brand agent I ship to DTC teams. It drafts every brief in the brand&apos;s voice, stops off-brand asks
            at the guardrail, and <span className="text-ink-200">learns a do or a don&apos;t from every call you make</span>.
          </>
        }
        steps={trySteps(state)}
        onReset={() => dispatch({ type: "RESET" })}
        status={
          published > 0 ? (
            <span key={published} className="chip chip-positive pop-in">
              ✓ {published} published
            </span>
          ) : null
        }
      />

      <Workspace
        slug="northbeam"
        board="Spring campaign · request desk"
        cols="lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.3fr)_minmax(0,0.92fr)]"
        onClickCapture={endHint}
        toolbar={
          <span className="chip hidden md:inline-flex">
            <ShieldGlyph className="h-3 w-3 text-scene-soft" />
            Guardrail on
          </span>
        }
      >
        <Pane
          id="northbeam-requests"
          lead={
            <PaneGlyph>
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M2 9.5V12a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 14 12V9.5M2 9.5 3.8 3.4A1.3 1.3 0 0 1 5 2.5h6a1.3 1.3 0 0 1 1.2.9L14 9.5M2 9.5h3.2l.8 1.6h4l.8-1.6H14" strokeLinejoin="round" />
              </svg>
            </PaneGlyph>
          }
          title="Requests"
          tag="Team"
          sub="Plain briefs, straight from the team"
          count={openCount}
          status="Open briefs"
        >
          {state.requests.map((r) => (
            <RequestCard
              key={r.id}
              req={r}
              active={state.current === r.id}
              gate={state.gate}
              dispatch={dispatch}
              hint={hint && r.id === firstOnBrand}
            />
          ))}
        </Pane>

        <Pane
          id="northbeam-agent"
          flow="nb-agent"
          className="lg:bg-white/[0.012]"
          lead={
            <PaneGlyph tinted>
              <span className="agent-orb" />
            </PaneGlyph>
          }
          title="Brand agent"
          tag="AI"
          sub="Drafts on-brand, you approve"
          status={<GateStatus gate={state.gate} />}
        >
          <AgentDesk state={state} dispatch={dispatch} />
        </Pane>

        <Pane
          id="northbeam-memory"
          flow="nb-memory"
          lead={
            <PaneGlyph tinted>
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M2.5 3.5c2-.8 3.8-.8 5.5.5v9c-1.7-1.3-3.5-1.3-5.5-.5v-9Zm11 0c-2-.8-3.8-.8-5.5.5v9c1.7-1.3 3.5-1.3 5.5-.5v-9Z" strokeLinejoin="round" />
              </svg>
            </PaneGlyph>
          }
          title="Brand memory"
          tag="Rules"
          sub="Every decision teaches a do or a don't"
          count={state.rules.length}
          status={
            <>
              {/* Keyed on the count so each increment pops into place. */}
              <span key={learnedCount} className={cn("inline-block", learnedCount > 0 && "pop-in text-scene-soft")}>
                {learnedCount} learned from you
              </span>
              <span aria-hidden> · </span>
              {houseCount} house {houseCount === 1 ? "rule" : "rules"}
            </>
          }
        >
          <EmptyState show={state.rules.length === 0}>Approve a draft and the memory starts here.</EmptyState>
          {state.rules.length > 0 ? (
            <ul className="space-y-2.5">
              {state.rules.map((r) => (
                <RuleRow key={r.id} rule={{ ...r, learned: !!r.learned }} meta={<RuleMeta rule={r} gate={state.gate} />} />
              ))}
            </ul>
          ) : null}
        </Pane>
      </Workspace>

      <OutcomePanel stats={outcomeStats(state)} liveProductLabel="the brand agent I ship" />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <ActivityLog id="northbeam-activity" sub="Every draft, block and decision, logged" entries={state.feed} vtPrefix="nb-feed" />
        <BrandKit />
      </div>

      <SceneCTA
        personaLabel="Brands & DTC"
        noun="brand agent"
        headline={
          <>
            Give your brand an agent that <span className="voice font-normal text-scene-soft">holds the line.</span>
          </>
        }
        blurb="I build brand agents like this for DTC teams: on-brand drafts, a guardrail that blocks drift, and a memory that learns your rules from every approval. One call to scope it, no obligation."
      />
    </>
  );
}

// ─── Pane furniture ─────────────────────────────────────────────────

function PaneGlyph({ tinted = false, children }: { tinted?: boolean; children: ReactNode }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
        tinted
          ? "border-[color-mix(in_oklab,var(--color-scene-1)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-scene-1)_10%,transparent)] text-scene-soft"
          : "border-line-strong bg-white/[0.03] text-ink-300",
      )}
    >
      {children}
    </span>
  );
}

function ShieldGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1.8 13 3.6v4c0 3.1-2.1 5.4-5 6.6-2.9-1.2-5-3.5-5-6.6v-4L8 1.8Z" strokeLinejoin="round" />
      <path d="m5.8 8 1.6 1.6L10.4 6.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const GATE_STATUS: Record<Gate, { text: string; tone: string }> = {
  idle: { text: "Standing by", tone: "text-ink-500" },
  pending: { text: "Waiting on you", tone: "text-amber-300/90" },
  blocked: { text: "Held at the guardrail", tone: "text-rose-300/90" },
  approved: { text: "Published", tone: "text-emerald-300/90" },
  changed: { text: "Sent back", tone: "text-amber-300/90" },
};

function GateStatus({ gate }: { gate: Gate }) {
  const s = GATE_STATUS[gate];
  return (
    <span key={gate} className={cn("inline-block", gate !== "idle" && "pop-in", s.tone)}>
      {s.text}
    </span>
  );
}

// ─── Requests ───────────────────────────────────────────────────────

function RequestCard({
  req,
  active,
  gate,
  dispatch,
  hint = false,
}: {
  req: BrandRequest;
  active: boolean;
  gate: Gate;
  dispatch: Dispatch;
  /** "Start here" ring on generate, until the visitor's first click. */
  hint?: boolean;
}) {
  const withAgent = active && (gate === "pending" || gate === "blocked");
  const done = req.status !== "open";

  return (
    <ItemCard
      vt={vtName("nb-req", req.id)}
      tone={req.status === "published" ? "positive" : "accent"}
      className={cn(
        active &&
          !done &&
          "border-[color-mix(in_oklab,var(--color-scene-1)_45%,transparent)] bg-[color-mix(in_oklab,var(--color-scene-1)_6%,var(--color-ink-850))]",
        req.status === "dropped" && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <MockupThumb kind={req.kind} brand="northbeam" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-ink-50">{req.title}</p>
          <p className="mt-1 text-[12px] leading-snug text-ink-300">&ldquo;{req.brief}&rdquo;</p>
          <p className="mt-1 text-[11px] text-ink-500">{req.by}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {req.status === "published" ? (
          <span className="chip chip-positive">
            <span aria-hidden>✓</span> Approved + published
          </span>
        ) : req.status === "dropped" ? (
          <span className="chip">
            <span aria-hidden>✕</span> Dropped · off-brand
          </span>
        ) : withAgent ? (
          <span className={cn("chip", gate === "blocked" ? "chip-danger" : "chip-accent")}>
            <span aria-hidden className="live-dot" />
            {gate === "blocked" ? "Held at the guardrail" : "With the agent"}
          </span>
        ) : (
          <Button
            variant={req.offBrand ? "caution" : "accent"}
            size="sm"
            icon="▸"
            hint={hint}
            onClick={(e) => {
              flowPulse(e.currentTarget, "nb-agent");
              dispatch({ type: "GENERATE", id: req.id });
            }}
          >
            {req.offBrand ? "Generate (watch the guardrail)" : "Generate on-brand"}
          </Button>
        )}
      </div>
    </ItemCard>
  );
}

// ─── The agent's desk: the hero of the scene ────────────────────────

function AgentDesk({ state, dispatch }: { state: NorthbeamState; dispatch: Dispatch }) {
  const { draft, gate } = state;

  // A gate decision replaces the buttons with a status line (and DROP
  // clears the desk entirely), so focus would fall to <body>. Move it
  // to whichever region took their place. Generating doesn't arm this:
  // that button lives in the Requests pane and its card stays mounted.
  const landingRef = useRef<HTMLDivElement>(null);
  const decidedRef = useRef(false);
  useEffect(() => {
    if (!decidedRef.current) return;
    decidedRef.current = false;
    landingRef.current?.focus();
  }, [gate, draft]);

  const decide = (event: NorthbeamEvent, from?: HTMLElement) => {
    if (from) flowPulse(from, "nb-memory");
    decidedRef.current = true;
    dispatch(event);
  };

  if (!draft) {
    return (
      <div
        ref={landingRef}
        tabIndex={-1}
        className="bg-dot-grid flex min-h-[22rem] flex-col items-center justify-center gap-5 rounded-xl border border-dashed border-white/[0.1] px-6 py-14 text-center outline-none lg:min-h-[30rem]"
      >
        <span
          aria-hidden
          className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--color-scene-1)_30%,transparent)] bg-[color-mix(in_oklab,var(--color-scene-1)_7%,transparent)]"
        >
          <span className="agent-orb" />
        </span>
        <div>
          <p className="text-[15px] font-semibold text-ink-100">The agent is standing by.</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-400">
            Pick a request on the left and it drafts on-brand here.
          </p>
        </div>
        <p className="max-w-[34ch] text-[12px] leading-relaxed text-ink-500">
          Each draft lands with a preview, its copy, the brand checks it passed, and your call to approve or send it
          back.
        </p>
      </div>
    );
  }

  const isDrift = draft.mode === "drift";
  const req = state.requests.find((r) => r.id === draft.requestId);
  // Every new draft or block moves the tally, so this re-runs the
  // write-in stagger even when the same brief is drafted twice.
  const take = `${state.tally.drafted}-${state.tally.blocked}`;

  return (
    <div style={{ viewTransitionName: "nb-draft" }}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-snug text-ink-50">{draft.title}</p>
          {req ? <p className="mt-0.5 text-[11px] text-ink-500">Brief from {req.by}</p> : null}
        </div>
        <DraftChip key={`${take}-${gate}`} gate={gate} />
      </div>

      <AssetStage kind={draft.kind} drift={isDrift}>
        {isDrift ? <DriftAsset /> : <DraftAsset kind={draft.kind} lines={draft.lines} />}
      </AssetStage>

      {isDrift ? (
        <GuardrailStop draft={draft} take={take} />
      ) : (
        <>
          <div className="mt-5">
            <p className="label-mono">Generated copy</p>
            <div key={take} className="pg-stagger mt-2.5 divide-y divide-line border-y border-line">
              {fieldsOf(draft.lines).map((f) => (
                <div key={f.label} className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-3 py-2.5 sm:grid-cols-[6.75rem_minmax(0,1fr)]">
                  <span className="label-mono">{f.label}</span>
                  <span className="text-[13.5px] leading-relaxed text-ink-100">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
          {draft.applied && draft.applied.length > 0 ? (
            <div className="mt-5">
              <p className="label-mono">On-brand checks</p>
              <ul key={take} className="pg-stagger mt-2.5 flex flex-wrap gap-2">
                {draft.applied.map((a) => (
                  <li key={a} className="chip chip-positive whitespace-normal py-1 text-left leading-snug">
                    <span aria-hidden>✓</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}

      {/* The gate. Stable across every decision, so it doubles as the
          live region and the focus landing spot. */}
      <div
        ref={landingRef}
        tabIndex={-1}
        aria-live="polite"
        className="mt-5 rounded-xl border border-line bg-white/[0.02] p-3.5 outline-none focus-visible:border-line-strong"
      >
        {gate === "pending" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12.5px] text-ink-300">
              <span className="font-semibold text-amber-200">Waiting on you.</span> This would publish.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="caution" size="sm" icon="↩" onClick={(e) => decide({ type: "REQUEST_CHANGE" }, e.currentTarget)}>
                Request change
              </Button>
              <Button variant="positive" size="sm" arrow onClick={(e) => decide({ type: "APPROVE" }, e.currentTarget)}>
                Approve &amp; publish
              </Button>
            </div>
          </div>
        ) : gate === "blocked" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12.5px] text-ink-300">
              <span className="font-semibold text-rose-200">Won&apos;t ship as-is.</span> Your call.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="quiet" size="sm" onClick={() => decide({ type: "DROP" })}>
                Drop request
              </Button>
              <Button variant="accent" size="sm" arrow onClick={() => decide({ type: "OVERRIDE" })}>
                Override, draft a clean version
              </Button>
            </div>
          </div>
        ) : gate === "approved" ? (
          <p className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-300">
            <span className="chip chip-positive pop-in">
              <span aria-hidden>✓</span> Approved + published
            </span>
            <span className="text-scene-soft">
              The agent learned a rule <span aria-hidden>→</span>
            </span>
          </p>
        ) : gate === "changed" ? (
          <p className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-300">
            <span className="chip chip-caution pop-in">
              <span aria-hidden>↩</span> Sent back
            </span>
            <span className="text-scene-soft">
              The agent learned a don&apos;t-rule <span aria-hidden>→</span>
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

function DraftChip({ gate }: { gate: Gate }) {
  if (gate === "blocked") {
    return (
      <span className="chip chip-danger pop-in">
        <span aria-hidden>⛔</span> Off-brand · blocked
      </span>
    );
  }
  if (gate === "approved") {
    return (
      <span className="chip chip-positive pop-in">
        <span aria-hidden>✓</span> Published
      </span>
    );
  }
  if (gate === "changed") {
    return (
      <span className="chip chip-caution pop-in">
        <span aria-hidden>↩</span> Sent back
      </span>
    );
  }
  return (
    <span className="chip chip-accent pop-in">
      <span aria-hidden className="live-dot" />
      Draft · ready for review
    </span>
  );
}

/** "Headline: Brighter days." into { label, value }. */
function fieldsOf(lines: string[]): { label: string; value: string }[] {
  return lines.map((line) => {
    const at = line.indexOf(": ");
    return at === -1 ? { label: "", value: line } : { label: line.slice(0, at), value: line.slice(at + 2) };
  });
}

const STAGE_LABEL: Record<DeliverableKind, string> = {
  social: "Instagram · 1:1",
  web: "Amazon A+ module",
  email: "Email header",
};

// The canvas the asset sits on, like a design tool's artboard.
function AssetStage({ kind, drift, children }: { kind: DeliverableKind; drift: boolean; children: ReactNode }) {
  return (
    <figure
      className={cn(
        "bg-dot-grid relative mt-4 flex items-center justify-center overflow-hidden rounded-xl border bg-ink-950/60 px-4 pb-6 pt-10 sm:px-8",
        drift ? "border-rose-400/20" : "border-line",
      )}
    >
      <figcaption className="label-mono absolute left-3.5 top-3">Preview · {STAGE_LABEL[kind]}</figcaption>
      <span className="label-mono absolute right-3.5 top-3 hidden sm:inline">{drift ? "Not published" : "Sample"}</span>
      {children}
    </figure>
  );
}

function DraftAsset({ kind, lines }: { kind: DeliverableKind; lines: string[] }) {
  const [a = "", b = "", c = ""] = fieldsOf(lines).map((f) => f.value);
  if (kind === "web") return <WebAsset h1={a} body={b} badge={c} />;
  if (kind === "email") return <EmailAsset subject={a} hero={b} preheader={c} />;
  return <SocialAsset headline={a} sub={b} cta={c} />;
}

const ASSET_SHELL =
  "@container relative w-full overflow-hidden rounded-lg shadow-[0_30px_60px_-24px_rgb(0_0_0/0.85)] ring-1 ring-white/10";

function Wordmark({ className }: { className?: string }) {
  return (
    <p className={cn("font-mono tracking-[0.32em]", className)} style={{ color: NB.cream }}>
      NORTHBEAM
    </p>
  );
}

function SocialAsset({ headline, sub, cta }: { headline: string; sub: string; cta: string }) {
  return (
    <div role="img" aria-label={`Instagram post: ${headline} ${sub}`} className={cn(ASSET_SHELL, "aspect-square max-w-[300px]")} style={{ background: NB.ground }}>
      <div
        aria-hidden
        className="absolute -right-[14%] -top-[14%] h-[62%] w-[62%] rounded-full"
        style={{ background: `radial-gradient(circle, rgb(157 190 110 / 0.3), transparent 68%)` }}
      />
      <div className="absolute inset-0 flex flex-col p-[8cqw]">
        <Wordmark className="text-[3.2cqw]" />
        <div className="mt-auto">
          <p className="font-[Georgia,_'Times_New_Roman',_serif] text-[9.5cqw] font-semibold leading-[1.02] tracking-[-0.01em]" style={{ color: NB.paper }}>
            {headline}
          </p>
          <div className="mt-[4cqw] h-[0.9cqw] w-[18cqw]" style={{ background: NB.sage }} />
          <p className="mt-[4cqw] text-[4.4cqw] leading-snug" style={{ color: NB.mist }}>
            {sub}
          </p>
          <span
            className="mt-[6cqw] inline-flex rounded-full px-[4.5cqw] py-[2cqw] text-[3.8cqw] font-semibold"
            style={{ background: NB.sage, color: NB.groundDeep }}
          >
            {cta}
          </span>
        </div>
      </div>
    </div>
  );
}

function WebAsset({ h1, body, badge }: { h1: string; body: string; badge: string }) {
  return (
    <div role="img" aria-label={`A+ module: ${h1} ${body}`} className={cn(ASSET_SHELL, "aspect-[16/9] max-w-[520px]")} style={{ background: NB.groundDeep }}>
      <div className="absolute inset-0 grid grid-cols-[1.25fr_1fr] items-center gap-[4cqw] p-[5.5cqw]">
        <div>
          <Wordmark className="text-[1.9cqw]" />
          <p className="mt-[3.5cqw] font-[Georgia,_'Times_New_Roman',_serif] text-[5.4cqw] font-semibold leading-[1.05]" style={{ color: NB.paper }}>
            {h1}
          </p>
          <p className="mt-[2.2cqw] text-[2.5cqw] leading-snug" style={{ color: NB.mist }}>
            {body}
          </p>
          <span
            className="mt-[3.5cqw] inline-flex rounded-full px-[2.6cqw] py-[1.1cqw] text-[2.1cqw] font-semibold"
            style={{ background: NB.sage, color: NB.groundDeep }}
          >
            {badge}
          </span>
        </div>
        {/* The 3-pack: three objects in one box. */}
        <div aria-hidden className="relative h-full rounded-[1.4cqw]" style={{ background: "#1c2614" }}>
          <div className="absolute inset-x-[12%] bottom-[16%] flex items-end justify-center gap-[2.2cqw]">
            <span className="block h-[22cqw] w-[7cqw] rounded-t-[3cqw] rounded-b-[0.8cqw]" style={{ background: NB.cream }} />
            <span className="block h-[27cqw] w-[7.5cqw] rounded-t-[1cqw] rounded-b-[0.8cqw]" style={{ background: NB.sage }} />
            <span className="block h-[18cqw] w-[7cqw] rounded-[0.8cqw]" style={{ background: "#d9c4a5" }} />
          </div>
          <div className="absolute inset-x-[8%] bottom-[10%] h-[1.4cqw] rounded-full" style={{ background: "#2b3a1f" }} />
        </div>
      </div>
    </div>
  );
}

function EmailAsset({ subject, hero, preheader }: { subject: string; hero: string; preheader: string }) {
  return (
    <div role="img" aria-label={`Email: ${subject} ${hero}`} className={cn(ASSET_SHELL, "aspect-[16/9] max-w-[520px]")} style={{ background: NB.groundDeep }}>
      <div className="absolute inset-0 flex flex-col">
        {/* How it lands in the inbox. */}
        <div className="flex items-center gap-[2cqw] border-b px-[4.5cqw] py-[2.4cqw]" style={{ background: "#0b1008", borderColor: "#223018" }}>
          <span className="h-[3.6cqw] w-[3.6cqw] shrink-0 rounded-full" style={{ background: NB.sage }} />
          <p className="min-w-0 truncate text-[2.3cqw]" style={{ color: NB.mist }}>
            <span className="font-semibold" style={{ color: NB.paper }}>
              Northbeam Goods
            </span>
            <span className="mx-[1.4cqw] opacity-50">·</span>
            <span style={{ color: NB.paper }}>{subject}</span>
            <span className="mx-[1.4cqw] opacity-50">·</span>
            {preheader}
          </p>
        </div>
        <div className="flex flex-1 flex-col justify-center px-[6cqw]" style={{ background: NB.band }}>
          <Wordmark className="text-[2cqw]" />
          <p className="mt-[3cqw] max-w-[80%] font-[Georgia,_'Times_New_Roman',_serif] text-[6.2cqw] font-semibold leading-[1.05]" style={{ color: NB.paper }}>
            {hero}
          </p>
          <div className="mt-[3.5cqw] h-[0.6cqw] w-[12cqw]" style={{ background: NB.sage }} />
        </div>
        <div className="flex items-center justify-between px-[6cqw] py-[2.6cqw]">
          <span
            className="inline-flex rounded-full px-[3cqw] py-[1.1cqw] text-[2.1cqw] font-semibold"
            style={{ background: NB.sage, color: NB.groundDeep }}
          >
            Read on
          </span>
          <span className="font-mono text-[1.8cqw] text-[#52525b]">unsubscribe</span>
        </div>
      </div>
    </div>
  );
}

// What the brief literally asked for, held rather than shipped: dimmed,
// with numbered pins on the two things that break a locked rule.
function DriftAsset() {
  return (
    <div role="img" aria-label="Held draft: 60% OFF in all-caps neon, not published" className={cn(ASSET_SHELL, "aspect-square max-w-[300px]")} style={{ background: "#1b0a20" }}>
      <div aria-hidden className="absolute inset-0 opacity-45 saturate-[0.55]">
        <div className="absolute inset-x-0 top-[12%] py-[2.6cqw] text-center text-[5cqw] font-black tracking-[0.18em] text-black" style={{ background: "#f4ff3a" }}>
          SALE SALE SALE
        </div>
        <p className="absolute inset-x-0 top-[36%] text-center text-[19cqw] font-black leading-none tracking-[-0.03em]" style={{ color: "#ff3bd4" }}>
          60% OFF
        </p>
        <p className="absolute inset-x-0 top-[62%] text-center text-[6cqw] font-extrabold tracking-[0.12em]" style={{ color: "#3bf4ff" }}>
          ENDS SOON!!!
        </p>
      </div>
      <Pin n={1} className="left-[2.5%] top-[40%]" />
      <Pin n={2} className="right-[5%] top-[10.5%]" />
      <span className="chip chip-danger absolute bottom-[6%] left-1/2 -translate-x-1/2 bg-ink-950/80">
        <ShieldGlyph className="h-3 w-3" />
        Held, not published
      </span>
    </div>
  );
}

function Pin({ n, className }: { n: number; className: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-400 font-mono text-[11px] font-semibold text-ink-950 ring-4 ring-rose-400/25",
        className,
      )}
    >
      {n}
    </span>
  );
}

// The stop, calm: what the agent noticed, in its own words, and the
// locked rules the brief breaks, numbered to match the pins.
function GuardrailStop({ draft, take }: { draft: Draft; take: string }) {
  return (
    <div className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/[0.04] p-4">
      <p className="flex items-center gap-2 text-[12.5px] font-semibold text-rose-200">
        <ShieldGlyph className="h-4 w-4" />
        Stopped at the guardrail
      </p>
      <div key={take} className="pg-stagger mt-2.5 space-y-1.5">
        {draft.lines.map((line) => (
          <p key={line} className="text-[13.5px] leading-relaxed text-ink-200">
            {line}
          </p>
        ))}
      </div>
      {draft.violations && draft.violations.length > 0 ? (
        <>
          <p className="label-mono mt-4 text-rose-200/80">Breaks these locked rules</p>
          <ol className="mt-2 space-y-1.5">
            {draft.violations.map((v, i) => (
              <li key={v} className="flex items-center gap-2.5 text-[12.5px] text-rose-100/90">
                <span
                  aria-hidden
                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-rose-400/40 font-mono text-[10.5px] text-rose-200"
                >
                  {i + 1}
                </span>
                {v}
              </li>
            ))}
          </ol>
        </>
      ) : null}
    </div>
  );
}

// ─── Brand memory ───────────────────────────────────────────────────

function RuleMeta({ rule, gate }: { rule: BrandRule; gate: Gate }) {
  if (rule.learned) {
    return (
      <p className="mt-1 text-[11px] font-medium text-scene-soft">
        {rule.kind === "do" ? "Learned from your approval" : "Learned when you sent one back"}
      </p>
    );
  }
  if (rule.kind === "dont") {
    return gate === "blocked" ? (
      <p key="firing" className="pop-in mt-1 text-[11px] font-medium text-rose-300">
        Locked · holding the flash banner
      </p>
    ) : (
      <p className="mt-1 text-[11px] text-ink-500">Locked · the guardrail enforces it</p>
    );
  }
  return <p className="mt-1 text-[11px] text-ink-500">House rule</p>;
}

// ─── Brand kit ──────────────────────────────────────────────────────
// What the agent drafts against: the fictional brand's own kit, as a
// spec sheet. Every line here is a rule the scene above actually uses.

const KIT: { name: string; desc: string }[] = [
  { name: "Type", desc: "Serif headlines, a quiet sans underneath" },
  { name: "Voice", desc: "Confident and benefit-led, no hype words" },
  { name: "Wordmark", desc: "Top-left, 24px safe-zone" },
  { name: "Offers", desc: "In the subhead, never the headline" },
];

function BrandKit() {
  return (
    <section className="surface rounded-2xl p-5 md:p-6" aria-labelledby="northbeam-kit-heading">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="northbeam-kit-heading" className="heading text-lg text-ink-50">
          Brand kit
        </h2>
        <p className="text-xs text-ink-500">What the agent drafts against</p>
      </div>
      <ul className="mt-4 divide-y divide-line">
        <li className="group grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-center gap-x-4 py-3">
          <p className="text-[13.5px] font-medium text-ink-100 transition-colors group-hover:text-white">Palette</p>
          <div className="flex flex-wrap items-center gap-3">
            {[
              { hex: NB.ground, name: "Forest" },
              { hex: NB.sage, name: "Sage" },
              { hex: NB.cream, name: "Cream" },
            ].map((s) => (
              <span key={s.hex} className="inline-flex items-center gap-2">
                <span aria-hidden className="h-5 w-5 rounded-md ring-1 ring-white/15" style={{ background: s.hex }} />
                <span className="text-[12.5px] text-ink-400">{s.name}</span>
                <span className="font-mono text-[10.5px] text-ink-500">{s.hex}</span>
              </span>
            ))}
          </div>
        </li>
        {KIT.map((k) => (
          <li key={k.name} className="group grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-baseline gap-x-4 py-3">
            <p className="text-[13.5px] font-medium text-ink-100 transition-colors group-hover:text-white">{k.name}</p>
            <p className="text-[12.5px] text-ink-400">{k.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

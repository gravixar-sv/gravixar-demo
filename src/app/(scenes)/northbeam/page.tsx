"use client";

// Northbeam Goods — a real brand AGENT, as a 3-column workspace.
// Requests (plain briefs) → Brand agent (drafts on-brand, or BLOCKS drift at
// the guardrail) → Brand memory (the do/don't rules it LEARNS from your
// approvals). Approve a draft and watch a rule appear in column three; send
// one back and it learns what to avoid. Audit trail underneath.
// See src/lib/playground/northbeam-data.ts.

import { useEffect, useReducer } from "react";
import {
  createInitialNorthbeamState,
  northbeamReducer,
  type AuditEntry,
  type BrandRequest,
  type BrandRule,
  type Draft,
  type Gate,
  type NorthbeamEvent,
} from "@/lib/playground/northbeam-data";
import { MockupThumb } from "@/components/demo/DeliverableMockup";
import { SceneCTA } from "@/components/demo/SceneCTA";

const FRESH_DECAY_MS = 2200;

export default function NorthbeamBrandAgent() {
  const [state, dispatch] = useReducer(
    northbeamReducer,
    undefined,
    createInitialNorthbeamState,
  );

  useEffect(() => {
    const ids = [
      ...state.rules.filter((r) => r.fresh).map((r) => r.id),
      ...state.feed.filter((f) => f.fresh).map((f) => f.id),
    ];
    if (ids.length === 0) return;
    const timers = ids.map((id) =>
      window.setTimeout(() => dispatch({ type: "DECAY_FRESH", id }), FRESH_DECAY_MS),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [state.rules, state.feed]);

  const learnedCount = state.rules.filter((r) => r.learned).length;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10 lg:px-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-scene-1)]">
            brand agent · for dtc teams · live sandbox
          </p>
          <h1 className="mt-3 text-3xl font-medium leading-tight tracking-[-0.02em] text-zinc-50 md:text-4xl">
            A brand agent that drafts on-brand, and learns your rules.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-400">
            Hand it a brief; it drafts the asset in your voice. Ask for something
            off-brand and it stops at the guardrail instead of shipping it. Every
            time you approve or send one back, it learns a do or a don&apos;t.
            Watch the brand memory grow on the right.
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: "RESET" })}
          className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-zinc-50"
        >
          ↻ reset
        </button>
      </header>

      <div className="mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-[0.95fr_1.2fr_0.95fr] lg:gap-5 lg:overflow-visible lg:pb-0">
        {/* Requests */}
        <Col label="Requests" status="plain briefs · from the team">
          {state.requests.map((r) => (
            <RequestCard
              key={r.id}
              req={r}
              active={state.current === r.id}
              dispatch={dispatch}
            />
          ))}
        </Col>

        {/* Brand agent workspace */}
        <Col label="Brand agent" status="drafts on-brand · you approve">
          <Workspace draft={state.draft} gate={state.gate} dispatch={dispatch} />
        </Col>

        {/* Brand memory */}
        <Col
          label="Brand memory"
          status={`${state.rules.length} rules · ${learnedCount} learned from you`}
        >
          {state.rules.map((r) => (
            <RuleRow key={r.id} rule={r} />
          ))}
        </Col>
      </div>

      <AuditTrail feed={state.feed} />
      <SceneCTA
        personaLabel="Brands & DTC"
        noun="brand agent"
        headline="Give your brand an agent that holds the line."
        blurb="I build brand agents like this for DTC teams: on-brand drafts, a guardrail that blocks drift, and a memory that learns your rules from every approval. One call to scope it, no obligation."
      />
    </div>
  );
}

function Col({
  label,
  status,
  children,
}: {
  label: string;
  status: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scene-card min-w-[82%] shrink-0 snap-start rounded-2xl p-5 sm:min-w-[48%] lg:min-w-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300">{label}</p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">{status}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function RequestCard({
  req,
  active,
  dispatch,
}: {
  req: BrandRequest;
  active: boolean;
  dispatch: React.Dispatch<NorthbeamEvent>;
}) {
  return (
    <div
      className={[
        "rounded-xl border p-3.5 transition-colors",
        active
          ? "border-[var(--color-scene-1)]/50 bg-[var(--color-scene-1)]/[0.06]"
          : "border-white/10 bg-black/20",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <MockupThumb kind={req.kind} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-100">{req.title}</p>
          <p className="mt-1 text-[11px] italic leading-relaxed text-zinc-500">
            &ldquo;{req.brief}&rdquo;
          </p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-600">
            {req.by}
          </p>
        </div>
      </div>

      {req.status === "published" ? (
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300/80">
          ✓ approved + published
        </p>
      ) : req.status === "dropped" ? (
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
          ✕ dropped · off-brand
        </p>
      ) : (
        <button
          type="button"
          onClick={() => dispatch({ type: "GENERATE", id: req.id })}
          className={[
            "mt-3 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
            req.offBrand
              ? "border-amber-400/35 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20"
              : "border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/10 text-lime-200 hover:bg-[var(--color-scene-1)]/20",
          ].join(" ")}
        >
          {req.offBrand ? "▸ generate (watch the guardrail)" : "▸ generate on-brand"}
        </button>
      )}
    </div>
  );
}

function Workspace({
  draft,
  gate,
  dispatch,
}: {
  draft: Draft | null;
  gate: Gate;
  dispatch: React.Dispatch<NorthbeamEvent>;
}) {
  if (!draft) {
    return (
      <p className="rounded-lg border border-dashed border-white/10 px-3 py-10 text-center text-[11px] leading-relaxed text-zinc-600">
        Pick a request on the left.
        <br />
        The agent drafts it on-brand here.
      </p>
    );
  }

  const isDrift = draft.mode === "drift";

  return (
    <div
      className={[
        "rounded-xl border p-4",
        isDrift ? "border-amber-400/40 bg-amber-400/[0.04]" : "border-white/10 bg-black/25",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <MockupThumb kind={draft.kind} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-100">{draft.title}</p>
          <p
            className={[
              "mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em]",
              isDrift ? "text-amber-300/90" : "text-[var(--color-scene-1)]",
            ].join(" ")}
          >
            {isDrift ? "⛔ off-brand · blocked at the guardrail" : "draft · ready for review"}
          </p>
        </div>
      </div>

      {/* Generated copy / explanation */}
      <div className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
        {draft.lines.map((line, i) => (
          <p key={i} className="font-mono text-[11px] leading-relaxed text-zinc-300">
            {line}
          </p>
        ))}
      </div>

      {/* Reasoning: applied rules (draft) or violations (drift) */}
      {draft.applied && draft.applied.length > 0 ? (
        <div className="mt-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">
            brand rules applied
          </p>
          <ul className="mt-1.5 space-y-1">
            {draft.applied.map((a) => (
              <li key={a} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                <span className="text-emerald-400">✓</span>
                <span className="text-zinc-400">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {draft.violations && draft.violations.length > 0 ? (
        <div className="mt-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-amber-300/80">
            breaks these rules
          </p>
          <ul className="mt-1.5 space-y-1">
            {draft.violations.map((v) => (
              <li key={v} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                <span className="text-amber-400">✗</span>
                <span className="text-amber-200/90">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Gate */}
      <div className="mt-4 border-t border-white/5 pt-3">
        {gate === "pending" ? (
          <>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-amber-300/90">
              ⏸ waiting on you · this would publish
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => dispatch({ type: "APPROVE" })}
                className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-400/20"
              >
                Approve &amp; publish →
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "REQUEST_CHANGE" })}
                className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-400/20"
              >
                Request change
              </button>
            </div>
          </>
        ) : gate === "blocked" ? (
          <>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-amber-300/90">
              ⏸ won&apos;t ship as-is · your call
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => dispatch({ type: "OVERRIDE" })}
                className="rounded-lg border border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/10 px-3 py-1.5 text-xs font-medium text-lime-200 transition-colors hover:bg-[var(--color-scene-1)]/20"
              >
                Override → draft a clean version
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "DROP" })}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.06]"
              >
                Drop request
              </button>
            </div>
          </>
        ) : gate === "approved" ? (
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300/80">
            ✓ approved + published · agent learned a rule →
          </p>
        ) : gate === "changed" ? (
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-amber-300/80">
            ↩ sent back · agent learned a don&apos;t-rule →
          </p>
        ) : null}
      </div>
    </div>
  );
}

function RuleRow({ rule }: { rule: BrandRule }) {
  const isDo = rule.kind === "do";
  return (
    <div
      className={[
        "rounded-lg border px-3 py-2",
        rule.fresh
          ? "pg-fresh border-[var(--color-scene-1)]/45"
          : "border-white/10 bg-white/[0.02]",
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        <span className={isDo ? "text-emerald-400" : "text-rose-400"}>{isDo ? "✓" : "✗"}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] leading-relaxed text-zinc-200">{rule.text}</p>
          {rule.learned ? (
            <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
              learned from your approval
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AuditTrail({ feed }: { feed: AuditEntry[] }) {
  return (
    <section className="mt-5 scene-card rounded-2xl p-5">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
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
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
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

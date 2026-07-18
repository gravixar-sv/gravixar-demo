"use client";

// Studio Mix playground — the AI-agents console as a 3-column live
// workspace. Run an agent in column 1 → its output appears in column 2
// → the run logs to the shared feed in column 3. Same cascade pattern
// as the Lattice playground; deterministic mock output (no live API).

import { useEffect, useReducer, useRef } from "react";
import {
  STUDIO_AGENTS,
  findStudioAgent,
  type StudioAgent,
} from "@/lib/playground/studio-script";
import {
  createInitialStudioState,
  studioReducer,
  type GateState,
  type StudioEvent,
} from "@/lib/playground/studio-reducer";
import type { AuditEntry } from "@/lib/playground/reducer";
import { SceneCTA } from "@/components/demo/SceneCTA";
import { OutcomePanel } from "@/components/demo/OutcomePanel";
import { LearnBeat } from "@/components/demo/LearnBeat";
import { flowPulse } from "@/lib/flowPulse";
import { formatRelative } from "@/lib/formatRelative";

const FRESH_DECAY_MS = 2000;

export default function StudioMixPlayground() {
  const [state, dispatch] = useReducer(
    studioReducer,
    undefined,
    createInitialStudioState,
  );

  useEffect(() => {
    const freshIds = [
      ...state.feed.filter((a) => a.fresh).map((a) => a.id),
      ...state.rules.filter((r) => r.fresh).map((r) => r.id),
    ];
    if (freshIds.length === 0) return;
    const timers = freshIds.map((id) =>
      window.setTimeout(() => dispatch({ type: "DECAY_FRESH", id }), FRESH_DECAY_MS),
    );
    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
  }, [state.feed, state.rules]);

  const current = state.current ? findStudioAgent(state.current) ?? null : null;
  const learnedCount = state.rules.filter((r) => r.learned).length;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10 lg:px-12">
      <div aria-hidden className="scene-conduit mb-7" />
      {/* ── Orientation ─────────────────────────────────────────── */}
      <header className="scene-rise flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-scene-1)]">
            supervised agent console · Claude API · live sandbox
          </p>
          <h1 className="mt-3 font-display-mono text-3xl font-medium leading-tight tracking-tight text-zinc-50 md:text-4xl">
            <span className="text-[var(--color-scene-1)]">$</span> agents that
            ask before they act.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            The real AI layer we ship into a team&apos;s ops, on the Claude API:
            content drafting, candidate and inbound assessment, feedback triage,
            anomaly watch. Read-only work runs on its own; anything that writes,
            spends, or publishes waits behind a human. Run one on the left, see
            its output in the middle, every action lands in the audit log on the
            right. Never auto-publish, and the studio
            <span className="text-zinc-300"> learns from every approve / discard</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {state.ran.length > 0 ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-zinc-500">
              {state.ran.length}/4 agents run
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => dispatch({ type: "RESET" })}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-zinc-50 active:scale-[0.98] lg:min-h-0"
          >
            <span aria-hidden>↻</span> reset
          </button>
        </div>
      </header>

      {/* ── 3 columns ───────────────────────────────────────────── */}
      <div className="scene-columns mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-[0.9fr_1.2fr_1fr] lg:gap-5 lg:overflow-visible lg:pb-0">
        <AgentsColumn
          currentKey={state.current}
          ran={state.ran}
          onRun={(key) => dispatch({ type: "RUN", key })}
        />
        <OutputColumn agent={current} gate={state.gate} dispatch={dispatch} />
        <FeedColumn feed={state.feed} />
      </div>

      <LearnBeat
        rules={state.rules}
        learnedCount={learnedCount}
        headingId="studio-rules-heading"
        heading="studio policy · what every approval teaches"
        emptyText="Run ECHO + approve or discard the draft and the studio starts a policy book."
        learnedNote="learned from your call"
      />
      <OutcomePanel
        stats={[
          { value: "9,640", label: "drafts generated", sub: "all gated" },
          { value: "94%", label: "approved as-is", sub: "after a human read" },
          { value: "1,120", label: "candidates assessed", sub: "human decides" },
          { value: "0", label: "auto-publishes", sub: "by design" },
        ]}
        liveProductLabel="the AI layer we ship"
      />

      <SceneCTA
        personaLabel="Ops & technical teams"
        noun="ops team"
        headline="Put your agents behind a human."
        blurb="I wire supervised agent consoles like this into a team's ops: read-only agents run on their own, anything that writes or publishes waits for approval. One call to scope what to automate first."
      />
    </div>
  );
}

// ─── Column shell ───────────────────────────────────────────────────

function ColumnShell({
  label,
  status,
  headingId,
  flow,
  children,
}: {
  label: string;
  status: string;
  /** Ties the column heading to its section for assistive tech. */
  headingId: string;
  /** Name other columns target with flowPulse(). */
  flow?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      data-flow={flow}
      aria-labelledby={headingId}
      className="scene-card min-w-[82%] shrink-0 snap-start rounded-2xl p-5 sm:min-w-[48%] lg:min-w-0"
    >
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zinc-700" />
          <span className="h-2 w-2 rounded-full bg-zinc-700" />
          <span className="h-2 w-2 rounded-full bg-zinc-700" />
        </span>
        <h2
          id={headingId}
          className="ml-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300"
        >
          {label}
        </h2>
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        {status}
      </p>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

// ─── Column 1 — Agents (trigger) ────────────────────────────────────

function AgentsColumn({
  currentKey,
  ran,
  onRun,
}: {
  currentKey: string | null;
  ran: string[];
  onRun: (key: StudioAgent["key"]) => void;
}) {
  return (
    <ColumnShell
      label="agents"
      status="4 registered · click run"
      headingId="studio-agents-heading"
    >
      <ul className="space-y-2.5">
        {STUDIO_AGENTS.map((agent) => {
          const isCurrent = currentKey === agent.key;
          const hasRun = ran.includes(agent.key);
          return (
            <li
              key={agent.key}
              className={[
                "rounded-xl border bg-black/20 p-3 transition-colors",
                isCurrent
                  ? "border-[var(--color-scene-1)]/50"
                  : "border-white/10",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="font-mono text-sm font-semibold tracking-tight"
                  style={{ color: agent.color }}
                >
                  {agent.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  {agent.role}
                </span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
                {agent.blurb}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    flowPulse(e.currentTarget, "studio-output");
                    onRun(agent.key);
                  }}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--agent)]/35 bg-[var(--agent)]/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--agent)] transition-all hover:bg-[var(--agent)]/20 active:scale-[0.98] lg:min-h-0"
                  style={{ "--agent": agent.color } as React.CSSProperties}
                >
                  <span aria-hidden>▸</span> run{hasRun ? " again" : ""}
                </button>
                {hasRun ? (
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/80">
                    <span aria-hidden>✓</span> ran
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </ColumnShell>
  );
}

// ─── Column 2 — Output (result) ─────────────────────────────────────

function OutputColumn({
  agent,
  gate,
  dispatch,
}: {
  agent: StudioAgent | null;
  gate: GateState;
  dispatch: React.Dispatch<StudioEvent>;
}) {
  // Approving / discarding swaps the buttons for a status line, so move
  // focus onto the gate region rather than dropping it to <body>. Only a
  // gate decision arms this — a plain run leaves focus on the run button.
  const gateRef = useRef<HTMLDivElement>(null);
  const decidedRef = useRef(false);
  useEffect(() => {
    if (!decidedRef.current) return;
    decidedRef.current = false;
    gateRef.current?.focus();
  }, [gate]);

  return (
    <ColumnShell
      label="output"
      status={agent ? `${agent.name.toLowerCase()} · ${agent.outputTitle}` : "no run yet"}
      headingId="studio-output-heading"
      flow="studio-output"
    >
      {agent ? (
        <div
          key={agent.key}
          className="pg-fresh rounded-xl border p-4"
          style={{ borderColor: `${agent.color}40` }}
        >
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <span
              className="font-mono text-xs font-semibold"
              style={{ color: agent.color }}
            >
              {agent.name}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              {agent.role}
            </span>
          </div>
          <div className="pg-stagger mt-3 space-y-1.5 font-mono text-[11px] leading-relaxed text-zinc-300">
            {agent.outputLines.map((line, i) => (
              <p key={`${agent.key}-${i}`} className="whitespace-pre-wrap">
                {line}
              </p>
            ))}
          </div>

          {/* Approval gate — writer agents wait for a human; read-only run
              autonomously. The wrapper is the stable live region: it exists
              before the decision, so the swap is announced. */}
          <div ref={gateRef} tabIndex={-1} aria-live="polite">
            {agent.gated ? (
              gate === "pending" ? (
                <div className="mt-3 border-t border-white/5 pt-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber-300/90">
                    <span aria-hidden>⏸</span> waiting on you · this would publish
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        flowPulse(e.currentTarget, "studio-feed");
                        decidedRef.current = true;
                        dispatch({ type: "APPROVE" });
                      }}
                      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition-all hover:bg-emerald-400/20 active:scale-[0.98] lg:min-h-0"
                    >
                      Approve &amp; publish <span aria-hidden>→</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        flowPulse(e.currentTarget, "studio-feed");
                        decidedRef.current = true;
                        dispatch({ type: "DISCARD" });
                      }}
                      className="inline-flex min-h-10 items-center justify-center rounded-lg px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-200 lg:min-h-0"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              ) : gate === "approved" ? (
                <p className="mt-3 border-t border-white/5 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/80">
                  <span aria-hidden>✓</span> approved + published
                </p>
              ) : gate === "discarded" ? (
                <p className="mt-3 border-t border-white/5 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  <span aria-hidden>✕</span> draft discarded
                </p>
              ) : null
            ) : (
              <p className="mt-3 border-t border-white/5 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                <span aria-hidden>✓</span> ran autonomously · read-only, nothing to approve
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-[180px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-white/10 px-6 text-center">
          <span aria-hidden className="agent-orb" />
          <p className="text-xs leading-relaxed text-zinc-500">
            Agents standing by.
            <br />
            Run one on the left and its output streams in here.
          </p>
        </div>
      )}
    </ColumnShell>
  );
}

// ─── Column 3 — Run feed (cascade target) ───────────────────────────

function FeedColumn({ feed }: { feed: AuditEntry[] }) {
  return (
    <ColumnShell
      label="audit log"
      status="every action logged · real-time"
      headingId="studio-feed-heading"
      flow="studio-feed"
    >
      <ul aria-live="polite" className="space-y-2">
        {feed.map((entry) => (
          <li
            key={entry.id}
            className={[
              "rounded-lg border px-3 py-2 text-xs",
              entry.fresh
                ? "pg-fresh border-[var(--color-scene-1)]/40 text-zinc-100"
                : "border-white/10 bg-white/[0.02] text-zinc-300",
            ].join(" ")}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                {formatRelative(entry.ts)}
              </span>
              {entry.fresh ? (
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
                  new
                </span>
              ) : null}
            </div>
            <p className="mt-1 leading-relaxed text-zinc-200">
              <span className="font-mono font-medium">{entry.actor}</span>{" "}
              <span className="text-zinc-400">{entry.action}</span>
              {entry.detail ? (
                <>
                  {" "}
                  <span className="text-zinc-600">·</span>{" "}
                  <span className="text-zinc-400">{entry.detail}</span>
                </>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
    </ColumnShell>
  );
}


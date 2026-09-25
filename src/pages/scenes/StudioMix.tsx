// Agent Console (Studio Mix): a supervised AI-agent console. Run an
// agent in the Agents pane, its output streams into the Output pane, and
// every run and every human decision lands in the Audit log pane. Writer
// agents (ECHO) stop at a human gate; read-only agents run on their own.
// Deterministic mock output, no live API. See
// src/lib/playground/studio-reducer.ts and studio-script.ts.
//
// Layout follows the Lattice reference (SceneIntro > Workspace >
// LearnBeat > OutcomePanel > SceneCTA), with the exception on record in
// AGENTS.md: this scene's audit feed is a workspace pane, because the
// cascade run -> output -> log is the point, so there is no separate
// ActivityLog below the receipts.

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { STUDIO_AGENTS, findStudioAgent, type StudioAgent } from "@/lib/playground/studio-script";
import {
  agentsRun,
  createInitialStudioState,
  outcomeStats,
  studioReducer,
  trySteps,
  type StudioEvent,
  type StudioState,
} from "@/lib/playground/studio-reducer";
import type { AuditEntry } from "@/lib/playground/reducer";
import { SceneLayout } from "@/components/demo/SceneLayout";
import { SceneIntro } from "@/components/demo/SceneIntro";
import { ItemCard, Pane, Workspace } from "@/components/demo/Workspace";
import { LearnBeat } from "@/components/demo/LearnBeat";
import { OutcomePanel } from "@/components/demo/OutcomePanel";
import { SceneCTA } from "@/components/demo/SceneCTA";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { flowPulse } from "@/lib/flowPulse";
import { formatRelative } from "@/lib/formatRelative";
import { useSceneDispatch } from "@/lib/useSceneDispatch";
import { useStartHint } from "@/lib/useStartHint";
import { vtName } from "@/lib/viewTransition";

const FRESH_DECAY_MS = 2000;
/** Audit rows shown in the pane; the header count carries the total. */
const FEED_LIMIT = 7;

type Dispatch = React.Dispatch<StudioEvent>;

/** On the phone swipe rail a pane is a shrink-0 flex item, so without a
 *  fixed width it grows to its longest line (the agent blurbs) and
 *  clips. Pin it to the rail's own proportions; the lg grid is unaffected. */
const RAIL_W = "w-[86%] sm:w-[58%] lg:w-auto";

export default function StudioMixPage() {
  return (
    <SceneLayout slug="studio-mix">
      <StudioConsole />
    </SceneLayout>
  );
}

/** Retint the scene tokens to one agent's colour, so its buttons, fresh
 *  flash and spotlight read in that agent's hue. */
function agentVars(agent: StudioAgent): CSSProperties {
  return {
    "--color-scene-1": agent.color,
    "--color-scene-glow": `${agent.color}4d`,
  } as CSSProperties;
}

function StudioConsole() {
  const [state, dispatch] = useSceneDispatch(studioReducer, createInitialStudioState);
  const { hint, endHint } = useStartHint();

  useEffect(() => {
    const ids = [
      ...state.feed.filter((a) => a.fresh).map((a) => a.id),
      ...state.rules.filter((r) => r.fresh).map((r) => r.id),
    ];
    if (ids.length === 0) return;
    const timers = ids.map((id) => window.setTimeout(() => dispatch({ type: "DECAY_FRESH", id }), FRESH_DECAY_MS));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [state.feed, state.rules, dispatch]);

  const current = state.current ? (findStudioAgent(state.current) ?? null) : null;
  const learnedCount = state.rules.filter((r) => r.learned).length;
  const ran = agentsRun(state);
  const awaiting = state.gate === "pending";

  return (
    <>
      <SceneIntro
        slug="studio-mix"
        title="Agents that ask before they act."
        lede={
          <>
            The supervised AI layer I ship into a team&apos;s ops, on the Claude API. Read-only agents run on their own;
            anything that writes, spends or publishes{" "}
            <span className="text-ink-200">waits behind a human, and the studio learns from every call</span>.
          </>
        }
        steps={trySteps(state)}
        onReset={() => dispatch({ type: "RESET" })}
        status={
          ran > 0 ? (
            <span key={ran} className="chip chip-mono pop-in">
              {ran}/{STUDIO_AGENTS.length} agents run
            </span>
          ) : null
        }
      />

      <Workspace
        slug="studio-mix"
        board="Ops agents · supervised console"
        cols="lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.3fr)_minmax(0,1fr)]"
        onClickCapture={endHint}
        toolbar={
          <>
            {awaiting ? (
              <span key="awaiting" className="chip chip-caution pop-in">
                <span aria-hidden className="live-dot" />1 awaiting you
              </span>
            ) : null}
            <span aria-hidden className="hidden items-center gap-1.5 md:flex">
              {STUDIO_AGENTS.map((a) => (
                <span
                  key={a.key}
                  className={cn(
                    "h-2 w-2 rounded-full transition-opacity duration-300",
                    state.runs[a.key] > 0 ? "opacity-100" : "opacity-35",
                  )}
                  style={{ background: a.color }}
                />
              ))}
            </span>
          </>
        }
      >
        <Pane
          id="studio-agents"
          className={RAIL_W}
          lead={<PaneMark>{ICONS.agents}</PaneMark>}
          title="Agents"
          tag="Claude API"
          sub="Read-only run alone, writers wait for you"
          count={STUDIO_AGENTS.length}
          status="Registered · click run"
        >
          {STUDIO_AGENTS.map((agent, i) => (
            <AgentCard
              key={agent.key}
              agent={agent}
              runs={state.runs[agent.key]}
              current={state.current === agent.key}
              hint={hint && i === 0}
              onRun={(e) => {
                flowPulse(e.currentTarget, "studio-output");
                dispatch({ type: "RUN", key: agent.key });
              }}
            />
          ))}
        </Pane>

        <Pane
          id="studio-output"
          className={RAIL_W}
          flow="studio-output"
          lead={current ? <AgentMark agent={current} /> : <PaneMark>{ICONS.output}</PaneMark>}
          title="Output"
          tag={current ? current.name : undefined}
          sub={current ? current.outputTitle : "No run yet"}
          status={gateStatus(current, state.gate)}
        >
          {current ? (
            <OutputCard agent={current} state={state} dispatch={dispatch} />
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-white/[0.1] px-6 text-center">
              <span aria-hidden className="agent-orb" />
              <p className="text-xs leading-relaxed text-ink-500">
                Agents standing by.
                <br />
                Run one and its output streams in here.
              </p>
            </div>
          )}
        </Pane>

        <Pane
          id="studio-feed"
          className={RAIL_W}
          flow="studio-feed"
          lead={<PaneMark>{ICONS.log}</PaneMark>}
          title="Audit log"
          tag="live"
          sub="Every action logged, newest first"
          count={state.feed.length}
          status="Real time"
        >
          <AuditTimeline feed={state.feed} />
        </Pane>
      </Workspace>

      <LearnBeat
        rules={state.rules}
        learnedCount={learnedCount}
        flow="studio-rules"
        headingId="studio-rules-heading"
        heading="Studio policy"
        sub="What every approve or discard teaches the agents"
        learnedLabel="learned from you"
        emptyText="Run ECHO, then approve or discard the draft, and the studio starts a policy book."
        renderMeta={(rule) => (
          <p className="mt-1 text-[11px] text-ink-500">
            {rule.learned ? (
              <span className="font-medium text-scene-soft">Learned from your call</span>
            ) : (
              <span>House default</span>
            )}
          </p>
        )}
      />
      <OutcomePanel stats={outcomeStats(state)} liveProductLabel="the AI layer I ship" />

      <SceneCTA
        personaLabel="Ops & technical teams"
        noun="ops team"
        headline={
          <>
            Put your agents <span className="voice font-normal text-scene-soft">behind a human.</span>
          </>
        }
        blurb="I wire supervised agent consoles like this into a team's ops: read-only agents run on their own, anything that writes or publishes waits for approval. One call to scope what to automate first."
      />
    </>
  );
}

function gateStatus(agent: StudioAgent | null, gate: StudioState["gate"]): string {
  if (!agent) return "Idle";
  if (!agent.gated) return "Ran autonomously";
  return { pending: "Awaiting your approval", approved: "Approved", discarded: "Discarded", autonomous: "Ran" }[gate];
}

// ─── Marks ──────────────────────────────────────────────────────────

const ICONS = {
  agents: (
    <path d="M3 3.5h4v4H3zM9 3.5h4v4H9zM3 9.5h4v4H3zM9 9.5h4v4H9z" strokeLinejoin="round" />
  ),
  output: <path d="M2.5 4.5 6 8l-3.5 3.5M8 12h5.5" strokeLinecap="round" strokeLinejoin="round" />,
  log: <path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01" strokeLinecap="round" />,
};

function PaneMark({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line-strong bg-white/[0.03] text-scene-soft"
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
        {children}
      </svg>
    </span>
  );
}

function AgentMark({ agent, size = "md" }: { agent: StudioAgent; size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center border font-mono font-semibold",
        size === "sm" ? "h-8 w-8 rounded-lg text-[12px]" : "h-10 w-10 rounded-xl text-[13px]",
      )}
      style={{
        color: agent.color,
        borderColor: `${agent.color}59`,
        background: `${agent.color}17`,
      }}
    >
      {agent.name[0]}
    </span>
  );
}

// ─── Agents pane ────────────────────────────────────────────────────

function AgentCard({
  agent,
  runs,
  current,
  hint,
  onRun,
}: {
  agent: StudioAgent;
  runs: number;
  current: boolean;
  hint: boolean;
  onRun: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <ItemCard
      style={agentVars(agent)}
      className={cn(current && "border-[color-mix(in_oklab,var(--color-scene-1)_45%,transparent)]")}
    >
      <div className="flex items-start gap-3">
        <AgentMark agent={agent} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm font-semibold tracking-[0.06em] text-ink-50">{agent.name}</p>
            {current ? (
              <>
                <span aria-hidden className="live-dot text-scene" />
                <span className="sr-only">In the output pane</span>
              </>
            ) : null}
            {agent.gated ? (
              <span className="chip chip-caution">Needs sign-off</span>
            ) : (
              <span className="chip">Read-only</span>
            )}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-400">
            {agent.role}
            {runs > 0 ? (
              <span key={runs} className="pop-in inline-flex items-center gap-1 font-mono text-[11px] text-emerald-300/90">
                <span aria-hidden>✓</span> ran ×{runs}
              </span>
            ) : null}
          </p>
        </div>
        <Button variant="accent" size="sm" icon="▸" hint={hint} onClick={onRun} className="shrink-0">
          {runs > 0 ? "Run again" : "Run"}
        </Button>
      </div>
      <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-400">{agent.blurb}</p>
    </ItemCard>
  );
}

// ─── Output pane ────────────────────────────────────────────────────

/** "Title: value" lines get a dim key, so the output scans like a log. */
function OutputLine({ line }: { line: string }) {
  const m = line.match(/^([A-Za-z][A-Za-z0-9 ]{0,14}):\s(.*)$/);
  if (!m) return <p className="whitespace-pre-wrap text-ink-300">{line}</p>;
  return (
    <p className="whitespace-pre-wrap text-ink-200">
      <span className="text-scene-soft opacity-80">{m[1]}:</span> {m[2]}
    </p>
  );
}

function OutputCard({ agent, state, dispatch }: { agent: StudioAgent; state: StudioState; dispatch: Dispatch }) {
  const runs = state.runs[agent.key];
  // The latest feed row this agent wrote is this run's receipt.
  const runRow = state.feed.find((e) => e.actor === agent.name);
  const runId = runRow ? runRow.id.slice(-5) : null;

  // Approving or discarding swaps the buttons for a status line, so move
  // focus onto the gate region rather than dropping it to <body>. Only a
  // gate decision arms this. A plain run leaves focus on the run button.
  const gateRef = useRef<HTMLDivElement>(null);
  const decidedRef = useRef(false);
  useEffect(() => {
    if (!decidedRef.current) return;
    decidedRef.current = false;
    gateRef.current?.focus();
  }, [state.gate]);

  const decide = (e: React.MouseEvent<HTMLButtonElement>, type: "APPROVE" | "DISCARD") => {
    flowPulse(e.currentTarget, "studio-feed");
    decidedRef.current = true;
    dispatch({ type });
  };

  return (
    // Keyed on the run, so every run (and every "run again") replays the
    // stream. The name is per agent, so switching agents morphs in place.
    <ItemCard
      key={`${agent.key}-${runs}`}
      vt={vtName("st-out", agent.key)}
      style={agentVars(agent)}
      className="pg-fresh-move border-[color-mix(in_oklab,var(--color-scene-1)_32%,transparent)] p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-semibold tracking-[0.06em] text-ink-50">{agent.name}</span>
        <span className="text-xs text-ink-400">{agent.role}</span>
        <span className="ml-auto flex items-center gap-1.5">
          {runId ? <span className="chip chip-mono">run·{runId}</span> : null}
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-line bg-ink-950/70 p-4 font-mono text-[12.5px] leading-relaxed">
        <p className="label-mono mb-2.5 flex items-center gap-2">
          <span aria-hidden className="text-scene-soft">›</span>
          {agent.key} · stdout
        </p>
        <div className="pg-stagger space-y-1.5">
          {agent.outputLines.map((line, i) => (
            <OutputLine key={i} line={line} />
          ))}
        </div>
      </div>

      {/* Approval gate. Writer agents wait for a human; read-only agents
          run autonomously. The wrapper is the stable live region: it
          exists before the decision, so the swap is announced. */}
      <div ref={gateRef} tabIndex={-1} aria-live="polite" className="mt-3.5 rounded-lg">
        {agent.gated ? (
          state.gate === "pending" ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip chip-caution">
                <span aria-hidden>⏸</span> Waiting on you · this would publish
              </span>
              <div className="flex gap-2 sm:ml-auto">
                <Button variant="positive" size="sm" arrow onClick={(e) => decide(e, "APPROVE")}>
                  Approve &amp; publish
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => decide(e, "DISCARD")}>
                  Discard
                </Button>
              </div>
            </div>
          ) : state.gate === "approved" ? (
            <span key="approved" className="chip chip-positive pop-in">
              <span aria-hidden>✓</span> Approved + published
            </span>
          ) : state.gate === "discarded" ? (
            <span key="discarded" className="chip pop-in">
              <span aria-hidden>✕</span> Draft discarded
            </span>
          ) : null
        ) : (
          <p className="flex flex-wrap items-center gap-2">
            <span className="chip chip-positive">
              <span aria-hidden>✓</span> Ran autonomously
            </span>
            <span className="text-[11px] text-ink-500">Read-only, nothing to approve</span>
          </p>
        )}
      </div>
    </ItemCard>
  );
}

// ─── Audit log pane ─────────────────────────────────────────────────

function AuditTimeline({ feed }: { feed: AuditEntry[] }) {
  const shown = feed.slice(0, FEED_LIMIT);
  const hidden = feed.length - shown.length;
  return (
    <>
      <ol aria-live="polite">
        {shown.map((e, i) => {
          const agent = findStudioAgent(e.actor.toLowerCase());
          const node = agent ? agent.color : "var(--color-scene-1)";
          return (
            <li
              key={e.id}
              style={{ viewTransitionName: vtName("st-feed", e.id) }}
              className={cn(
                "relative grid grid-cols-[14px_minmax(0,1fr)] gap-x-3 rounded-lg py-2 pr-2",
                e.fresh && "pg-fresh",
              )}
            >
              <span aria-hidden className="relative flex justify-center">
                <span
                  className={cn(
                    "relative z-10 mt-[5px] h-2 w-2 rounded-full ring-4 ring-ink-925 transition-opacity",
                    e.fresh ? "opacity-100" : "opacity-70",
                  )}
                  style={{ background: node, boxShadow: e.fresh ? `0 0 10px ${node}` : undefined }}
                />
                {i < shown.length - 1 ? <span className="absolute bottom-[-8px] top-[14px] w-px bg-white/[0.08]" /> : null}
              </span>
              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[13px] leading-snug text-ink-300">
                    <span className={cn("font-semibold", agent ? "tracking-[0.04em] text-ink-100" : "text-scene-soft")}>
                      {e.actor}
                    </span>{" "}
                    {e.action}
                  </p>
                  <time suppressHydrationWarning className="shrink-0 font-mono text-[10.5px] text-ink-500">
                    {formatRelative(e.ts)}
                  </time>
                </div>
                {e.detail ? <p className="mt-0.5 break-words text-xs leading-snug text-ink-500">{e.detail}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
      {hidden > 0 ? <p className="label-mono pl-[26px]">+{hidden} earlier</p> : null}
    </>
  );
}

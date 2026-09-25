// Interactive review state machine. The visitor moves one deliverable
// through its states on a drawn state diagram: the next legal states
// light up (click the node or the button), an orb flies along the edge,
// and every transition writes a row to a local audit log, so "every
// state change has a side effect" is visible without any database.
//
// The diagram is HTML nodes over one SVG of edges sharing a 960x300
// coordinate space; the container keeps that aspect, so nodes and edges
// scale together. On narrow screens it scrolls sideways rather than
// shrinking its labels past the type floor.

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { flowPulse } from "@/lib/flowPulse";
import { cn } from "@/lib/cn";
import { WidgetFrame, WidgetHeading, timeAgo } from "@/components/modules/WidgetFrame";

type State =
  | "DRAFT"
  | "INTERNAL_APPROVED"
  | "SUBMITTED_FOR_CLIENT"
  | "CLIENT_APPROVED"
  | "CLIENT_REVISION_REQUESTED";

type Transition = {
  label: string;
  to: State;
  variant: "primary" | "ghost";
  actor: string;
};

const FLOW: Record<State, Transition[]> = {
  DRAFT: [{ label: "Submit for internal review", to: "INTERNAL_APPROVED", variant: "primary", actor: "Sage (designer)" }],
  INTERNAL_APPROVED: [
    { label: "Submit for client review", to: "SUBMITTED_FOR_CLIENT", variant: "primary", actor: "Kai (PM)" },
    { label: "Send back to draft", to: "DRAFT", variant: "ghost", actor: "Kai (PM)" },
  ],
  SUBMITTED_FOR_CLIENT: [
    { label: "Approve", to: "CLIENT_APPROVED", variant: "primary", actor: "Mira (client)" },
    { label: "Request revision", to: "CLIENT_REVISION_REQUESTED", variant: "ghost", actor: "Mira (client)" },
  ],
  CLIENT_APPROVED: [],
  CLIENT_REVISION_REQUESTED: [{ label: "Back to draft", to: "DRAFT", variant: "primary", actor: "Sage (designer)" }],
};

const NODES: Record<State, { x: number; y: number; label: string }> = {
  DRAFT: { x: 110, y: 110, label: "Draft" },
  INTERNAL_APPROVED: { x: 360, y: 110, label: "Internal approved" },
  SUBMITTED_FOR_CLIENT: { x: 610, y: 110, label: "With client" },
  CLIENT_APPROVED: { x: 860, y: 110, label: "Client approved" },
  CLIENT_REVISION_REQUESTED: { x: 610, y: 240, label: "Revision requested" },
};

// Every legal edge, as an SVG path in the diagram's 960x300 space. Ends
// stop short of the node pills (sized for a ~850px diagram) so each
// arrowhead lands on the pill's edge instead of under it.
const EDGES: { from: State; to: State; d: string }[] = [
  { from: "DRAFT", to: "INTERNAL_APPROVED", d: "M161 110 H266" },
  { from: "INTERNAL_APPROVED", to: "SUBMITTED_FOR_CLIENT", d: "M450 110 H544" },
  { from: "SUBMITTED_FOR_CLIENT", to: "CLIENT_APPROVED", d: "M672 110 H777" },
  { from: "SUBMITTED_FOR_CLIENT", to: "CLIENT_REVISION_REQUESTED", d: "M610 129 V217" },
  { from: "CLIENT_REVISION_REQUESTED", to: "DRAFT", d: "M517 240 H140 Q110 240 110 210 V133" },
  { from: "INTERNAL_APPROVED", to: "DRAFT", d: "M330 93 C 290 22, 150 22, 118 88" },
];
const STATE_CHIP: Record<State, string> = {
  DRAFT: "chip",
  INTERNAL_APPROVED: "chip chip-caution",
  SUBMITTED_FOR_CLIENT: "chip chip-accent",
  CLIENT_APPROVED: "chip chip-positive",
  CLIENT_REVISION_REQUESTED: "chip chip-danger",
};

type AuditRow = { id: number; from: State; to: State; actor: string; at: Date };

const TASK_TITLE = "Brand poster, social cut · Lattice spring";

export function ReviewStateMachine() {
  const [state, setState] = useState<State>("DRAFT");
  const [audit, setAudit] = useState<AuditRow[]>([]);

  const transitions = FLOW[state];
  const next = new Set(transitions.map((t) => t.to));
  const walked = new Set(audit.map((r) => `${r.from}>${r.to}`));
  const visited = new Set<State>(["DRAFT", ...audit.map((r) => r.to)]);

  function transition(t: Transition) {
    const source = document.querySelector(`[data-flow="rsm-${state}"]`);
    flowPulse(source, `rsm-${t.to}`);
    setAudit((rows) => [{ id: (rows[0]?.id ?? 0) + 1, from: state, to: t.to, actor: t.actor, at: new Date() }, ...rows]);
    setState(t.to);
  }

  function reset() {
    setState("DRAFT");
    setAudit([]);
  }

  return (
    <div className="space-y-6">
      <WidgetFrame
        crumb="Review state machine"
        toolbar={
          <Button
            variant="ghost"
            size="sm"
            icon="↻"
            onClick={reset}
            disabled={state === "DRAFT" && audit.length === 0}
            className="font-mono uppercase tracking-[0.08em]"
          >
            Reset
          </Button>
        }
      >
        {/* The diagram */}
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <div className="relative aspect-[960/300] min-w-[640px]">
            <svg viewBox="0 0 960 300" className="absolute inset-0 h-full w-full" aria-hidden>
              <defs>
                {(["live", "walked", "idle"] as const).map((k) => (
                  <marker
                    key={k}
                    id={`rsm-arrow-${k}`}
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path
                      d="M0 0 L10 5 L0 10 z"
                      fill={k === "live" ? "var(--color-scene-1)" : k === "walked" ? "var(--color-ink-400)" : "var(--color-ink-700)"}
                    />
                  </marker>
                ))}
              </defs>
              {EDGES.map((e) => {
                const live = e.from === state;
                const done = walked.has(`${e.from}>${e.to}`);
                const kind = live ? "live" : done ? "walked" : "idle";
                return (
                  <path
                    key={`${e.from}>${e.to}`}
                    d={e.d}
                    fill="none"
                    strokeWidth={live ? 2 : 1.5}
                    strokeDasharray={e.to === "DRAFT" && !live ? "5 6" : undefined}
                    markerEnd={`url(#rsm-arrow-${kind})`}
                    className={cn("transition-[stroke,opacity] duration-500", live && "rsm-edge-live")}
                    stroke={
                      live ? "var(--color-scene-1)" : done ? "var(--color-ink-400)" : "var(--color-ink-700)"
                    }
                  />
                );
              })}
            </svg>

            {(Object.keys(NODES) as State[]).map((s) => {
              const n = NODES[s];
              const current = s === state;
              const available = next.has(s);
              const t = transitions.find((x) => x.to === s);
              const base =
                "absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-[background-color,border-color,color,box-shadow] duration-300";
              const style = { left: `${(n.x / 960) * 100}%`, top: `${(n.y / 300) * 100}%` };
              if (available && t) {
                return (
                  <button
                    key={s}
                    type="button"
                    data-flow={`rsm-${s}`}
                    style={style}
                    onClick={() => transition(t)}
                    aria-label={`${t.label}: move to ${n.label}`}
                    className={cn(
                      base,
                      "border-dashed border-[color-mix(in_oklab,var(--color-scene-1)_60%,transparent)] bg-ink-900 text-scene-soft hover:border-solid hover:bg-[color-mix(in_oklab,var(--color-scene-1)_14%,var(--color-ink-900))] hover:text-white",
                    )}
                  >
                    <span aria-hidden className="text-[10px]">
                      →
                    </span>
                    {n.label}
                  </button>
                );
              }
              return (
                <div
                  key={s}
                  data-flow={`rsm-${s}`}
                  style={style}
                  aria-current={current ? "step" : undefined}
                  className={cn(
                    base,
                    current
                      ? "border-[var(--color-scene-1)] bg-[color-mix(in_oklab,var(--color-scene-1)_18%,var(--color-ink-900))] text-ink-50 shadow-[0_0_28px_-6px_var(--color-scene-glow)]"
                      : visited.has(s)
                        ? "border-line-strong bg-ink-900 text-ink-300"
                        : "border-line bg-ink-925 text-ink-500",
                  )}
                >
                  {current ? (
                    <span aria-hidden className="live-dot text-scene" />
                  ) : visited.has(s) ? (
                    <span aria-hidden className="text-[10px] text-ink-400">
                      ✓
                    </span>
                  ) : null}
                  {n.label}
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-ink-500 md:hidden">Swipe sideways to see the whole diagram.</p>
        <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-0.5 w-4 rounded bg-scene" /> legal next move
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-0.5 w-4 rounded bg-ink-400" /> taken this session
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-0.5 w-4 rounded bg-ink-700" /> not taken
          </span>
        </p>

        {/* The deliverable */}
        <article data-spot className="item mt-6 rounded-xl p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="label-mono">Deliverable</p>
              <p className="mt-1.5 text-[15px] font-semibold text-ink-50">{TASK_TITLE}</p>
            </div>
            <span key={state} className={cn(STATE_CHIP[state], "chip-mono pop-in")}>
              {state}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {transitions.length === 0 ? (
              <p className="text-sm text-ink-400">
                Terminal state: the deliverable is shipped and locked. Reset to run the loop again.
              </p>
            ) : (
              transitions.map((t) => (
                <Button
                  key={t.label}
                  variant={t.variant === "primary" ? "accent" : "quiet"}
                  size="sm"
                  arrow={t.variant === "primary"}
                  onClick={() => transition(t)}
                >
                  {t.label}
                </Button>
              ))
            )}
          </div>
          <p className="mt-4 border-t border-line pt-3 text-xs text-ink-500">
            Visible to <span className="text-ink-300">{actorFor(state)}</span>
          </p>
        </article>
      </WidgetFrame>

      {/* Audit log */}
      <section aria-labelledby="rsm-audit-heading" className="surface rounded-2xl p-5 md:p-6">
        <WidgetHeading id="rsm-audit-heading" aside="Retention: CONTRACT tier, 7 years">
          Audit log, this session
        </WidgetHeading>
        {audit.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-white/[0.1] px-4 py-6 text-center text-xs leading-relaxed text-ink-500">
            No transitions yet. Move the deliverable and a row lands here. In production these rows live for seven
            years.
          </p>
        ) : (
          <ol aria-live="polite" className="mt-5 space-y-2">
            {audit.map((row) => (
              <li key={row.id} className="row-land flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-[13px]">
                    <span className="font-mono text-[11px] text-ink-500">#{row.id}</span>
                    <span className={cn(STATE_CHIP[row.from], "chip-mono opacity-70")}>{row.from}</span>
                    <span aria-hidden className="text-ink-500">
                      →
                    </span>
                    <span className="sr-only">to</span>
                    <span className={cn(STATE_CHIP[row.to], "chip-mono")}>{row.to}</span>
                  </p>
                  <p className="mt-1.5 text-xs text-ink-500">
                    <span className="text-ink-300">{row.actor}</span> · <time suppressHydrationWarning>{timeAgo(row.at)}</time>
                  </p>
                </div>
                <span className="chip chip-mono">contract 7y</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function actorFor(state: State): string {
  switch (state) {
    case "DRAFT":
      return "Sage (designer)";
    case "INTERNAL_APPROVED":
      return "Kai (PM), Sage";
    case "SUBMITTED_FOR_CLIENT":
      return "Mira (client), Kai, Sage";
    case "CLIENT_APPROVED":
      return "everyone, locked";
    case "CLIENT_REVISION_REQUESTED":
      return "Sage (designer), Kai";
  }
}

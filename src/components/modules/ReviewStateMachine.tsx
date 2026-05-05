"use client";

// Interactive review state machine demo. Visitor moves a single
// deliverable through transitions. Each transition writes a row to a
// local audit log so the visitor sees the discipline of "every state
// change has a side effect" without any DB involvement.

import { useState } from "react";

type State =
  | "DRAFT"
  | "INTERNAL_APPROVED"
  | "SUBMITTED_FOR_CLIENT"
  | "CLIENT_APPROVED"
  | "CLIENT_REVISION_REQUESTED";

type Transition = {
  label: string;
  to: State;
  variant?: "primary" | "ghost";
  actor: string;
};

const FLOW: Record<State, Transition[]> = {
  DRAFT: [
    { label: "submit for internal review", to: "INTERNAL_APPROVED", variant: "primary", actor: "Sage (designer)" },
  ],
  INTERNAL_APPROVED: [
    { label: "submit for client review", to: "SUBMITTED_FOR_CLIENT", variant: "primary", actor: "Kai (PM)" },
    { label: "send back to draft", to: "DRAFT", variant: "ghost", actor: "Kai (PM)" },
  ],
  SUBMITTED_FOR_CLIENT: [
    { label: "approve", to: "CLIENT_APPROVED", variant: "primary", actor: "Mira (client)" },
    { label: "request revision", to: "CLIENT_REVISION_REQUESTED", variant: "ghost", actor: "Mira (client)" },
  ],
  CLIENT_APPROVED: [],
  CLIENT_REVISION_REQUESTED: [
    { label: "back to draft", to: "DRAFT", variant: "primary", actor: "Sage (designer)" },
  ],
};

const STATE_TONE: Record<State, string> = {
  DRAFT: "border-zinc-700 text-zinc-300",
  INTERNAL_APPROVED: "border-amber-400/40 text-amber-300",
  SUBMITTED_FOR_CLIENT: "border-[var(--color-scene-1)]/50 text-[var(--color-scene-1)]",
  CLIENT_APPROVED: "border-emerald-400/40 text-emerald-300",
  CLIENT_REVISION_REQUESTED: "border-rose-400/40 text-rose-300",
};

type AuditRow = {
  id: number;
  from: State;
  to: State;
  actor: string;
  at: Date;
};

const TASK_TITLE = "Brand poster, social cut · Lattice spring";

export function ReviewStateMachine() {
  const [state, setState] = useState<State>("DRAFT");
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [counter, setCounter] = useState(0);

  const transitions = FLOW[state];

  function transition(t: Transition) {
    const id = counter + 1;
    setCounter(id);
    setAudit((rows) => [
      { id, from: state, to: t.to, actor: t.actor, at: new Date() },
      ...rows,
    ]);
    setState(t.to);
  }

  function reset() {
    setState("DRAFT");
    setAudit([]);
    setCounter(0);
  }

  return (
    <div className="space-y-8">
      {/* Deliverable card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              deliverable
            </p>
            <p className="mt-2 text-base font-medium text-zinc-100">
              {TASK_TITLE}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${STATE_TONE[state]}`}
          >
            {state.replace(/_/g, " ").toLowerCase()}
          </span>
        </div>

        {/* Available transitions */}
        <div className="mt-6 flex flex-wrap gap-2">
          {transitions.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Terminal state. Nothing more to do, the deliverable is shipped.
              Hit reset to try the loop again.
            </p>
          ) : (
            transitions.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => transition(t)}
                className={
                  t.variant === "primary"
                    ? "rounded-md border border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/15 px-3 py-1.5 text-xs text-[var(--color-scene-1)] transition-colors hover:bg-[var(--color-scene-1)]/25"
                    : "rounded-md border border-white/10 bg-transparent px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-white/30"
                }
              >
                {t.label} →
              </button>
            ))
          )}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
            visible-to · {actorFor(state)}
          </p>
          <button
            type="button"
            onClick={reset}
            disabled={state === "DRAFT" && audit.length === 0}
            className="rounded-md border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400 transition-colors hover:border-white/30 hover:text-zinc-200 disabled:opacity-40"
          >
            ↻ reset
          </button>
        </div>
      </div>

      {/* Audit log */}
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
          audit log, this session
        </p>
        {audit.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-sm text-zinc-500">
            No transitions yet. Click a transition above and watch a row land
            here. In production these rows live forever (CONTRACT-tier
            retention, 7 years).
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03]">
            {audit.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm text-zinc-200">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      transition
                    </span>{" "}
                    <span className="text-zinc-100">{row.from}</span>
                    <span className="text-zinc-600"> → </span>
                    <span className="text-[var(--color-scene-1)]">{row.to}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {row.actor} · {timeAgo(row.at)}
                  </p>
                </div>
                <span className="rounded-sm border border-zinc-700 bg-zinc-900/60 px-2 py-0.5 font-mono text-[9px] text-zinc-500">
                  contract 7y
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function actorFor(state: State): string {
  switch (state) {
    case "DRAFT":
      return "Sage (designer)";
    case "INTERNAL_APPROVED":
      return "Kai (PM) · Sage";
    case "SUBMITTED_FOR_CLIENT":
      return "Mira (client) · Kai · Sage";
    case "CLIENT_APPROVED":
      return "everyone, locked";
    case "CLIENT_REVISION_REQUESTED":
      return "Sage (designer) · Kai";
  }
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

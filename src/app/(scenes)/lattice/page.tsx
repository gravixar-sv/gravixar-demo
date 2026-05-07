"use client";

// Lattice playground — single-page 3-column live workspace. Replaces
// the persona-pick model from the original Lattice scene. Action in
// any column ripples into the audit feed (and, in session 2, into
// mini-banner cues across the other columns).
//
// Session 1 (this commit): bare functional rendering. State machine
// wired, all ripples working, no styling polish yet — sessions 2 and
// 3 add the column components, animations, mobile layout, topbar,
// gallery rail update, and tour retirement.

import { useEffect, useReducer } from "react";
import {
  PLAYGROUND_DELIVERABLE,
  PLAYGROUND_INQUIRY,
  PLAYGROUND_PERSONAS,
} from "@/lib/playground/script";
import {
  createInitialPlaygroundState,
  playgroundReducer,
  type AuditEntry,
} from "@/lib/playground/reducer";

const FRESH_DECAY_MS = 2000;

export default function LatticePlayground() {
  const [state, dispatch] = useReducer(
    playgroundReducer,
    undefined,
    createInitialPlaygroundState,
  );

  // After each fresh row appears, schedule a DECAY_FRESH so the row
  // settles into its normal state. Session 2 wires this up to a pulse
  // animation; session 1 just needs the flag to flip on schedule.
  useEffect(() => {
    const freshIds = state.audit.filter((a) => a.fresh).map((a) => a.id);
    if (freshIds.length === 0) return;

    const timers = freshIds.map((id) =>
      window.setTimeout(
        () => dispatch({ type: "DECAY_FRESH", id }),
        FRESH_DECAY_MS,
      ),
    );
    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
  }, [state.audit]);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-scene-1)]">
            Lattice Studio · agency client portal
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Three roles, one system. Click anywhere; watch the other panels
            react.
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: "RESET" })}
          className="rounded border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-zinc-50"
        >
          ↻ reset
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr_1.2fr]">
        <ClientColumn
          approved={state.approved}
          revisionRequested={state.revisionRequested}
          comment={state.comment}
          replied={state.replied}
          onApprove={() => dispatch({ type: "APPROVE" })}
          onRevise={() => dispatch({ type: "REVISE" })}
          onCommentChange={(value) =>
            dispatch({ type: "SET_COMMENT", value })
          }
        />
        <PMColumn
          replied={state.replied}
          approved={state.approved}
          onSendReply={() => dispatch({ type: "SEND_REPLY" })}
        />
        <AdminColumn audit={state.audit} />
      </div>
    </div>
  );
}

// ─── Columns ──────────────────────────────────────────────────────

function ColumnShell({
  persona,
  children,
}: {
  persona: { name: string; role: string; contextLine: string };
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <header className="mb-4 border-b border-white/5 pb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          {persona.role}
        </p>
        <p className="mt-1 text-base font-medium text-zinc-50">
          {persona.name}
        </p>
        <p className="mt-1 text-xs text-zinc-400">{persona.contextLine}</p>
      </header>
      {children}
    </section>
  );
}

function ClientColumn({
  approved,
  revisionRequested,
  comment,
  replied,
  onApprove,
  onRevise,
  onCommentChange,
}: {
  approved: boolean;
  revisionRequested: boolean;
  comment: string;
  replied: boolean;
  onApprove: () => void;
  onRevise: () => void;
  onCommentChange: (value: string) => void;
}) {
  const locked = approved || revisionRequested;

  return (
    <ColumnShell persona={PLAYGROUND_PERSONAS.mira}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        awaiting review
      </p>
      <div className="mt-3 rounded border border-white/10 bg-white/[0.02] p-4">
        <p className="text-sm font-medium text-zinc-100">
          {PLAYGROUND_DELIVERABLE.fullTitle}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          submitted by {PLAYGROUND_DELIVERABLE.designer}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-zinc-400">
          {PLAYGROUND_DELIVERABLE.blurb}
        </p>

        <label className="mt-4 block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            note for the designer (optional)
          </span>
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            disabled={locked}
            rows={2}
            placeholder="Looks great — just check the kerning on the wordmark…"
            className="mt-1.5 w-full rounded border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 disabled:opacity-50"
          />
        </label>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onApprove}
            disabled={locked}
            className="rounded border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Approve →
          </button>
          <button
            type="button"
            onClick={onRevise}
            disabled={locked}
            className="rounded border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Request revision
          </button>
        </div>

        {approved ? (
          <p className="mt-3 text-xs text-emerald-300">
            ✓ Approved · {PLAYGROUND_DELIVERABLE.title}
          </p>
        ) : null}
        {revisionRequested ? (
          <p className="mt-3 text-xs text-amber-300">
            ↺ Revision requested · {PLAYGROUND_DELIVERABLE.title}
          </p>
        ) : null}
      </div>

      {replied ? (
        <p className="mt-4 rounded border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300">
          {PLAYGROUND_PERSONAS.kai.firstName} replied on the{" "}
          {PLAYGROUND_INQUIRY.fromCompany} inquiry
        </p>
      ) : null}
    </ColumnShell>
  );
}

function PMColumn({
  replied,
  approved,
  onSendReply,
}: {
  replied: boolean;
  approved: boolean;
  onSendReply: () => void;
}) {
  return (
    <ColumnShell persona={PLAYGROUND_PERSONAS.kai}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        awaiting reply
      </p>
      <div className="mt-3 rounded border border-white/10 bg-white/[0.02] p-4">
        <p className="text-sm font-medium text-zinc-100">
          {PLAYGROUND_INQUIRY.fromCompany}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {PLAYGROUND_INQUIRY.fromName} · {PLAYGROUND_INQUIRY.summary}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-zinc-400">
          {PLAYGROUND_INQUIRY.preview}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-sm border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
            {replied ? "AWAITING_CALL" : "PM_ASSIGNED"}
          </span>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={onSendReply}
            disabled={replied}
            className="rounded border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-xs font-medium text-sky-200 transition-colors hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send first reply →
          </button>
        </div>

        {replied ? (
          <p className="mt-3 text-xs text-sky-300">
            ✓ Reply sent · awaiting discovery call
          </p>
        ) : null}
      </div>

      {approved ? (
        <p className="mt-4 rounded border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300">
          {PLAYGROUND_PERSONAS.mira.firstName} approved{" "}
          {PLAYGROUND_DELIVERABLE.title} — call her on Tuesday
        </p>
      ) : null}
    </ColumnShell>
  );
}

function AdminColumn({ audit }: { audit: AuditEntry[] }) {
  return (
    <ColumnShell persona={PLAYGROUND_PERSONAS.nox}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        activity feed
      </p>
      <ul className="mt-3 space-y-2">
        {audit.map((entry) => (
          <li
            key={entry.id}
            className={[
              "rounded border px-3 py-2 text-xs",
              entry.fresh
                ? "border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/10 text-zinc-100"
                : "border-white/10 bg-white/[0.02] text-zinc-300",
            ].join(" ")}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                {formatRelative(entry.ts)}
              </span>
              {entry.fresh ? (
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
                  new
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-zinc-200">
              <span className="font-medium">{entry.actor}</span>{" "}
              <span className="text-zinc-400">{entry.action}</span>
              {entry.detail ? (
                <>
                  {" "}
                  <span className="text-zinc-500">·</span>{" "}
                  <span>{entry.detail}</span>
                </>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
    </ColumnShell>
  );
}

// ─── helpers ──────────────────────────────────────────────────────

function formatRelative(ts: number): string {
  const deltaSec = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (deltaSec < 30) return "just now";
  if (deltaSec < 90) return "1 min ago";
  if (deltaSec < 3600) return `${Math.round(deltaSec / 60)} min ago`;
  if (deltaSec < 7200) return "1 hr ago";
  return `${Math.round(deltaSec / 3600)} hr ago`;
}

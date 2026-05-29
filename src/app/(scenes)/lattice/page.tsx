"use client";

// Lattice playground — a single-page, 3-column live workspace.
// Client / PM / Admin columns share one reducer: an action in any
// column prepends an audit row and ripples a cue into the others.
// This is the "watch the other panels react" demo. No sign-in, no DB;
// each visitor gets isolated client-side state.

import { useEffect, useReducer } from "react";
import {
  PLAYGROUND_DELIVERABLE,
  PLAYGROUND_INQUIRY,
  PLAYGROUND_PERSONAS,
  type PlaygroundPersona,
} from "@/lib/playground/script";
import {
  createInitialPlaygroundState,
  playgroundReducer,
  type AuditEntry,
} from "@/lib/playground/reducer";
import { SceneCTA } from "@/components/demo/SceneCTA";

const FRESH_DECAY_MS = 2000;

export default function LatticePlayground() {
  const [state, dispatch] = useReducer(
    playgroundReducer,
    undefined,
    createInitialPlaygroundState,
  );

  // After each fresh row appears, settle it back to rest so the next
  // action's highlight reads as new.
  useEffect(() => {
    const freshIds = state.audit.filter((a) => a.fresh).map((a) => a.id);
    if (freshIds.length === 0) return;
    const timers = freshIds.map((id) =>
      window.setTimeout(() => dispatch({ type: "DECAY_FRESH", id }), FRESH_DECAY_MS),
    );
    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
  }, [state.audit]);

  const actionsTaken =
    Number(state.approved || state.revisionRequested) + Number(state.replied);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10 lg:px-12">
      {/* ── Orientation ─────────────────────────────────────────── */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-scene-1)]">
            client portal · built for agencies · live sandbox
          </p>
          <h1 className="mt-3 text-3xl font-medium leading-tight tracking-[-0.02em] text-zinc-50 md:text-4xl">
            Three roles, one system.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-400">
            This is the client portal I built for a creative agency — the
            client, the project manager, and the admin, side by side. Do
            something in any column and watch the others react in real time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {actionsTaken > 0 ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
              {actionsTaken} action{actionsTaken > 1 ? "s" : ""} · feed live
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => dispatch({ type: "RESET" })}
            className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-zinc-50"
          >
            ↻ reset
          </button>
        </div>
      </header>

      {/* ── 3 columns (stack on mobile, Admin widest on lg) ──────── */}
      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr_1.15fr]">
        <ClientColumn
          approved={state.approved}
          revisionRequested={state.revisionRequested}
          comment={state.comment}
          replied={state.replied}
          onApprove={() => dispatch({ type: "APPROVE" })}
          onRevise={() => dispatch({ type: "REVISE" })}
          onCommentChange={(value) => dispatch({ type: "SET_COMMENT", value })}
        />
        <PMColumn
          replied={state.replied}
          approved={state.approved}
          onSendReply={() => dispatch({ type: "SEND_REPLY" })}
        />
        <AdminColumn audit={state.audit} />
      </div>

      <SceneCTA personaLabel="Agency" />
    </div>
  );
}

// ─── Column shell ───────────────────────────────────────────────────

function ColumnShell({
  persona,
  status,
  children,
}: {
  persona: PlaygroundPersona;
  status: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scene-card rounded-2xl p-5">
      <header className="flex items-center gap-3 border-b border-white/5 pb-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-scene-1)] to-[var(--color-scene-2)] font-mono text-[11px] font-semibold text-[#0a1230]">
          {persona.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-50">
            {persona.name}
            <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
              {persona.role}
            </span>
          </p>
          <p className="truncate text-[11px] text-zinc-500">
            {persona.contextLine}
          </p>
        </div>
      </header>
      <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
        {status}
      </p>
      {children}
    </section>
  );
}

// ─── Cross-column cue (the "ripple") ────────────────────────────────

function Cue({ children }: { children: React.ReactNode }) {
  return (
    <div className="pg-cue mt-4 flex items-start gap-2 rounded-lg border border-[var(--color-scene-1)]/30 bg-[var(--color-scene-1)]/[0.08] px-3 py-2 text-xs text-zinc-200">
      <span aria-hidden className="mt-0.5 text-[var(--color-scene-1)]">⟳</span>
      <span>{children}</span>
    </div>
  );
}

// ─── Client column ──────────────────────────────────────────────────

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
    <ColumnShell persona={PLAYGROUND_PERSONAS.mira} status="awaiting your review">
      <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-medium text-zinc-100">
          {PLAYGROUND_DELIVERABLE.fullTitle}
        </p>
        <p className="mt-1 text-[11px] text-zinc-500">
          submitted by {PLAYGROUND_DELIVERABLE.designer}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-zinc-400">
          {PLAYGROUND_DELIVERABLE.blurb}
        </p>

        <label className="mt-4 block">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
            note for the designer (optional)
          </span>
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            disabled={locked}
            rows={2}
            placeholder="Looks great — just check the kerning on the wordmark…"
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-[var(--color-scene-1)]/40 focus:outline-none disabled:opacity-50"
          />
        </label>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onApprove}
            disabled={locked}
            className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Approve →
          </button>
          <button
            type="button"
            onClick={onRevise}
            disabled={locked}
            className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-40"
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

      {/* Ripple in from the PM column */}
      {replied ? (
        <Cue>
          {PLAYGROUND_PERSONAS.kai.firstName} just replied on the{" "}
          {PLAYGROUND_INQUIRY.fromCompany} inquiry — you&apos;re in the loop.
        </Cue>
      ) : null}
    </ColumnShell>
  );
}

// ─── PM column ──────────────────────────────────────────────────────

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
    <ColumnShell persona={PLAYGROUND_PERSONAS.kai} status="new inquiry · awaiting reply">
      <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-medium text-zinc-100">
          {PLAYGROUND_INQUIRY.fromCompany}
        </p>
        <p className="mt-1 text-[11px] text-zinc-500">
          {PLAYGROUND_INQUIRY.fromName} · {PLAYGROUND_INQUIRY.summary}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-zinc-400">
          {PLAYGROUND_INQUIRY.preview}
        </p>

        <div className="mt-3">
          <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
            {replied ? "awaiting_call" : "pm_assigned"}
          </span>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={onSendReply}
            disabled={replied}
            className="rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-xs font-medium text-sky-200 transition-colors hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-40"
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

      {/* Ripple in from the Client column */}
      {approved ? (
        <Cue>
          {PLAYGROUND_PERSONAS.mira.firstName} just approved{" "}
          {PLAYGROUND_DELIVERABLE.title} — schedule the Tuesday call.
        </Cue>
      ) : null}
    </ColumnShell>
  );
}

// ─── Admin column (live feed) ───────────────────────────────────────

function AdminColumn({ audit }: { audit: AuditEntry[] }) {
  return (
    <ColumnShell persona={PLAYGROUND_PERSONAS.nox} status="activity feed · real-time">
      <ul className="mt-3 space-y-2">
        {audit.map((entry) => (
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
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                {formatRelative(entry.ts)}
              </span>
              {entry.fresh ? (
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
                  new
                </span>
              ) : null}
            </div>
            <p className="mt-1 leading-relaxed text-zinc-200">
              <span className="font-medium">{entry.actor}</span>{" "}
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

// ─── helpers ────────────────────────────────────────────────────────

function formatRelative(ts: number): string {
  const deltaSec = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (deltaSec < 30) return "just now";
  if (deltaSec < 90) return "1 min ago";
  if (deltaSec < 3600) return `${Math.round(deltaSec / 60)} min ago`;
  if (deltaSec < 7200) return "1 hr ago";
  return `${Math.round(deltaSec / 3600)} hr ago`;
}

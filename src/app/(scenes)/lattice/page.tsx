"use client";

// Lattice review-loop — a deliverable handoff across three columns.
// Client (Mira) · PM (Kai) · Editor (Sage). A deliverable is a real
// object that moves column→column as it's approved / revised / pushed
// back, with an attachment that pops on hover and an activity feed
// logging every hop. See src/lib/playground/lattice-deliverables.ts.

import { useEffect, useReducer, useState } from "react";
import {
  PERSONAS,
  createInitialLatticeState,
  latticeReducer,
  type Deliverable,
  type FeedEntry,
  type Persona,
} from "@/lib/playground/lattice-deliverables";
import { Avatar } from "@/components/demo/Avatar";
import { MockupThumb } from "@/components/demo/DeliverableMockup";
import { SceneCTA } from "@/components/demo/SceneCTA";

const FRESH_DECAY_MS = 2200;

export default function LatticeReviewLoop() {
  const [state, dispatch] = useReducer(
    latticeReducer,
    undefined,
    createInitialLatticeState,
  );

  useEffect(() => {
    const ids = [
      ...state.deliverables.filter((d) => d.fresh).map((d) => d.id),
      ...state.feed.filter((f) => f.fresh).map((f) => f.id),
    ];
    if (ids.length === 0) return;
    const timers = ids.map((id) =>
      window.setTimeout(() => dispatch({ type: "DECAY_FRESH", id }), FRESH_DECAY_MS),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [state.deliverables, state.feed]);

  const byState = (...states: Deliverable["state"][]) =>
    state.deliverables.filter((d) => states.includes(d.state));

  const shipped = byState("shipped").length;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10 lg:px-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-scene-1)]">
            client portal · built for agencies · live sandbox
          </p>
          <h1 className="mt-3 text-3xl font-medium leading-tight tracking-[-0.02em] text-zinc-50 md:text-4xl">
            Watch a deliverable move.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-400">
            The agency&apos;s work flows Editor → PM → Client and back. Act in
            any column — approve, request a revision, push it back — and watch
            the card hand off to the next person. Hover any thumbnail to preview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {shipped > 0 ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/80">
              {shipped} shipped
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

      <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:pb-0">
        {/* ── Client ── */}
        <Column persona={PERSONAS.client} status="your review">
          {byState("with_client").map((d) => (
            <ClientCard key={d.id} d={d} dispatch={dispatch} />
          ))}
          {byState("shipped").map((d) => (
            <DoneCard key={d.id} d={d} label="Shipped" tone="emerald" />
          ))}
          <EmptyIf
            show={byState("with_client", "shipped").length === 0}
            text="Nothing waiting on you right now."
          />
        </Column>

        {/* ── PM ── */}
        <Column persona={PERSONAS.pm} status="queue">
          {byState("in_pm_review").map((d) => (
            <PMReviewCard key={d.id} d={d} dispatch={dispatch} />
          ))}
          {byState("revision_requested").map((d) => (
            <PMRevisionCard key={d.id} d={d} dispatch={dispatch} />
          ))}
          <EmptyIf
            show={byState("in_pm_review", "revision_requested").length === 0}
            text="Inbox clear."
          />
        </Column>

        {/* ── Editor ── */}
        <Column persona={PERSONAS.editor} status="in progress">
          {byState("editing").map((d) => (
            <EditorCard key={d.id} d={d} dispatch={dispatch} />
          ))}
          <EmptyIf
            show={byState("editing").length === 0}
            text="No revisions to action."
          />
        </Column>
      </div>

      <ActivityFeed feed={state.feed} />

      <SceneCTA personaLabel="Agencies" noun="agency" />
    </div>
  );
}

// ─── Shared bits ────────────────────────────────────────────────────

function Column({
  persona,
  status,
  children,
}: {
  persona: Persona;
  status: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scene-card min-w-[82%] shrink-0 snap-start rounded-2xl p-5 sm:min-w-[48%] lg:min-w-0">
      <header className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Avatar initials={persona.initials} hue={persona.hue} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-50">
            {persona.name}
            <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
              {persona.role}
            </span>
          </p>
          <p className="truncate text-[11px] text-zinc-500">{persona.contextLine}</p>
        </div>
      </header>
      <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
        {status}
      </p>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function CardShell({
  d,
  children,
}: {
  d: Deliverable;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "rounded-xl border p-3.5",
        d.fresh
          ? "pg-fresh border-[var(--color-scene-1)]/45"
          : "border-white/10 bg-black/20",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <MockupThumb kind={d.kind} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-tight text-zinc-100">{d.title}</p>
          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
            v{d.version}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

function EmptyIf({ show, text }: { show: boolean; text: string }) {
  if (!show) return null;
  return (
    <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-zinc-600">
      {text}
    </p>
  );
}

// ─── Client cards ───────────────────────────────────────────────────

function ClientCard({
  d,
  dispatch,
}: {
  d: Deliverable;
  dispatch: React.Dispatch<import("@/lib/playground/lattice-deliverables").LatticeEvent>;
}) {
  const [note, setNote] = useState("");
  const [revising, setRevising] = useState(false);

  return (
    <CardShell d={d}>
      {revising ? (
        <div className="mt-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="What should change?"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-[var(--color-scene-1)]/40 focus:outline-none"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: "CLIENT_REVISE", id: d.id, note })}
              className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-400/20"
            >
              Send revision →
            </button>
            <button
              type="button"
              onClick={() => setRevising(false)}
              className="rounded-lg px-2 py-1.5 text-xs text-zinc-500 hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "CLIENT_APPROVE", id: d.id })}
            className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-400/20"
          >
            Approve →
          </button>
          <button
            type="button"
            onClick={() => setRevising(true)}
            className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-400/20"
          >
            Request revision
          </button>
        </div>
      )}
    </CardShell>
  );
}

// ─── PM cards ───────────────────────────────────────────────────────

function PMReviewCard({
  d,
  dispatch,
}: {
  d: Deliverable;
  dispatch: React.Dispatch<import("@/lib/playground/lattice-deliverables").LatticeEvent>;
}) {
  return (
    <CardShell d={d}>
      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
        from editor · needs your sign-off
      </p>
      <button
        type="button"
        onClick={() => dispatch({ type: "PM_APPROVE", id: d.id })}
        className="mt-2 rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-xs font-medium text-sky-200 transition-colors hover:bg-sky-400/20"
      >
        Approve &amp; send to client →
      </button>
    </CardShell>
  );
}

function PMRevisionCard({
  d,
  dispatch,
}: {
  d: Deliverable;
  dispatch: React.Dispatch<import("@/lib/playground/lattice-deliverables").LatticeEvent>;
}) {
  return (
    <CardShell d={d}>
      <p className="mt-2 rounded-md border border-amber-400/20 bg-amber-400/[0.06] px-2.5 py-1.5 text-[11px] leading-relaxed text-amber-200/90">
        <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-amber-300/70">
          client note ·{" "}
        </span>
        {d.revisionNote}
      </p>
      <button
        type="button"
        onClick={() => dispatch({ type: "PM_TO_EDITOR", id: d.id })}
        className="mt-2 rounded-lg border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-xs font-medium text-violet-200 transition-colors hover:bg-violet-400/20"
      >
        Push to editor →
      </button>
    </CardShell>
  );
}

// ─── Editor card ────────────────────────────────────────────────────

function EditorCard({
  d,
  dispatch,
}: {
  d: Deliverable;
  dispatch: React.Dispatch<import("@/lib/playground/lattice-deliverables").LatticeEvent>;
}) {
  return (
    <CardShell d={d}>
      {d.revisionNote ? (
        <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
          Reworking against the client&apos;s note. New cut staged.
        </p>
      ) : (
        <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
          Drafting the first cut.
        </p>
      )}
      <button
        type="button"
        onClick={() => dispatch({ type: "EDITOR_SUBMIT", id: d.id })}
        className="mt-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-400/20"
      >
        ↑ Submit for review
      </button>
    </CardShell>
  );
}

// ─── Done card ──────────────────────────────────────────────────────

function DoneCard({
  d,
  label,
}: {
  d: Deliverable;
  label: string;
  tone: "emerald";
}) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-xl border px-3.5 py-3",
        d.fresh ? "pg-fresh border-emerald-400/40" : "border-white/10 bg-black/20",
      ].join(" ")}
    >
      <MockupThumb kind={d.kind} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-200">{d.title}</p>
        <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300/80">
          ✓ {label} · v{d.version}
        </p>
      </div>
    </div>
  );
}

// ─── Activity feed ──────────────────────────────────────────────────

function ActivityFeed({ feed }: { feed: FeedEntry[] }) {
  return (
    <section className="mt-5 scene-card rounded-2xl p-5">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
        activity feed · real-time
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {feed.slice(0, 6).map((e) => (
          <li
            key={e.id}
            className={[
              "rounded-lg border px-3 py-2 text-xs",
              e.fresh
                ? "pg-fresh border-[var(--color-scene-1)]/40 text-zinc-100"
                : "border-white/10 bg-white/[0.02] text-zinc-300",
            ].join(" ")}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
              {formatRelative(e.ts)}
            </span>
            <p className="mt-1 leading-relaxed">
              <span className="font-medium text-zinc-200">{e.actor}</span>{" "}
              <span className="text-zinc-400">{e.action}</span>
              {e.detail ? <span className="text-zinc-500"> · {e.detail}</span> : null}
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

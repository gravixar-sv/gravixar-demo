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
import { OutcomePanel } from "@/components/demo/OutcomePanel";
import { LearnBeat } from "@/components/demo/LearnBeat";
import { flowPulse } from "@/lib/flowPulse";
import { formatRelative } from "@/lib/formatRelative";

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
      ...state.rules.filter((r) => r.fresh).map((r) => r.id),
      ...state.feed.filter((f) => f.fresh).map((f) => f.id),
    ];
    if (ids.length === 0) return;
    const timers = ids.map((id) =>
      window.setTimeout(() => dispatch({ type: "DECAY_FRESH", id }), FRESH_DECAY_MS),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [state.deliverables, state.rules, state.feed]);

  const byState = (...states: Deliverable["state"][]) =>
    state.deliverables.filter((d) => states.includes(d.state));

  const shipped = byState("shipped").length;
  const learnedCount = state.rules.filter((r) => r.learned).length;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10 lg:px-12">
      <div aria-hidden className="scene-conduit mb-7" />
      <header className="scene-rise flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-scene-1)]">
            agency OS · a real, in-use system · live sandbox
          </p>
          <h1 className="mt-3 text-3xl font-medium leading-tight tracking-[-0.02em] text-zinc-50 md:text-4xl">
            Watch a deliverable move.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-400">
            This is the deliverable review loop from an agency operating system
            we run in production. Work flows Editor → PM → Client and back. Act
            in any column. Approve, request a revision, or push it back, and
            watch the card hand off to the next person. Hover any thumbnail to
            preview. Every client approval and revision <span className="text-zinc-300">teaches the studio
            a house rule</span>. The same OS also runs projects, invoicing,
            commissions, and leave, sampled below.
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
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-zinc-50 active:scale-[0.98] lg:min-h-0"
          >
            <span aria-hidden>↻</span> reset
          </button>
        </div>
      </header>

      <div className="scene-columns mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:pb-0">
        {/* ── Client ── */}
        <Column persona={PERSONAS.client} status="your review" flow="lat-client">
          {byState("with_client").map((d) => (
            <ClientCard key={d.id} d={d} dispatch={dispatch} />
          ))}
          {byState("shipped").map((d) => (
            <DoneCard key={d.id} d={d} label="Shipped" />
          ))}
          <EmptyIf
            show={byState("with_client", "shipped").length === 0}
            text="Nothing waiting on you right now."
          />
        </Column>

        {/* ── PM ── */}
        <Column persona={PERSONAS.pm} status="queue" flow="lat-pm">
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
        <Column persona={PERSONAS.editor} status="in progress" flow="lat-editor">
          {byState("editing").map((d) => (
            <EditorCard key={d.id} d={d} dispatch={dispatch} />
          ))}
          <EmptyIf
            show={byState("editing").length === 0}
            text="No revisions to action."
          />
        </Column>
      </div>

      <LearnBeat
        rules={state.rules}
        learnedCount={learnedCount}
        flow="lat-rules"
        headingId="lattice-rules-heading"
        heading="house rules · what every approval teaches"
        learnedLabel={`learned from ${PERSONAS.client.firstName}`}
        emptyText={`Have ${PERSONAS.client.firstName} approve or revise a deliverable and the studio starts a house rulebook.`}
        renderMeta={(rule) => (
          <p className="mt-0.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            <span>
              {rule.audience === "editor"
                ? `for ${PERSONAS.editor.firstName}`
                : `for ${PERSONAS.pm.firstName}`}
            </span>
            {rule.learned ? (
              <span className="text-[var(--color-scene-1)]">
                · learned from {PERSONAS.client.firstName}
              </span>
            ) : null}
          </p>
        )}
      />
      <CapabilityStrip />
      <OutcomePanel
        stats={[
          { value: "1,284", label: "deliverables approved", sub: "last 90 days" },
          { value: "£412k", label: "invoices issued", sub: "12 active retainers" },
          { value: "£38k", label: "partner commissions paid", sub: "6 partners, auto-split" },
          { value: "318", label: "leave & WFH requests", sub: "gated + audited" },
        ]}
        liveProductLabel="the agency OS we run"
      />
      <ActivityFeed feed={state.feed} />

      <SceneCTA
        personaLabel="Agencies"
        noun="agency"
        headline="Run your agency on this."
        blurb="This is the operating system I build for agencies: scoped projects, the review loop, invoicing and payment requests, partner commissions, leave and WFH, all gated and audited. Most builds run 4 to 8 weeks. One call to scope it, no obligation."
      />
    </div>
  );
}

// ─── Shared bits ────────────────────────────────────────────────────

function Column({
  persona,
  status,
  flow,
  children,
}: {
  persona: Persona;
  status: string;
  /** Name other columns target with flowPulse(). */
  flow?: string;
  children: React.ReactNode;
}) {
  const headingId = `lattice-col-${persona.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}-heading`;
  return (
    <section
      data-flow={flow}
      aria-labelledby={headingId}
      className="scene-card min-w-[82%] shrink-0 snap-start rounded-2xl p-5 sm:min-w-[48%] lg:min-w-0"
    >
      <header className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Avatar initials={persona.initials} hue={persona.hue} size="md" />
        <div className="min-w-0">
          <h2 id={headingId} className="truncate text-sm font-medium text-zinc-50">
            {persona.name}
            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
              {persona.role}
            </span>
          </h2>
          <p className="truncate text-[11px] text-zinc-400">{persona.contextLine}</p>
        </div>
      </header>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
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
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
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
    <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-zinc-500">
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
            aria-label="Revision note"
            placeholder="What should change?"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-[var(--color-scene-1)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-scene-1)]/35"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                flowPulse(e.currentTarget, "lat-pm");
                dispatch({ type: "CLIENT_REVISE", id: d.id, note });
              }}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition-all hover:bg-amber-400/20 active:scale-[0.98] lg:min-h-0"
            >
              Send revision <span aria-hidden>→</span>
            </button>
            <button
              type="button"
              onClick={() => setRevising(false)}
              className="inline-flex min-h-10 items-center justify-center rounded-lg px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-200 lg:min-h-0"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(e) => {
              flowPulse(e.currentTarget, "lat-rules");
              dispatch({ type: "CLIENT_APPROVE", id: d.id });
            }}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition-all hover:bg-emerald-400/20 active:scale-[0.98] lg:min-h-0"
          >
            Approve <span aria-hidden>→</span>
          </button>
          <button
            type="button"
            onClick={() => setRevising(true)}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition-all hover:bg-amber-400/20 active:scale-[0.98] lg:min-h-0"
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
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        from editor · needs your sign-off
      </p>
      <button
        type="button"
        onClick={(e) => {
          flowPulse(e.currentTarget, "lat-client");
          dispatch({ type: "PM_APPROVE", id: d.id });
        }}
        className="mt-2 inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-scene-1)] transition-all hover:bg-[var(--color-scene-1)]/20 active:scale-[0.98] lg:min-h-0"
      >
        Approve &amp; send to client <span aria-hidden>→</span>
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
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300/70">
          client note ·{" "}
        </span>
        {d.revisionNote}
      </p>
      <button
        type="button"
        onClick={(e) => {
          flowPulse(e.currentTarget, "lat-editor");
          dispatch({ type: "PM_TO_EDITOR", id: d.id });
        }}
        className="mt-2 inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-scene-1)] transition-all hover:bg-[var(--color-scene-1)]/20 active:scale-[0.98] lg:min-h-0"
      >
        Push to editor <span aria-hidden>→</span>
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
        onClick={(e) => {
          flowPulse(e.currentTarget, "lat-pm");
          dispatch({ type: "EDITOR_SUBMIT", id: d.id });
        }}
        className="mt-2 inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-scene-1)] transition-all hover:bg-[var(--color-scene-1)]/20 active:scale-[0.98] lg:min-h-0"
      >
        <span aria-hidden>↑</span> Submit for review
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
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/80">
          <span aria-hidden>✓</span> {label} · v{d.version}
        </p>
      </div>
    </div>
  );
}

// ─── The rest of the OS ─────────────────────────────────────────────
// The review loop above is one surface. This strip names the rest of
// the operating system running alongside it, so the scene reads as
// production software, not a single-trick demo. Illustrative state.

const OS_MODULES: { name: string; desc: string; stat: string }[] = [
  {
    name: "Scoped projects",
    desc: "Retainers and one-off scopes with budgets and burn.",
    stat: "12 active",
  },
  {
    name: "Invoicing & payment requests",
    desc: "Raise an invoice or a payment request, approve, send.",
    stat: "£412k issued",
  },
  {
    name: "Partner & referral commissions",
    desc: "Referral splits tracked and paid out per partner.",
    stat: "6 partners",
  },
  {
    name: "Leave & WFH",
    desc: "Office / WFH / field check-ins and leave balances.",
    stat: "3 office · 2 WFH",
  },
  {
    name: "AI feedback triage",
    desc: "Inbound notes drafted and routed to the right lead.",
    stat: "behind a gate",
  },
];

function CapabilityStrip() {
  return (
    <section className="mt-5 scene-card rounded-2xl p-5" aria-labelledby="os-heading">
      <div className="flex items-baseline justify-between gap-2">
        <h2
          id="os-heading"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500"
        >
          the rest of the OS · running alongside this loop
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          one system
        </p>
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {OS_MODULES.map((m) => (
          <li
            key={m.name}
            className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5"
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[13px] font-medium leading-tight text-zinc-100">
                {m.name}
              </p>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-scene-1)]">
                {m.stat}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{m.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Activity feed ──────────────────────────────────────────────────

function ActivityFeed({ feed }: { feed: FeedEntry[] }) {
  return (
    <section
      className="mt-5 scene-card rounded-2xl p-5"
      aria-labelledby="lattice-activity-heading"
    >
      <h2
        id="lattice-activity-heading"
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500"
      >
        activity feed · real-time
      </h2>
      <ul
        aria-live="polite"
        className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
      >
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
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
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

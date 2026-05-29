"use client";

// Northbeam Goods — DTC brand governance as a 3-column workspace.
// Templates (locked, self-serve) → Brand review (AI check + human
// approve) → Published. Using a template submits an asset to review;
// the AI brand-check runs; a brand manager approves & publishes or
// sends it back. See src/lib/playground/northbeam-data.ts.

import { useEffect, useReducer } from "react";
import {
  createInitialNorthbeamState,
  northbeamReducer,
  type BrandAsset,
  type FeedEntry,
  type NorthbeamEvent,
  type Template,
} from "@/lib/playground/northbeam-data";
import { MockupThumb } from "@/components/demo/DeliverableMockup";
import { SceneCTA } from "@/components/demo/SceneCTA";

const FRESH_DECAY_MS = 2200;

export default function NorthbeamGovernance() {
  const [state, dispatch] = useReducer(
    northbeamReducer,
    undefined,
    createInitialNorthbeamState,
  );

  useEffect(() => {
    const ids = [
      ...state.assets.filter((a) => a.fresh).map((a) => a.id),
      ...state.feed.filter((f) => f.fresh).map((f) => f.id),
    ];
    if (ids.length === 0) return;
    const timers = ids.map((id) =>
      window.setTimeout(() => dispatch({ type: "DECAY_FRESH", id }), FRESH_DECAY_MS),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [state.assets, state.feed]);

  const inReview = state.assets.filter((a) => a.state === "in_review");
  const changes = state.assets.filter((a) => a.state === "changes_requested");
  const published = state.assets.filter((a) => a.state === "published");

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10 lg:px-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-scene-1)]">
            brand governance · for dtc teams · live sandbox
          </p>
          <h1 className="mt-3 text-3xl font-medium leading-tight tracking-[-0.02em] text-zinc-50 md:text-4xl">
            On-brand, without the bottleneck.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-400">
            The team self-serves from locked templates, AI checks every asset
            for brand + compliance, and a manager approves before anything
            ships. Use a template, watch it route for review, then publish.
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

      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        {/* Templates */}
        <Col label="Templates" status="locked · team self-serves">
          {state.templates.map((t) => (
            <TemplateCard key={t.id} t={t} dispatch={dispatch} />
          ))}
          {changes.map((a) => (
            <ChangesCard key={a.id} a={a} dispatch={dispatch} />
          ))}
        </Col>

        {/* Brand review */}
        <Col label="Brand review" status="ai-checked · you approve">
          {inReview.length === 0 ? (
            <Empty text="Nothing awaiting review." />
          ) : null}
          {inReview.map((a) => (
            <ReviewCard key={a.id} a={a} dispatch={dispatch} />
          ))}
        </Col>

        {/* Published */}
        <Col label="Published" status="live · audit trail">
          {published.length === 0 ? <Empty text="Nothing published yet." /> : null}
          {published.map((a) => (
            <PublishedCard key={a.id} a={a} />
          ))}
        </Col>
      </div>

      <ActivityFeed feed={state.feed} />
      <SceneCTA personaLabel="Brands & DTC" />
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
    <section className="scene-card rounded-2xl p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300">{label}</p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">{status}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-[11px] text-zinc-600">
      {text}
    </p>
  );
}

function TemplateCard({
  t,
  dispatch,
}: {
  t: Template;
  dispatch: React.Dispatch<NorthbeamEvent>;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3.5">
      <div className="flex items-start gap-3">
        <MockupThumb kind={t.kind} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-100">{t.name}</p>
          <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">
            🔒 locked: {t.locked}
          </p>
          <p className="text-[10px] leading-relaxed text-zinc-500">
            ✎ you edit: {t.editable}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => dispatch({ type: "USE_TEMPLATE", id: t.id })}
        className="mt-3 rounded-lg border border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/10 px-3 py-1.5 text-xs font-medium text-lime-200 transition-colors hover:bg-[var(--color-scene-1)]/20"
      >
        Use template → submit
      </button>
    </div>
  );
}

function ChangesCard({
  a,
  dispatch,
}: {
  a: BrandAsset;
  dispatch: React.Dispatch<NorthbeamEvent>;
}) {
  return (
    <div
      className={[
        "rounded-xl border p-3.5",
        a.fresh ? "pg-fresh border-amber-400/45" : "border-amber-400/25 bg-amber-400/[0.05]",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <MockupThumb kind={a.kind} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-100">{a.title}</p>
          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-amber-300/80">
            changes requested · v{a.version}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => dispatch({ type: "RESUBMIT", id: a.id })}
        className="mt-3 rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-xs font-medium text-sky-200 transition-colors hover:bg-sky-400/20"
      >
        ↑ Resubmit for review
      </button>
    </div>
  );
}

function ReviewCard({
  a,
  dispatch,
}: {
  a: BrandAsset;
  dispatch: React.Dispatch<NorthbeamEvent>;
}) {
  return (
    <div
      className={[
        "rounded-xl border p-3.5",
        a.fresh ? "pg-fresh border-[var(--color-scene-1)]/45" : "border-white/10 bg-black/20",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <MockupThumb kind={a.kind} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-100">{a.title}</p>
          <p className="mt-0.5 text-[10px] text-zinc-500">{a.by} · v{a.version}</p>
        </div>
      </div>
      <ul className="mt-3 space-y-1">
        {a.checks.map((c) => (
          <li key={c.label} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
            <span className={c.ok ? "text-emerald-400" : "text-amber-400"}>
              {c.ok ? "✓" : "⚠"}
            </span>
            <span className={c.ok ? "text-zinc-400" : "text-amber-200/90"}>{c.label}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "APPROVE_PUBLISH", id: a.id })}
          className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-400/20"
        >
          Approve &amp; publish →
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "REQUEST_CHANGE", id: a.id })}
          className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-400/20"
        >
          Request change
        </button>
      </div>
    </div>
  );
}

function PublishedCard({ a }: { a: BrandAsset }) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-xl border px-3.5 py-3",
        a.fresh ? "pg-fresh border-emerald-400/40" : "border-white/10 bg-black/20",
      ].join(" ")}
    >
      <MockupThumb kind={a.kind} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-200">{a.title}</p>
        <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300/80">
          ✓ live · v{a.version}
        </p>
      </div>
    </div>
  );
}

function ActivityFeed({ feed }: { feed: FeedEntry[] }) {
  return (
    <section className="mt-5 scene-card rounded-2xl p-5">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
        audit trail · real-time
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
            <p className="mt-1">{e.text}</p>
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

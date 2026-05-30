"use client";

// Founder Cockpit — a solo founder's daily brief as a 3-column live
// workspace. Inbox (AI-triaged signals) → Today (drafted actions
// awaiting approval) → Money (cash in/out + flagged items). Routing a
// signal or chasing an invoice drops a drafted action into Today; the
// founder approves. Same "AI drafts, human approves" grammar as the
// other scenes. See src/lib/playground/cockpit-data.ts.

import { useEffect, useReducer } from "react";
import {
  FOUNDER,
  cockpitReducer,
  createInitialCockpitState,
  type CockpitEvent,
  type FeedEntry,
  type MoneyItem,
  type Signal,
  type Todo,
} from "@/lib/playground/cockpit-data";
import { Avatar } from "@/components/demo/Avatar";
import { SceneCTA } from "@/components/demo/SceneCTA";

const FRESH_DECAY_MS = 2200;

const URGENCY: Record<Signal["urgency"], { label: string; cls: string }> = {
  now: { label: "now", cls: "border-rose-400/40 text-rose-300" },
  today: { label: "today", cls: "border-amber-400/40 text-amber-300" },
  fyi: { label: "fyi", cls: "border-zinc-600 text-zinc-500" },
};

export default function FounderCockpit() {
  const [state, dispatch] = useReducer(
    cockpitReducer,
    undefined,
    createInitialCockpitState,
  );

  useEffect(() => {
    const ids = [
      ...state.signals.filter((s) => s.fresh).map((s) => s.id),
      ...state.todos.filter((t) => t.fresh).map((t) => t.id),
      ...state.feed.filter((f) => f.fresh).map((f) => f.id),
    ];
    if (ids.length === 0) return;
    const timers = ids.map((id) =>
      window.setTimeout(() => dispatch({ type: "DECAY_FRESH", id }), FRESH_DECAY_MS),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [state.signals, state.todos, state.feed]);

  const openTodos = state.todos.filter((t) => !t.done).length;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10 lg:px-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar initials={FOUNDER.initials} hue={FOUNDER.hue} size="lg" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-scene-1)]">
              run-my-business cockpit · live sandbox
            </p>
            <h1 className="mt-1 text-2xl font-medium tracking-[-0.02em] text-zinc-50 md:text-3xl">
              Good morning, {FOUNDER.name.split(" ")[0]}.
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {FOUNDER.business} · {FOUNDER.tagline}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: "RESET" })}
          className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-zinc-50"
        >
          ↻ reset
        </button>
      </header>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
        Your inbox, your day, and your money, triaged by AI overnight. Send
        what matters to Today, approve the drafts, chase the late invoice. You
        decide; the cockpit does the typing.{" "}
        {openTodos > 0 ? (
          <span className="text-zinc-300">{openTodos} waiting on you.</span>
        ) : null}
      </p>

      <div className="mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:pb-0">
        <InboxColumn signals={state.signals} dispatch={dispatch} />
        <TodayColumn todos={state.todos} dispatch={dispatch} />
        <MoneyColumn money={state.money} dispatch={dispatch} />
      </div>

      <ActivityFeed feed={state.feed} />
      <SceneCTA
        personaLabel="Founders & small teams"
        noun="business"
        headline="Run the business from one screen."
        blurb="This is the cockpit I build for solo founders and small teams: inbox triage, today's priorities, and the money in one view, with you approving every send. One call to scope it, no obligation."
      />
    </div>
  );
}

// ─── Shell ──────────────────────────────────────────────────────────

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
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300">
        {label}
      </p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">
        {status}
      </p>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

// ─── Inbox ──────────────────────────────────────────────────────────

function InboxColumn({
  signals,
  dispatch,
}: {
  signals: Signal[];
  dispatch: React.Dispatch<CockpitEvent>;
}) {
  return (
    <Col label="Inbox" status="ai-triaged overnight">
      {signals.map((s) => {
        const u = URGENCY[s.urgency];
        return (
          <div
            key={s.id}
            className={[
              "rounded-xl border p-3.5",
              s.fresh ? "pg-fresh border-[var(--color-scene-1)]/45" : "border-white/10 bg-black/20",
              s.routed ? "opacity-50" : "",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-zinc-100">{s.from}</span>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] ${u.cls}`}>
                {u.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">{s.subject}</p>
            <p className="mt-2 flex gap-1.5 text-[11px] leading-relaxed text-zinc-500">
              <span className="text-[var(--color-scene-1)]">✦</span>
              <span>{s.aiNote}</span>
            </p>
            {s.autoFiled ? (
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">
                ✓ auto-filed
              </p>
            ) : s.routed ? (
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
                → moved to Today
              </p>
            ) : (
              <button
                type="button"
                onClick={() => dispatch({ type: "ROUTE_SIGNAL", id: s.id })}
                className="mt-2 rounded-lg border border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors hover:bg-[var(--color-scene-1)]/20"
              >
                → Add to Today
              </button>
            )}
          </div>
        );
      })}
    </Col>
  );
}

// ─── Today ──────────────────────────────────────────────────────────

function TodayColumn({
  todos,
  dispatch,
}: {
  todos: Todo[];
  dispatch: React.Dispatch<CockpitEvent>;
}) {
  return (
    <Col label="Today · needs you" status="ai-drafted · you approve">
      {todos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-[11px] text-zinc-600">
          Clear. Route something from the inbox.
        </p>
      ) : null}
      {todos.map((t) => (
        <div
          key={t.id}
          className={[
            "rounded-xl border p-3.5",
            t.fresh
              ? "pg-fresh border-[var(--color-scene-1)]/45"
              : t.done
                ? "border-emerald-400/30 bg-emerald-400/[0.05]"
                : "border-white/10 bg-black/20",
          ].join(" ")}
        >
          <p className="text-sm font-medium text-zinc-100">{t.label}</p>
          {t.done ? (
            <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300/80">
              ✓ approved + sent
            </p>
          ) : (
            <>
              <p className="mt-2 rounded-md border border-white/10 bg-black/30 px-2.5 py-2 text-[11px] italic leading-relaxed text-zinc-400">
                “{t.draft}”
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => dispatch({ type: "APPROVE_TODO", id: t.id })}
                  className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-400/20"
                >
                  Approve &amp; send →
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "DISMISS_TODO", id: t.id })}
                  className="rounded-lg px-2 py-1.5 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Dismiss
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </Col>
  );
}

// ─── Money ──────────────────────────────────────────────────────────

function MoneyColumn({
  money,
  dispatch,
}: {
  money: MoneyItem[];
  dispatch: React.Dispatch<CockpitEvent>;
}) {
  const summary = money.filter((m) => !m.flag);
  const flagged = money.filter((m) => m.flag);
  return (
    <Col label="Money" status="auto-categorised · flags surfaced">
      <div className="grid grid-cols-2 gap-2">
        {summary.map((m) => (
          <div key={m.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">
              {m.label}
            </p>
            <p
              className={`mt-1 text-lg font-medium ${m.direction === "in" ? "text-emerald-300" : "text-zinc-200"}`}
            >
              {m.amount}
            </p>
            <p className="mt-0.5 text-[10px] leading-tight text-zinc-600">{m.sub}</p>
          </div>
        ))}
      </div>
      {flagged.map((m) => (
        <div
          key={m.id}
          className={[
            "rounded-xl border p-3.5",
            m.fresh
              ? "pg-fresh border-[var(--color-scene-1)]/45"
              : m.flag === "overdue"
                ? "border-rose-400/30 bg-rose-400/[0.05]"
                : "border-amber-400/25 bg-amber-400/[0.05]",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium text-zinc-100">{m.label}</span>
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] ${m.flag === "overdue" ? "border-rose-400/40 text-rose-300" : "border-amber-400/40 text-amber-300"}`}
            >
              {m.flag === "overdue" ? `${m.amount} overdue` : "heads-up"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">{m.sub}</p>
          {m.flag === "overdue" ? (
            m.chased ? (
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
                → reminder drafted in Today
              </p>
            ) : (
              <button
                type="button"
                onClick={() => dispatch({ type: "CHASE_INVOICE", id: m.id })}
                className="mt-2 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs font-medium text-rose-200 transition-colors hover:bg-rose-400/20"
              >
                Chase it →
              </button>
            )
          ) : null}
        </div>
      ))}
    </Col>
  );
}

// ─── Activity feed ──────────────────────────────────────────────────

function ActivityFeed({ feed }: { feed: FeedEntry[] }) {
  return (
    <section className="mt-5 scene-card rounded-2xl p-5">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
        what the cockpit did · real-time
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

// Founder Cockpit (Driftwood): a solo founder's daily brief as one live
// workspace. Inbox (AI-triaged signals) > Today (drafted actions waiting
// on approval) > Money (the month's in and out, plus flags). Routing a
// signal or chasing an invoice drops a drafted action into Today; the
// founder approves, and every approval teaches the cockpit a rule. Same
// "AI drafts, human approves" grammar as the other scenes. See
// src/lib/playground/cockpit-data.ts.
//
// Layout mirrors the reference scene (Lattice.tsx):
//   SceneLayout > SceneIntro (h1 + live checklist) > Workspace (panes)
//   > LearnBeat > OutcomePanel > ActivityLog (+ overnight run) > SceneCTA

import { useEffect, useState, type ReactNode } from "react";
import {
  FOUNDER,
  cockpitReducer,
  createInitialCockpitState,
  outcomeStats,
  trySteps,
  type CockpitEvent,
  type CockpitState,
  type FeedEntry,
  type MoneyItem,
  type Signal,
  type Todo,
} from "@/lib/playground/cockpit-data";
import { Avatar } from "@/components/demo/Avatar";
import { SceneLayout } from "@/components/demo/SceneLayout";
import { SceneIntro } from "@/components/demo/SceneIntro";
import { ActivityLog, EmptyState, ItemCard, Pane, Workspace, type LogEntry } from "@/components/demo/Workspace";
import { LearnBeat } from "@/components/demo/LearnBeat";
import { OutcomePanel } from "@/components/demo/OutcomePanel";
import { SceneCTA } from "@/components/demo/SceneCTA";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { flowPulse } from "@/lib/flowPulse";
import { useSceneDispatch } from "@/lib/useSceneDispatch";
import { useStartHint } from "@/lib/useStartHint";
import { vtName } from "@/lib/viewTransition";

const FRESH_DECAY_MS = 2200;

type Dispatch = React.Dispatch<CockpitEvent>;

const FIRST_NAME = FOUNDER.name.split(" ")[0];

const URGENCY: Record<Signal["urgency"], { label: string; cls: string }> = {
  now: { label: "Now", cls: "chip-danger" },
  today: { label: "Today", cls: "chip-caution" },
  fyi: { label: "FYI", cls: "" },
};

export default function CockpitPage() {
  return (
    <SceneLayout slug="cockpit">
      <FounderCockpit />
    </SceneLayout>
  );
}

function FounderCockpit() {
  const [state, dispatch] = useSceneDispatch(cockpitReducer, createInitialCockpitState);
  const { hint, endHint } = useStartHint();

  useEffect(() => {
    const ids = [
      ...state.signals.filter((s) => s.fresh).map((s) => s.id),
      ...state.todos.filter((t) => t.fresh).map((t) => t.id),
      ...state.rules.filter((r) => r.fresh).map((r) => r.id),
      ...state.feed.filter((f) => f.fresh).map((f) => f.id),
    ];
    if (ids.length === 0) return;
    const timers = ids.map((id) => window.setTimeout(() => dispatch({ type: "DECAY_FRESH", id }), FRESH_DECAY_MS));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [state.signals, state.todos, state.rules, state.feed, dispatch]);

  const openTodos = state.todos.filter((t) => !t.done);
  const sentTodos = state.todos.filter((t) => t.done);
  const actionable = state.signals.filter((s) => !s.autoFiled && !s.routed).length;
  const flagsOpen = state.money.filter((m) => m.flag && !m.chased).length;
  const learnedCount = state.rules.filter((r) => r.learned).length;

  return (
    <>
      <SceneIntro
        slug="cockpit"
        title={
          <>
            <span className="mr-3 inline-block align-[0.16em] sm:mr-4">
              <Avatar initials={FOUNDER.initials} hue={FOUNDER.hue} size="lg" />
            </span>
            Good morning, {FIRST_NAME}.
          </>
        }
        lede={
          <>
            {FOUNDER.business} is a one-person business. Overnight the cockpit triaged the inbox, drafted the replies and
            watched the money. You approve, and <span className="text-ink-200">every approval teaches it how you work</span>.
          </>
        }
        steps={trySteps(state)}
        onReset={() => dispatch({ type: "RESET" })}
        status={
          sentTodos.length > 0 ? (
            <span key={sentTodos.length} className="chip chip-positive pop-in">
              ✓ {sentTodos.length} sent
            </span>
          ) : null
        }
      />

      <Workspace
        slug="cockpit"
        board={`${FIRST_NAME}'s daily brief`}
        cols="lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)_minmax(0,1fr)]"
        onClickCapture={endHint}
        toolbar={
          <span className="hidden items-center gap-2 md:inline-flex">
            <span className="text-xs text-ink-400">
              <span key={openTodos.length} className="pop-in inline-block font-mono text-ink-100">
                {openTodos.length}
              </span>{" "}
              waiting on you
            </span>
            <span className="rounded-full ring-2 ring-ink-925">
              <Avatar initials={FOUNDER.initials} hue={FOUNDER.hue} size="xs" ring={false} />
            </span>
          </span>
        }
      >
        <InboxPane signals={state.signals} dispatch={dispatch} hint={hint} count={actionable} />
        <TodayPane open={openTodos} sent={sentTodos} dispatch={dispatch} />
        <MoneyPane money={state.money} dispatch={dispatch} count={flagsOpen} />
      </Workspace>

      <LearnBeat
        rules={state.rules}
        learnedCount={learnedCount}
        flow="cp-rules"
        headingId="cockpit-rules-heading"
        heading="What it has learned"
        sub="Every approval teaches the cockpit how you work"
        learnedLabel={`learned from ${FIRST_NAME}`}
        emptyText="Approve a draft above and the cockpit starts learning your shape."
        renderMeta={(rule) =>
          rule.learned ? (
            <p className="mt-1 text-[11px] font-medium text-scene-soft">Learned from your approval</p>
          ) : (
            <p className="mt-1 text-[11px] text-ink-500">Starting default</p>
          )
        }
      />
      <OutcomePanel stats={outcomeStats(state)} liveProductLabel="the cockpit I run my own days on" />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <ActivityLog
          id="cockpit-activity"
          title="What the cockpit did"
          sub="Every action, logged as it happens"
          entries={state.feed.map(toLogEntry)}
          vtPrefix="cp-feed"
        />
        <OvernightRun state={state} />
      </div>

      <SceneCTA
        personaLabel="Founders & small teams"
        noun="business"
        headline={
          <>
            Run the business <span className="voice font-normal text-scene-soft">from one screen.</span>
          </>
        }
        blurb="This is the cockpit I build for solo founders and small teams: inbox triage, today's priorities, and the money in one view, with you approving every send. One call to scope it, no obligation."
      />
    </>
  );
}

// The feed stores one line of text ("Added to Today · Reply to Tessa").
// The log shows the verb first and the rest as quiet detail.
function toLogEntry(f: FeedEntry): LogEntry {
  const cut = f.text.indexOf(" · ");
  return cut === -1
    ? { id: f.id, ts: f.ts, action: f.text, fresh: f.fresh }
    : { id: f.id, ts: f.ts, action: f.text.slice(0, cut), detail: f.text.slice(cut + 3), fresh: f.fresh };
}

// ─── Shared bits ────────────────────────────────────────────────────

function PaneIcon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--color-scene-1)_30%,transparent)] bg-[color-mix(in_oklab,var(--color-scene-1)_9%,transparent)] text-scene-soft"
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  );
}

/** Moves focus to the status line that replaced the button just pressed. */
function useResolvedFocus() {
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const focusRef = (id: string) => (el: HTMLElement | null) => {
    if (el && resolvedId === id) {
      el.focus();
      setResolvedId(null);
    }
  };
  return { setResolvedId, focusRef };
}

// ─── Inbox ──────────────────────────────────────────────────────────

function InboxPane({
  signals,
  dispatch,
  hint,
  count,
}: {
  signals: Signal[];
  dispatch: Dispatch;
  /** "Start here" ring on the first signal that can be routed. */
  hint: boolean;
  count: number;
}) {
  const firstRoutable = signals.find((s) => !s.autoFiled && !s.routed)?.id;
  const { setResolvedId, focusRef } = useResolvedFocus();
  return (
    <Pane
      id="cockpit-inbox"
      lead={
        <PaneIcon>
          <path d="M2 9.5h3.2l1 1.6h3.6l1-1.6H14" />
          <path d="M3.6 3.5h8.8L14 9.5V13H2V9.5l1.6-6Z" />
        </PaneIcon>
      }
      title="Inbox"
      tag="AI-triaged"
      sub="Sorted overnight, most urgent first"
      count={count}
      status="Needs your call"
    >
      {signals.map((s) => {
        const u = URGENCY[s.urgency];
        const quiet = s.autoFiled || s.routed;
        return (
          <ItemCard key={s.id} vt={vtName("cp-signal", s.id)} fresh={s.fresh} className={cn(quiet && "opacity-75")}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-50">{s.from}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-ink-300">{s.subject}</p>
              </div>
              <span className={cn("chip shrink-0", u.cls)}>{u.label}</span>
            </div>
            <p className="mt-3 flex gap-2 border-t border-line pt-3 text-[12px] leading-relaxed text-ink-400">
              <span aria-hidden className="text-scene">
                ✦
              </span>
              <span>
                <span className="sr-only">AI note: </span>
                {s.aiNote}
              </span>
            </p>
            {s.autoFiled ? (
              <p className="label-mono mt-3">
                <span aria-hidden>✓</span> Auto-filed
              </p>
            ) : s.routed ? (
              <p ref={focusRef(s.id)} tabIndex={-1} className="label-mono mt-3 text-scene-soft">
                <span aria-hidden>→</span> Moved to Today
              </p>
            ) : (
              <Button
                variant="accent"
                size="sm"
                arrow
                className="mt-3"
                hint={hint && s.id === firstRoutable}
                onClick={(e) => {
                  flowPulse(e.currentTarget, "cp-today");
                  setResolvedId(s.id);
                  dispatch({ type: "ROUTE_SIGNAL", id: s.id });
                }}
              >
                Add to Today
              </Button>
            )}
          </ItemCard>
        );
      })}
    </Pane>
  );
}

// ─── Today ──────────────────────────────────────────────────────────

function TodayPane({ open, sent, dispatch }: { open: Todo[]; sent: Todo[]; dispatch: Dispatch }) {
  const { setResolvedId, focusRef } = useResolvedFocus();
  return (
    <Pane
      id="cockpit-today"
      flow="cp-today"
      lead={
        <PaneIcon>
          <rect x="2.5" y="3" width="11" height="10.5" rx="2" />
          <path d="M2.5 6.5h11M5.5 1.8v2.4M10.5 1.8v2.4M6 10l1.4 1.3L10.2 8.6" />
        </PaneIcon>
      }
      title="Today"
      tag="Needs you"
      sub="AI-drafted, nothing sends without you"
      count={open.length}
      status="Drafts to approve"
    >
      {open.map((t) => (
        <ItemCard key={t.id} vt={vtName("cp-todo", t.id)} fresh={t.fresh}>
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold leading-snug text-ink-50">{t.label}</p>
            {t.amountGbp !== undefined ? (
              <span className="chip chip-mono shrink-0 tabular-nums">£{t.amountGbp.toLocaleString("en-GB")}</span>
            ) : null}
          </div>
          <p className="mt-1.5 text-[11px] text-ink-500">
            {t.source === "money" ? "From Money · payment reminder" : "From the inbox · reply drafted"}
          </p>
          <div className="mt-3 rounded-lg bg-white/[0.03] px-3 py-2.5">
            <p className="label-mono">Draft</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-300">“{t.draft}”</p>
          </div>
          <div className="mt-3.5 flex flex-wrap gap-2">
            <Button
              variant="positive"
              size="sm"
              arrow
              onClick={(e) => {
                flowPulse(e.currentTarget, "cp-rules");
                setResolvedId(t.id);
                dispatch({ type: "APPROVE_TODO", id: t.id });
              }}
            >
              Approve &amp; send
            </Button>
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "DISMISS_TODO", id: t.id })}>
              Dismiss
            </Button>
          </div>
        </ItemCard>
      ))}
      {sent.map((t) => (
        <ItemCard
          key={t.id}
          vt={vtName("cp-todo", t.id)}
          fresh={t.fresh}
          tone="positive"
          className="flex items-center gap-3 py-3"
        >
          <span
            aria-hidden
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/12 text-[12px] text-emerald-300"
          >
            ✓
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-200">{t.label}</p>
            <p ref={focusRef(t.id)} tabIndex={-1} className="mt-0.5 text-[11px] font-medium text-emerald-300/90">
              Approved + sent{t.learnedRule ? <span className="text-ink-500"> · taught the cockpit a rule</span> : null}
            </p>
          </div>
        </ItemCard>
      ))}
      <EmptyState show={open.length + sent.length === 0}>Clear. Add something from the inbox.</EmptyState>
    </Pane>
  );
}

// ─── Money ──────────────────────────────────────────────────────────

function MoneyPane({ money, dispatch, count }: { money: MoneyItem[]; dispatch: Dispatch; count: number }) {
  const summary = money.filter((m) => !m.flag);
  const flagged = money.filter((m) => m.flag);
  const { setResolvedId, focusRef } = useResolvedFocus();
  return (
    <Pane
      id="cockpit-money"
      lead={
        <PaneIcon>
          <path d="M2 12.5 6 8.5l2.5 2.5L14 5.5" />
          <path d="M10.5 5.5H14V9" />
        </PaneIcon>
      }
      title="Money"
      tag="This month"
      sub="Auto-categorised, flags surfaced"
      count={count}
      status="Cash flow"
    >
      {/* One ledger block, rows split by hairlines: not a card per figure. */}
      <dl className="divide-y divide-line rounded-xl border border-line bg-white/[0.015]">
        {summary.map((m) => (
          <div key={m.id} className="flex items-baseline justify-between gap-4 px-3.5 py-3">
            <dt className="min-w-0">
              <span className="block text-[13px] font-medium text-ink-100">{m.label}</span>
              <span className="mt-0.5 block text-[11px] text-ink-500">{m.sub}</span>
            </dt>
            <dd
              className={cn(
                "shrink-0 font-mono text-[15px] tabular-nums",
                m.direction === "in" ? "text-emerald-300" : "text-rose-300",
              )}
            >
              {m.amount}
            </dd>
          </div>
        ))}
      </dl>

      {flagged.map((m) =>
        m.flag === "overdue" ? (
          <ItemCard key={m.id} vt={vtName("cp-money", m.id)} fresh={m.fresh} tone="danger">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-50">{m.label}</p>
                <p className="mt-0.5 text-[12px] text-ink-400">{m.sub}</p>
              </div>
              <span className="chip chip-danger shrink-0">Overdue</span>
            </div>
            <div className="mt-3 flex items-end justify-between gap-3 border-t border-line pt-3">
              {m.chased ? (
                <p ref={focusRef(m.id)} tabIndex={-1} className="label-mono text-scene-soft">
                  <span aria-hidden>→</span> Reminder drafted in Today
                </p>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  arrow
                  onClick={(e) => {
                    flowPulse(e.currentTarget, "cp-today");
                    setResolvedId(m.id);
                    dispatch({ type: "CHASE_INVOICE", id: m.id });
                  }}
                >
                  Chase it
                </Button>
              )}
              <p className="shrink-0 font-mono text-lg leading-none tabular-nums text-rose-300">{m.amount}</p>
            </div>
          </ItemCard>
        ) : (
          <ItemCard key={m.id} vt={vtName("cp-money", m.id)} fresh={m.fresh} tone="caution">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 text-sm font-semibold leading-snug text-ink-50">{m.label}</p>
              <span className="chip chip-caution shrink-0 capitalize">{m.amount}</span>
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-400">{m.sub}</p>
          </ItemCard>
        ),
      )}
    </Pane>
  );
}

// ─── The overnight run ──────────────────────────────────────────────
// What the cockpit did before the founder woke up, as a spec sheet. The
// first two rows restate the seeded overnight feed; the rest read the
// live state, so they move with the visitor's clicks.

function OvernightRun({ state }: { state: CockpitState }) {
  const open = state.todos.filter((t) => !t.done).length;
  const chased = state.money.some((m) => m.chased);
  const rules = state.rules.length;
  const rows: { name: string; desc: string; stat: string }[] = [
    { name: "Inbox triage", desc: "Every overnight email read and sorted by urgency", stat: "9 read · 3 for you" },
    { name: "Bookkeeping", desc: "Transactions categorised, anything odd flagged for review", stat: "14 · 1 flagged" },
    {
      name: "Receivables",
      desc: "Invoices watched for late payment",
      stat: chased ? "reminder drafted" : "1 overdue",
    },
    { name: "Cash watch", desc: "Supplier payments checked against incoming invoices", stat: "1 tight week" },
    { name: "Drafts", desc: "Replies and reminders written, none sent without you", stat: `${open} waiting` },
    { name: "Your rules", desc: "How you work, applied to the next run", stat: `${rules} active` },
  ];
  return (
    <section className="surface rounded-2xl p-5 md:p-6" aria-labelledby="cockpit-overnight-heading">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="cockpit-overnight-heading" className="heading text-lg text-ink-50">
          The overnight run
        </h2>
        <p className="text-xs text-ink-500">What ran before you woke up</p>
      </div>
      <ul className="mt-4 divide-y divide-line">
        {rows.map((r) => (
          <li
            key={r.name}
            className="group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-0.5 py-3 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)_auto]"
          >
            <p className="col-start-1 row-start-1 text-[13.5px] font-medium text-ink-100 transition-colors group-hover:text-white">
              {r.name}
            </p>
            <p className="col-span-2 col-start-1 row-start-2 text-[12.5px] text-ink-500 sm:col-span-1 sm:col-start-2 sm:row-start-1">
              {r.desc}
            </p>
            <span key={r.stat} className="pop-in col-start-2 row-start-1 font-mono text-[11px] text-scene-soft sm:col-start-3">
              {r.stat}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Founder Cockpit — a "run-my-business" daily brief for a solo founder
// (Remi, founder of Driftwood). Three columns cascade in the same
// "AI drafts the boring 80%, the founder approves" grammar as the other
// scenes: Inbox (AI-triaged signals) → Today (drafted actions awaiting
// approval) → Money (cash in/out, shortfalls + overdue flagged).
//
// Research-validated "Daily Brief" pattern (Gemini Spark / Motion /
// alfred). Money column stays descriptive (in/out, overdue, low) — no
// hard-coded metric hierarchy (that framing didn't survive verification).

import type { AvatarHue } from "@/components/demo/Avatar";

export const FOUNDER = {
  name: "Remi Okafor",
  initials: "RO",
  business: "Driftwood",
  tagline: "Solo founder · design + small-batch goods",
  hue: { from: "#FBBF24", to: "#B45309", ink: "#2A1A04" } as AvatarHue,
};

// ── Inbox signals ──────────────────────────────────────────────────
export type SignalKind = "email" | "task" | "calendar";
export type Urgency = "now" | "today" | "fyi";

export type Signal = {
  id: string;
  kind: SignalKind;
  from: string;
  subject: string;
  urgency: Urgency;
  aiNote: string;
  /** FYI items the AI handled on its own — shown as auto-filed, no action. */
  autoFiled?: boolean;
  /** Once routed, it becomes a Today action and leaves the actionable set. */
  routed?: boolean;
  /** The draft the AI prepares for the Today action this signal spawns. */
  draft: string;
  todoLabel: string;
  fresh?: boolean;
};

// ── Today actions (drafted, awaiting approval) ─────────────────────
export type Todo = {
  id: string;
  label: string;
  draft: string;
  source: "inbox" | "money";
  done?: boolean;
  fresh?: boolean;
};

// ── Money ──────────────────────────────────────────────────────────
export type MoneyFlag = "overdue" | "low";
export type MoneyItem = {
  id: string;
  label: string;
  sub: string;
  amount: string;
  direction: "in" | "out";
  flag?: MoneyFlag;
  /** Overdue invoices can be chased → spawns a Today action. */
  chased?: boolean;
  draft?: string;
  fresh?: boolean;
};

export type FeedEntry = {
  id: string;
  ts: number;
  text: string;
  fresh?: boolean;
};

export type CockpitState = {
  signals: Signal[];
  todos: Todo[];
  money: MoneyItem[];
  feed: FeedEntry[];
};

export type CockpitEvent =
  | { type: "ROUTE_SIGNAL"; id: string }
  | { type: "CHASE_INVOICE"; id: string }
  | { type: "APPROVE_TODO"; id: string }
  | { type: "DISMISS_TODO"; id: string }
  | { type: "DECAY_FRESH"; id: string }
  | { type: "RESET" };

const SIGNALS_SEED: Signal[] = [
  {
    id: "s-client",
    kind: "email",
    from: "Tessa (Marlow & Co.)",
    subject: "Can we move the launch to the 14th?",
    urgency: "now",
    aiNote: "Client on an active project. Wants a date change — needs your call.",
    draft: "Hi Tessa — the 14th works on my side. I'll shift the timeline and resend the schedule today. — Remi",
    todoLabel: "Reply to Tessa about the launch date",
  },
  {
    id: "s-supplier",
    kind: "email",
    from: "Kraft & Board (supplier)",
    subject: "Your restock quote is ready",
    urgency: "today",
    aiNote: "Quote attached. You usually reorder this within the week.",
    draft: "Thanks — approved. Please proceed with the standard quantity and send the invoice. — Remi",
    todoLabel: "Approve the restock reorder",
  },
  {
    id: "s-news",
    kind: "email",
    from: "Indie Makers Weekly",
    subject: "5 packaging trends for 2026",
    urgency: "fyi",
    aiNote: "Newsletter — auto-filed to Reading. Nothing for you to do.",
    autoFiled: true,
    draft: "",
    todoLabel: "",
  },
];

const TODOS_SEED: Todo[] = [
  {
    id: "t-standup",
    label: "Confirm Thursday call with the new lead",
    draft: "Thursday 3pm works — sending a calendar invite now. Looking forward to it.",
    source: "inbox",
  },
];

const MONEY_SEED: MoneyItem[] = [
  { id: "m-in", label: "Money in", sub: "this month · 3 invoices paid", amount: "+ £6,420", direction: "in" },
  { id: "m-out", label: "Money out", sub: "this month · supplies, tools, fees", amount: "− £2,180", direction: "out" },
  {
    id: "m-overdue",
    label: "Greenfield Studio",
    sub: "invoice #0042 · 12 days overdue",
    amount: "£1,500",
    direction: "in",
    flag: "overdue",
    draft: "Hi — just a friendly nudge that invoice #0042 (£1,500) is now 12 days past due. Could you confirm a payment date? Thanks! — Remi",
  },
  {
    id: "m-low",
    label: "Heads-up: tight week ahead",
    sub: "supplier payment due before the next invoice clears",
    amount: "watch",
    direction: "out",
    flag: "low",
  },
];

const FEED_SEED: Array<{ id: string; offsetMs: number; text: string }> = [
  { id: "cf-1", offsetMs: 120_000, text: "AI triaged 9 overnight emails · 6 auto-filed, 3 for you" },
  { id: "cf-2", offsetMs: 300_000, text: "Categorised 14 transactions · 1 flagged for review" },
];

export function createInitialCockpitState(): CockpitState {
  const now = Date.now();
  return {
    signals: SIGNALS_SEED.map((s) => ({ ...s })),
    todos: TODOS_SEED.map((t) => ({ ...t })),
    money: MONEY_SEED.map((m) => ({ ...m })),
    feed: FEED_SEED.map((f) => ({ id: f.id, ts: now - f.offsetMs, text: f.text })),
  };
}

function nextId(): string {
  return `cf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function log(feed: FeedEntry[], text: string): FeedEntry[] {
  return [{ id: nextId(), ts: Date.now(), text, fresh: true }, ...feed];
}

export function cockpitReducer(
  state: CockpitState,
  event: CockpitEvent,
): CockpitState {
  switch (event.type) {
    case "ROUTE_SIGNAL": {
      const sig = state.signals.find((s) => s.id === event.id);
      if (!sig || sig.routed || sig.autoFiled) return state;
      return {
        ...state,
        signals: state.signals.map((s) =>
          s.id === sig.id ? { ...s, routed: true } : s,
        ),
        todos: [
          { id: `todo-${sig.id}`, label: sig.todoLabel, draft: sig.draft, source: "inbox", fresh: true },
          ...state.todos,
        ],
        feed: log(state.feed, `Added to Today · ${sig.todoLabel}`),
      };
    }
    case "CHASE_INVOICE": {
      const m = state.money.find((x) => x.id === event.id);
      if (!m || m.chased || m.flag !== "overdue" || !m.draft) return state;
      return {
        ...state,
        money: state.money.map((x) =>
          x.id === m.id ? { ...x, chased: true } : x,
        ),
        todos: [
          { id: `todo-${m.id}`, label: `Send payment reminder · ${m.label}`, draft: m.draft, source: "money", fresh: true },
          ...state.todos,
        ],
        feed: log(state.feed, `Drafted a payment reminder · ${m.label}`),
      };
    }
    case "APPROVE_TODO": {
      const t = state.todos.find((x) => x.id === event.id);
      if (!t || t.done) return state;
      return {
        ...state,
        todos: state.todos.map((x) =>
          x.id === t.id ? { ...x, done: true, fresh: true } : x,
        ),
        feed: log(state.feed, `Approved + sent · ${t.label}`),
      };
    }
    case "DISMISS_TODO": {
      const t = state.todos.find((x) => x.id === event.id);
      if (!t) return state;
      return {
        ...state,
        todos: state.todos.filter((x) => x.id !== t.id),
        feed: log(state.feed, `Dismissed · ${t.label}`),
      };
    }
    case "DECAY_FRESH":
      return {
        signals: state.signals.map((s) => (s.id === event.id ? { ...s, fresh: false } : s)),
        todos: state.todos.map((t) => (t.id === event.id ? { ...t, fresh: false } : t)),
        money: state.money.map((m) => (m.id === event.id ? { ...m, fresh: false } : m)),
        feed: state.feed.map((f) => (f.id === event.id && f.fresh ? { ...f, fresh: false } : f)),
      };
    case "RESET":
      return createInitialCockpitState();
    default:
      return state;
  }
}

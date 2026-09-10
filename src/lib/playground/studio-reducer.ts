// Pure reducer for the Studio Mix playground. Running an agent sets it
// as the current output and prepends a fresh row to the run feed —
// the cascade from column 1 (Agents) → column 2 (Output) → column 3
// (Run feed). No side effects, no live API; deterministic mock output
// lives in studio-script.ts.

import {
  STUDIO_FEED_SEED,
  findStudioAgent,
  type StudioAgentKey,
  type StudioRuleSpec,
} from "./studio-script";
import type { AuditEntry } from "./reducer";
import type { OutcomeStat } from "@/components/demo/OutcomePanel";
import { formatCount } from "./outcomeFormat";

// Gate state for the current output. Writer agents (ECHO) produce a
// draft that waits for a human; read-only agents complete autonomously.
export type GateState = "autonomous" | "pending" | "approved" | "discarded";

/** A rule the studio has learned about what humans approve / reject. */
export type Rule = StudioRuleSpec & {
  id: string;
  /** True when learned from a human approval/discard; false for seeded house rules. */
  learned: boolean;
  fresh?: boolean;
};

export type StudioState = {
  /** The most recently run agent — drives the Output column. */
  current: StudioAgentKey | null;
  /** Approval state of the current output. */
  gate: GateState;
  /** How many times each agent has been run this session. Drives the
   *  "ran" chip, and the outcome tiles, which count every run rather
   *  than only the first (running ECHO twice drafts twice). */
  runs: Record<StudioAgentKey, number>;
  /** House rules + rules learned from approve/discard moments. */
  rules: Rule[];
  /** Shared run feed (newest first). */
  feed: AuditEntry[];
};

export type StudioEvent =
  | { type: "RUN"; key: StudioAgentKey }
  | { type: "APPROVE" }
  | { type: "DISCARD" }
  | { type: "DECAY_FRESH"; id: string }
  | { type: "RESET" };

const RULES_SEED: Rule[] = [
  {
    id: "sr-seed-publish",
    text: "Writer agents never auto-publish, every draft waits behind a human",
    kind: "do",
    learned: false,
  },
  {
    id: "sr-seed-readonly",
    text: "Read-only agents (PULSE / RIVER / ATLAS) run autonomously",
    kind: "do",
    learned: false,
  },
];

export function createInitialStudioState(): StudioState {
  const now = Date.now();
  const seed: AuditEntry[] = STUDIO_FEED_SEED.map((entry) => ({
    id: entry.id,
    ts: now - entry.offsetMs,
    actor: entry.actor,
    action: entry.action,
    detail: entry.detail,
  }));
  return {
    current: null,
    gate: "autonomous",
    runs: { echo: 0, pulse: 0, river: 0, atlas: 0 },
    rules: RULES_SEED.map((r) => ({ ...r })),
    feed: seed,
  };
}

/** Agents run at least once, for the "N/4 agents run" chip. */
export function agentsRun(state: StudioState): number {
  return Object.values(state.runs).filter((n) => n > 0).length;
}

// Outcome tiles. Illustrative figures for the studio, with this
// visitor's own runs added on top. ECHO is the only writer agent, so
// it is the only one that generates a draft, and RIVER is the screener
// behind "candidates assessed". PULSE watches and ATLAS reviews, so
// neither has a tile to move. The two zero-and-percentage tiles are
// the architecture, not counters.
const OUTCOME_BASE = { drafts: 9_640, assessed: 1_120 };

export function outcomeStats(state: StudioState): OutcomeStat[] {
  return [
    {
      value: formatCount(OUTCOME_BASE.drafts + state.runs.echo),
      label: "drafts generated",
      sub: "all gated",
    },
    { value: "94%", label: "approved as-is", sub: "after a human read" },
    {
      value: formatCount(OUTCOME_BASE.assessed + state.runs.river),
      label: "candidates assessed",
      sub: "human decides",
    },
    { value: "0", label: "auto-publishes", sub: "by design" },
  ];
}

function nextId(): string {
  return `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nextRuleId(): string {
  return `sr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function learnRule(rules: Rule[], spec: StudioRuleSpec | undefined): Rule[] {
  if (!spec) return rules;
  return [
    { id: nextRuleId(), text: spec.text, kind: spec.kind, learned: true, fresh: true },
    ...rules,
  ];
}

export function studioReducer(
  state: StudioState,
  event: StudioEvent,
): StudioState {
  switch (event.type) {
    case "RUN": {
      const agent = findStudioAgent(event.key);
      if (!agent) return state;

      const gated = !!agent.gated;
      const row: AuditEntry = {
        id: nextId(),
        ts: Date.now(),
        actor: agent.name,
        action: gated ? `drafted (awaiting approval)` : agent.feedAction,
        detail: agent.feedDetail,
        fresh: true,
      };
      return {
        current: event.key,
        gate: gated ? "pending" : "autonomous",
        runs: { ...state.runs, [event.key]: state.runs[event.key] + 1 },
        rules: state.rules,
        feed: [row, ...state.feed],
      };
    }

    case "APPROVE": {
      if (state.gate !== "pending" || !state.current) return state;
      const agent = findStudioAgent(state.current);
      const row: AuditEntry = {
        id: nextId(),
        ts: Date.now(),
        actor: "You",
        action: "approved + published",
        detail: agent?.feedDetail,
        fresh: true,
      };
      return {
        ...state,
        gate: "approved",
        rules: learnRule(state.rules, agent?.approvalRule),
        feed: [row, ...state.feed],
      };
    }

    case "DISCARD": {
      if (state.gate !== "pending" || !state.current) return state;
      const agent = findStudioAgent(state.current);
      const row: AuditEntry = {
        id: nextId(),
        ts: Date.now(),
        actor: "You",
        action: "discarded the draft",
        detail: agent?.feedDetail,
        fresh: true,
      };
      return {
        ...state,
        gate: "discarded",
        rules: learnRule(state.rules, agent?.discardRule),
        feed: [row, ...state.feed],
      };
    }

    case "DECAY_FRESH":
      return {
        ...state,
        rules: state.rules.map((r) =>
          r.id === event.id && r.fresh ? { ...r, fresh: false } : r,
        ),
        feed: state.feed.map((entry) =>
          entry.id === event.id && entry.fresh
            ? { ...entry, fresh: false }
            : entry,
        ),
      };

    case "RESET":
      return createInitialStudioState();

    default:
      return state;
  }
}

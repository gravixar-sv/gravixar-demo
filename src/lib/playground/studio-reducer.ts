// Pure reducer for the Studio Mix playground. Running an agent sets it
// as the current output and prepends a fresh row to the run feed —
// the cascade from column 1 (Agents) → column 2 (Output) → column 3
// (Run feed). No side effects, no live API; deterministic mock output
// lives in studio-script.ts.

import {
  STUDIO_FEED_SEED,
  findStudioAgent,
  type StudioAgentKey,
} from "./studio-script";
import type { AuditEntry } from "./reducer";

// Gate state for the current output. Writer agents (ECHO) produce a
// draft that waits for a human; read-only agents complete autonomously.
export type GateState = "autonomous" | "pending" | "approved" | "discarded";

export type StudioState = {
  /** The most recently run agent — drives the Output column. */
  current: StudioAgentKey | null;
  /** Approval state of the current output. */
  gate: GateState;
  /** Keys that have been run at least once (for the "ran" chip). */
  ran: StudioAgentKey[];
  /** Shared run feed (newest first). */
  feed: AuditEntry[];
};

export type StudioEvent =
  | { type: "RUN"; key: StudioAgentKey }
  | { type: "APPROVE" }
  | { type: "DISCARD" }
  | { type: "DECAY_FRESH"; id: string }
  | { type: "RESET" };

export function createInitialStudioState(): StudioState {
  const now = Date.now();
  const seed: AuditEntry[] = STUDIO_FEED_SEED.map((entry) => ({
    id: entry.id,
    ts: now - entry.offsetMs,
    actor: entry.actor,
    action: entry.action,
    detail: entry.detail,
  }));
  return { current: null, gate: "autonomous", ran: [], feed: seed };
}

function nextId(): string {
  return `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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
        ran: state.ran.includes(event.key)
          ? state.ran
          : [...state.ran, event.key],
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
      return { ...state, gate: "approved", feed: [row, ...state.feed] };
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
      return { ...state, gate: "discarded", feed: [row, ...state.feed] };
    }

    case "DECAY_FRESH":
      return {
        ...state,
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

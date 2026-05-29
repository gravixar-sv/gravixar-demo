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

export type StudioState = {
  /** The most recently run agent — drives the Output column. */
  current: StudioAgentKey | null;
  /** Keys that have been run at least once (for the "ran" chip). */
  ran: StudioAgentKey[];
  /** Shared run feed (newest first). */
  feed: AuditEntry[];
};

export type StudioEvent =
  | { type: "RUN"; key: StudioAgentKey }
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
  return { current: null, ran: [], feed: seed };
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

      const row: AuditEntry = {
        id: nextId(),
        ts: Date.now(),
        actor: agent.name,
        action: agent.feedAction,
        detail: agent.feedDetail,
        fresh: true,
      };
      return {
        current: event.key,
        ran: state.ran.includes(event.key)
          ? state.ran
          : [...state.ran, event.key],
        feed: [row, ...state.feed],
      };
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

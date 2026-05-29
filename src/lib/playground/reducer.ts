// Pure reducer for the V1 Lattice playground. All UI state lives here.
// No side effects, no DB. Each visitor gets isolated state via React's
// useReducer (no shared persistence).
//
// Action shapes follow src/lib/tour/reducer.ts so the patterns read as
// one family across the demo (the tour ships approve/reply/comment
// against the same agency scenario; the playground lets the visitor
// trigger them in any order across three columns simultaneously).

import {
  PLAYGROUND_AUDIT_SEED,
  PLAYGROUND_DELIVERABLE,
  PLAYGROUND_INQUIRY,
  PLAYGROUND_PERSONAS,
} from "./script";

export type AuditEntry = {
  id: string;
  ts: number; // ms since epoch
  actor: string;
  action: string;
  detail?: string;
  fresh?: boolean;
};

export type PlaygroundState = {
  approved: boolean;
  revisionRequested: boolean;
  replied: boolean;
  comment: string;
  audit: AuditEntry[];
};

export type PlaygroundEvent =
  | { type: "APPROVE" }
  | { type: "REVISE" }
  | { type: "SEND_REPLY" }
  | { type: "SET_COMMENT"; value: string }
  | { type: "DECAY_FRESH"; id: string }
  | { type: "RESET" };

// Lazy initializer for useReducer — runs client-side only, so Date.now()
// doesn't cause hydration mismatches.
export function createInitialPlaygroundState(): PlaygroundState {
  const now = Date.now();
  const seed: AuditEntry[] = PLAYGROUND_AUDIT_SEED.map((entry) => ({
    id: entry.id,
    ts: now - entry.offsetMs,
    actor: entry.actor,
    action: entry.action,
    detail: entry.detail,
  }));
  return {
    approved: false,
    revisionRequested: false,
    replied: false,
    comment: "",
    audit: seed,
  };
}

// id helper. Random suffix so consecutive same-second actions don't
// collide if someone clicks fast.
function nextAuditId(): string {
  return `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function playgroundReducer(
  state: PlaygroundState,
  event: PlaygroundEvent,
): PlaygroundState {
  switch (event.type) {
    case "APPROVE": {
      // Closed loop: once the deliverable's been actioned, no second
      // approve. Revise also locks it out.
      if (state.approved || state.revisionRequested) return state;

      const now = Date.now();
      const approvalRow: AuditEntry = {
        id: nextAuditId(),
        ts: now,
        actor: PLAYGROUND_PERSONAS.mira.name,
        action: "approved deliverable",
        detail: PLAYGROUND_DELIVERABLE.fullTitle,
        fresh: true,
      };

      const trimmedNote = state.comment.trim();
      const noteRow: AuditEntry | null = trimmedNote
        ? {
            id: nextAuditId(),
            ts: now,
            actor: PLAYGROUND_PERSONAS.mira.name,
            action: "left a note for the designer",
            detail: `"${trimmedNote}"`,
            fresh: true,
          }
        : null;

      // Approval row first so it's the newest (top of feed); note row
      // sits just under it.
      const newRows = noteRow ? [approvalRow, noteRow] : [approvalRow];
      return {
        ...state,
        approved: true,
        audit: [...newRows, ...state.audit],
      };
    }

    case "REVISE": {
      if (state.approved || state.revisionRequested) return state;

      const reviseRow: AuditEntry = {
        id: nextAuditId(),
        ts: Date.now(),
        actor: PLAYGROUND_PERSONAS.mira.name,
        action: "requested revision",
        detail: PLAYGROUND_DELIVERABLE.fullTitle,
        fresh: true,
      };
      return {
        ...state,
        revisionRequested: true,
        audit: [reviseRow, ...state.audit],
      };
    }

    case "SEND_REPLY": {
      if (state.replied) return state;

      const replyRow: AuditEntry = {
        id: nextAuditId(),
        ts: Date.now(),
        actor: PLAYGROUND_PERSONAS.kai.name,
        action: "sent first reply on inquiry",
        detail: PLAYGROUND_INQUIRY.fromCompany,
        fresh: true,
      };
      return {
        ...state,
        replied: true,
        audit: [replyRow, ...state.audit],
      };
    }

    case "SET_COMMENT":
      return { ...state, comment: event.value };

    case "DECAY_FRESH":
      return {
        ...state,
        audit: state.audit.map((entry) =>
          entry.id === event.id && entry.fresh
            ? { ...entry, fresh: false }
            : entry,
        ),
      };

    case "RESET":
      return createInitialPlaygroundState();

    default:
      return state;
  }
}

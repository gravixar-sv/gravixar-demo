// Pure reducer for the V1 tour. All UI state lives here. No side
// effects, no DB. Auto-advance timers are driven by useEffect inside
// the page; this module just describes the transitions.

import type { TourStepId } from "./script";

export type TourState = {
  step: TourStepId;
  approved: boolean;
  replied: boolean;
  comment: string;
  paused: boolean;
};

export const TOUR_INITIAL_STATE: TourState = {
  step: "welcome",
  approved: false,
  replied: false,
  comment: "",
  paused: false,
};

export type TourEvent =
  | { type: "START" }
  | { type: "LOGIN_DONE" }
  | { type: "SET_COMMENT"; value: string }
  | { type: "APPROVE" }
  | { type: "REPLY" }
  | { type: "ADVANCE" }
  | { type: "TOGGLE_PAUSE" }
  | { type: "RESTART" };

// Linear order. Used by ADVANCE to pick the next step.
const ORDER: TourStepId[] = [
  "welcome",
  "login",
  "mira",
  "transition-mira-kai",
  "kai",
  "transition-kai-nox",
  "nox",
  "done",
];

function nextStep(current: TourStepId): TourStepId {
  const i = ORDER.indexOf(current);
  if (i < 0 || i >= ORDER.length - 1) return current;
  return ORDER[i + 1]!;
}

export function tourReducer(state: TourState, event: TourEvent): TourState {
  switch (event.type) {
    case "START":
      return state.step === "welcome" ? { ...state, step: "login" } : state;

    case "LOGIN_DONE":
      return state.step === "login" ? { ...state, step: "mira" } : state;

    case "SET_COMMENT":
      return { ...state, comment: event.value };

    case "APPROVE":
      if (state.step !== "mira") return state;
      return { ...state, approved: true };

    case "REPLY":
      if (state.step !== "kai") return state;
      return { ...state, replied: true };

    case "ADVANCE":
      return { ...state, step: nextStep(state.step), paused: false };

    case "TOGGLE_PAUSE":
      return { ...state, paused: !state.paused };

    case "RESTART":
      return { ...TOUR_INITIAL_STATE };

    default:
      return state;
  }
}

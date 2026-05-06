"use client";

// Lattice Tour V1. Single-page guided experience. All state in React;
// no DB, no server actions. See DEMO-TOUR-PLAN.md for the V1 spec.

import { useEffect, useReducer, useRef } from "react";
import { track } from "@vercel/analytics";
import { tourReducer, TOUR_INITIAL_STATE, type TourState } from "@/lib/tour/reducer";
import { TOUR_PERSONAS, TOUR_STEP_DURATION_MS } from "@/lib/tour/script";
import { TourTopbar } from "@/components/tour/TourTopbar";
import { TourWelcome } from "@/components/tour/TourWelcome";
import { TourLogin } from "@/components/tour/TourLogin";
import { TourPersonaView } from "@/components/tour/TourPersonaView";
import { TourTransition } from "@/components/tour/TourTransition";
import { TourDone } from "@/components/tour/TourDone";

// After the visitor clicks Approve / Send reply, we briefly hold on the
// confirmed state before auto-advancing. Long enough to register the
// affordance, short enough to keep the tour at ~60s.
const POST_ACTION_DELAY_MS = 1200;

export default function TourPage() {
  const [state, dispatch] = useReducer(tourReducer, TOUR_INITIAL_STATE);

  // Track step transitions. We fire one event per step change so the
  // V2 trigger metrics (≥30 completions, bounce rate) have a stream
  // to pivot on. Initial mount on "welcome" is intentionally skipped —
  // a page view already tells us a visitor reached /tour.
  const previousStepRef = useRef<TourState["step"]>(state.step);
  useEffect(() => {
    const previous = previousStepRef.current;
    if (previous !== state.step) {
      track("tour_step_advanced", { from: previous, to: state.step });
      if (previous === "welcome" && state.step === "login") {
        track("tour_started");
      }
      if (state.step === "done") {
        track("tour_completed");
      }
      previousStepRef.current = state.step;
    }
  }, [state.step]);

  // Auto-advance timer. Recomputes whenever step or pause/action state
  // changes; one timer at a time, cleaned up on every transition.
  useEffect(() => {
    if (state.paused) return;
    const baseDuration = TOUR_STEP_DURATION_MS[state.step];
    if (baseDuration == null) return;

    // After a closed-loop click, collapse the read-window so the tour
    // doesn't stall on a confirmed state.
    let duration = baseDuration;
    if (state.step === "mira" && state.approved) duration = POST_ACTION_DELAY_MS;
    if (state.step === "kai" && state.replied) duration = POST_ACTION_DELAY_MS;

    const id = window.setTimeout(() => {
      dispatch({ type: "ADVANCE" });
    }, duration);
    return () => window.clearTimeout(id);
  }, [state.step, state.paused, state.approved, state.replied]);

  // ESC key toggles pause. Only active during the running steps; on
  // welcome/done we'd rather not capture keystrokes.
  useEffect(() => {
    const running = state.step !== "welcome" && state.step !== "done";
    if (!running) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        dispatch({ type: "TOGGLE_PAUSE" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.step]);

  // Status string read by the live region. Keeps screen readers in sync
  // without speaking every internal step (transition steps are skipped).
  const liveStatus = describeStep(state);

  return (
    <main className="bg-lattice min-h-[calc(100dvh-40px)]">
      <TourTopbar
        step={state.step}
        paused={state.paused}
        onTogglePause={() => dispatch({ type: "TOGGLE_PAUSE" })}
        onRestart={() => dispatch({ type: "RESTART" })}
      />

      <p
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveStatus}
      </p>

      {state.step === "welcome" ? (
        <TourWelcome onStart={() => dispatch({ type: "START" })} />
      ) : null}

      {state.step === "login" ? (
        <TourLogin onLoginDone={() => dispatch({ type: "LOGIN_DONE" })} />
      ) : null}

      {state.step === "mira" ? (
        <TourPersonaView
          personaKey="mira"
          comment={state.comment}
          onCommentChange={(value) => dispatch({ type: "SET_COMMENT", value })}
          onApprove={() => dispatch({ type: "APPROVE" })}
          onReply={() => dispatch({ type: "REPLY" })}
          approved={state.approved}
          replied={state.replied}
          onSkip={() => dispatch({ type: "ADVANCE" })}
        />
      ) : null}

      {state.step === "transition-mira-kai" ? (
        <TourTransition toPersonaKey="kai" />
      ) : null}

      {state.step === "kai" ? (
        <TourPersonaView
          personaKey="kai"
          comment={state.comment}
          onCommentChange={(value) => dispatch({ type: "SET_COMMENT", value })}
          onApprove={() => dispatch({ type: "APPROVE" })}
          onReply={() => dispatch({ type: "REPLY" })}
          approved={state.approved}
          replied={state.replied}
          onSkip={() => dispatch({ type: "ADVANCE" })}
        />
      ) : null}

      {state.step === "transition-kai-nox" ? (
        <TourTransition toPersonaKey="nox" />
      ) : null}

      {state.step === "nox" ? (
        <TourPersonaView
          personaKey="nox"
          comment={state.comment}
          onCommentChange={(value) => dispatch({ type: "SET_COMMENT", value })}
          onApprove={() => dispatch({ type: "APPROVE" })}
          onReply={() => dispatch({ type: "REPLY" })}
          approved={state.approved}
          replied={state.replied}
          onSkip={() => dispatch({ type: "ADVANCE" })}
        />
      ) : null}

      {state.step === "done" ? (
        <TourDone onRestart={() => dispatch({ type: "RESTART" })} />
      ) : null}
    </main>
  );
}

function describeStep(state: TourState): string {
  if (state.paused) {
    return "Tour paused. Press Escape or the Resume button to continue.";
  }
  switch (state.step) {
    case "welcome":
      return "Welcome to the 60-second guided tour.";
    case "login":
      return "Signing in.";
    case "mira":
      return `Now viewing as ${TOUR_PERSONAS.mira.name}, the client.`;
    case "kai":
      return `Now viewing as ${TOUR_PERSONAS.kai.name}, the project manager.`;
    case "nox":
      return `Now viewing as ${TOUR_PERSONAS.nox.name}, the admin.`;
    case "done":
      return "Tour complete.";
    case "transition-mira-kai":
    case "transition-kai-nox":
      return "";
  }
}

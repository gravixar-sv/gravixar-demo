"use client";

// useReducer for a scene, with every visitor action wrapped in a View
// Transition (see viewTransition.ts). The one exception is the
// fresh-flag decay the scenes fire on a timer: that only clears a
// highlight, and snapshotting the page for it every two seconds would
// be pointless work.

import { useCallback, useReducer, type Dispatch, type Reducer } from "react";
import { withViewTransition } from "@/lib/viewTransition";

type TypedEvent = { type: string };

export function useSceneDispatch<S, E extends TypedEvent>(
  reducer: Reducer<S, E>,
  init: () => S,
): [S, Dispatch<E>] {
  const [state, raw] = useReducer(reducer, undefined, init);
  const dispatch = useCallback(
    (event: E) => {
      if (event.type === "DECAY_FRESH") {
        raw(event);
        return;
      }
      withViewTransition(() => raw(event));
    },
    [raw],
  );
  return [state, dispatch];
}

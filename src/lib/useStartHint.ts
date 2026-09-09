"use client";

// "Start here." A first-time visitor lands on a three-column grid and
// has to read a paragraph to know what to press. The scene marks one
// button with `data-hint` and CSS puts a quiet scene-accent ring pulse
// on it; the first click anywhere in the workspace (capture phase, so
// it lands before any handler) ends the hint for good.

import { useCallback, useState } from "react";

export function useStartHint(): {
  /** True until the visitor has clicked anything in the workspace. */
  hint: boolean;
  /** Spread onto the workspace wrapper: `onClickCapture={endHint}`. */
  endHint: () => void;
} {
  const [touched, setTouched] = useState(false);
  const endHint = useCallback(() => setTouched(true), []);
  return { hint: !touched, endHint };
}

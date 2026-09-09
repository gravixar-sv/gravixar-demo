"use client";

// Wraps a synchronous DOM update in a View Transition so any element
// carrying a `view-transition-name` animates from its old box to its
// new one. This is what lets a deliverable card physically slide from
// one column to the next instead of vanishing and reappearing, and
// what lets a feed reflow slide rather than jump.
//
// Progressive: with no browser support, reduced motion, or a hidden
// tab, the update simply runs. Nothing about base visibility depends
// on the transition, and the root crossfade is disabled in CSS so only
// named elements move; everything else keeps rendering live.
//
// The update callback is invoked by the browser once it has captured
// the old state, which needs a rendering opportunity. In a context
// whose render pipeline is throttled or frozen (some webviews, capture
// tools, the in-app preview pane) that can be never, and the click
// would silently do nothing. So a timer skips the transition if the
// callback has not run within a beat; skipping still runs the update,
// just without the animation. Same principle as useReveal's rescue.

import { flushSync } from "react-dom";

export function withViewTransition(update: () => void) {
  if (typeof document === "undefined") {
    update();
    return;
  }
  const canTransition =
    "startViewTransition" in document &&
    typeof document.startViewTransition === "function" &&
    document.visibilityState === "visible" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canTransition) {
    update();
    return;
  }

  // flushSync so React commits before the new-state snapshot is taken.
  let ran = false;
  const vt = document.startViewTransition(() => {
    ran = true;
    flushSync(update);
  });
  const guard = window.setTimeout(() => {
    if (!ran) vt.skipTransition();
  }, UPDATE_GUARD_MS);
  vt.updateCallbackDone
    .finally(() => window.clearTimeout(guard))
    .catch(() => {});
  // A transition that is skipped (a newer one started, or a duplicate
  // name in the tree) rejects `ready`; that is expected, not an error.
  vt.ready.catch(() => {});
}

/** Longest the visitor's click may wait on the browser's snapshot. */
const UPDATE_GUARD_MS = 160;

/** A safe `view-transition-name` (a CSS custom-ident) for a keyed row. */
export function vtName(prefix: string, id: string | number): string {
  return `${prefix}-${String(id).replace(/[^A-Za-z0-9_-]/g, "-")}`;
}

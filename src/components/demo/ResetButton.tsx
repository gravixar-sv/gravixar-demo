"use client";

// Visitor-triggered scene reset. Clicks the resetSceneAction server
// action, which calls wipeAndReseedDemo(). The button shows a pending
// state via useTransition and then revalidates the current page.
//
// Note: reset is global (every visitor sees the canonical seed again).
// Documented on the gallery landing so the visitor isn't surprised.

import { useTransition } from "react";
import { resetSceneAction } from "@/lib/actions/lattice";

export function ResetButton({
  variant = "ghost",
  label = "reset scene",
}: {
  variant?: "ghost" | "solid";
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  const base =
    variant === "solid"
      ? "border border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/15 text-[var(--color-scene-1)] hover:bg-[var(--color-scene-1)]/25"
      : "border border-white/10 text-zinc-300 hover:border-white/30 hover:text-white";

  return (
    <button
      type="button"
      onClick={() => startTransition(() => resetSceneAction())}
      disabled={pending}
      title="Wipe + re-seed the demo data so you can try the same flows again"
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors disabled:opacity-50 ${base}`}
    >
      <span aria-hidden className={pending ? "animate-spin" : ""}>
        ↻
      </span>
      {pending ? "resetting…" : label}
    </button>
  );
}

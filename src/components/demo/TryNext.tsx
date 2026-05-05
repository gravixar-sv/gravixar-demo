// Guided callout shown on each Lattice persona page. Tells the visitor
// what to try next so the demo doesn't dead-end. The accent uses the
// scene's primary color via the --color-scene-1 CSS variable.

import type { ReactNode } from "react";

export function TryNext({
  title = "try this",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside
      role="note"
      className="rounded-xl border border-[var(--color-scene-1)]/25 bg-[var(--color-scene-1)]/[0.04] px-5 py-4"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
        {title} →
      </p>
      <div className="mt-2 text-sm leading-relaxed text-zinc-200">
        {children}
      </div>
    </aside>
  );
}

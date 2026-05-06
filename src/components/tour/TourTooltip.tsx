"use client";

// Guidance overlay shown next to the persona panel during the tour.
// On desktop sits as a sidebar to the right of the panel; on mobile
// stacks above as an inline note. No floating positioning math —
// keeps a11y + responsive behavior simple.

type Props = {
  title: string;
  body: string;
};

export function TourTooltip({ title, body }: Props) {
  return (
    <aside
      role="note"
      className="rounded-2xl border border-[var(--color-scene-1)]/30 bg-[var(--color-scene-1)]/[0.06] p-5"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
        {title}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-200">{body}</p>
    </aside>
  );
}

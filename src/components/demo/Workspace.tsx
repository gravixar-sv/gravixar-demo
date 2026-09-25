import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { findScene } from "@/lib/scenes";
import { formatRelative } from "@/lib/formatRelative";
import { vtName } from "@/lib/viewTransition";
import { SceneGlyph } from "@/components/demo/SceneLayout";

// The scene's app window. One lit frame with the product's own app bar
// on top and the columns inside it as panes divided by hairlines, so a
// scene reads as one piece of software rather than three cards on a
// page. On phones the panes become a swipe rail.
export function Workspace({
  slug,
  board,
  toolbar,
  cols = "lg:grid-cols-3",
  onClickCapture,
  children,
}: {
  slug: string;
  /** Where in the product we are: "Spring rebrand · review board". */
  board: string;
  /** Optional right-side app-bar content (presence, a live count). */
  toolbar?: ReactNode;
  /** Grid template from lg up, e.g. "lg:grid-cols-[0.9fr_1.2fr_1fr]". */
  cols?: string;
  /** useStartHint's endHint, so the first click anywhere ends the hint. */
  onClickCapture?: () => void;
  children: ReactNode;
}) {
  const scene = findScene(slug)!;
  return (
    <section aria-label={`${scene.appName} workspace`} className="frame scene-rise-2 mt-8 rounded-[22px] md:mt-10">
      <div className="flex h-12 items-center gap-2.5 rounded-t-[21px] border-b border-line bg-white/[0.015] px-4">
        <SceneGlyph scene={scene} size="sm" />
        <span className="shrink-0 whitespace-nowrap text-[13px] font-semibold text-ink-100">{scene.appName}</span>
        <span aria-hidden className="text-ink-600">/</span>
        <span className="min-w-0 truncate text-[13px] text-ink-400">{board}</span>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          {toolbar}
          <span className="chip hidden sm:inline-flex">
            <span aria-hidden className="live-dot text-emerald-400" />
            sample data
          </span>
        </div>
      </div>
      <div
        onClickCapture={onClickCapture}
        className={cn(
          "scene-columns no-scrollbar flex snap-x snap-mandatory overflow-x-auto divide-x divide-line lg:grid lg:overflow-visible",
          cols,
        )}
      >
        {children}
      </div>
    </section>
  );
}

// One column of the workspace. `lead` is the avatar or icon, `title`
// the person or queue, `tag` their role, `count` a live number that
// pops when it changes. `flow` is the name flowPulse() targets.
export function Pane({
  id,
  title,
  tag,
  sub,
  lead,
  count,
  status,
  flow,
  className,
  children,
}: {
  id: string;
  title: ReactNode;
  tag?: ReactNode;
  sub?: ReactNode;
  lead?: ReactNode;
  count?: number;
  /** Small machine label above the items: "your review", "queue". */
  status?: ReactNode;
  flow?: string;
  className?: string;
  children: ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <section
      data-flow={flow}
      aria-labelledby={headingId}
      className={cn(
        "w-[86%] shrink-0 snap-start p-4 first:rounded-bl-[21px] last:rounded-br-[21px] sm:w-[58%] md:p-5 lg:w-auto",
        className,
      )}
    >
      <header className="flex items-center gap-3">
        {lead}
        <div className="min-w-0 flex-1">
          <h2 id={headingId} className="flex items-baseline gap-2 truncate text-sm font-semibold text-ink-50">
            {title}
            {tag ? <span className="label-mono text-scene-soft">{tag}</span> : null}
          </h2>
          {sub ? <p className="mt-0.5 truncate text-xs text-ink-400">{sub}</p> : null}
        </div>
        {count !== undefined ? (
          <span
            key={count}
            aria-label={`${count} items`}
            className="pop-in inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white/[0.06] px-2 font-mono text-[11px] text-ink-200"
          >
            {count}
          </span>
        ) : null}
      </header>
      {status ? <p className="label-mono mt-5">{status}</p> : null}
      <div className={cn("space-y-3", status ? "mt-2.5" : "mt-5")}>{children}</div>
    </section>
  );
}

/** A work item: the one card inside a pane. Lifts and catches the light. */
export function ItemCard({
  vt,
  fresh,
  tone = "accent",
  className,
  style,
  children,
}: {
  /** view-transition-name, from vtName(prefix, id), so it can travel. */
  vt?: string;
  /** Just arrived: flash, and ring in the tone colour. */
  fresh?: boolean;
  tone?: "accent" | "positive" | "caution" | "danger";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ring = {
    accent: "border-[color-mix(in_oklab,var(--color-scene-1)_50%,transparent)]",
    positive: "border-emerald-400/45",
    caution: "border-amber-400/45",
    danger: "border-rose-400/45",
  }[tone];
  return (
    <article
      data-spot
      data-lift
      style={{ ...(vt ? { viewTransitionName: vt } : null), ...style }}
      className={cn("item rounded-xl p-3.5", fresh && ["pg-fresh-move", ring], className)}
    >
      {children}
    </article>
  );
}

export function EmptyState({ show = true, children }: { show?: boolean; children: ReactNode }) {
  if (!show) return null;
  return (
    <p className="rounded-xl border border-dashed border-white/[0.1] px-4 py-7 text-center text-xs leading-relaxed text-ink-500">
      {children}
    </p>
  );
}

export type LogEntry = {
  id: string;
  ts: number;
  actor?: string;
  action: string;
  detail?: string;
  fresh?: boolean;
};

// The receipts: every hop the visitor caused, newest first, as a
// timeline. The live region sits on the stable list, not on the rows.
export function ActivityLog({
  id,
  title = "Activity",
  sub = "Every action, logged as it happens",
  entries,
  limit = 6,
  vtPrefix,
  className,
}: {
  id: string;
  title?: string;
  sub?: string;
  entries: LogEntry[];
  limit?: number;
  vtPrefix: string;
  className?: string;
}) {
  const headingId = `${id}-heading`;
  return (
    <section aria-labelledby={headingId} className={cn("surface rounded-2xl p-5 md:p-6", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={headingId} className="heading text-lg text-ink-50">
          {title}
        </h2>
        <p className="text-xs text-ink-500">{sub}</p>
      </div>
      <ol aria-live="polite" className="mt-5">
        {entries.slice(0, limit).map((e, i, all) => (
          <li
            key={e.id}
            style={{ viewTransitionName: vtName(vtPrefix, e.id) }}
            className={cn(
              "relative grid grid-cols-[14px_minmax(0,1fr)_auto] gap-x-3 rounded-lg py-2 pr-2",
              e.fresh && "pg-fresh",
            )}
          >
            <span aria-hidden className="relative flex justify-center">
              <span
                className={cn(
                  "relative z-10 mt-[5px] h-2 w-2 rounded-full ring-4 ring-ink-925",
                  e.fresh ? "bg-scene" : "bg-ink-600",
                )}
              />
              {i < all.length - 1 ? (
                <span className="absolute bottom-[-8px] top-[14px] w-px bg-white/[0.08]" />
              ) : null}
            </span>
            <p className="text-[13px] leading-relaxed text-ink-300">
              {e.actor ? <span className="font-semibold text-ink-100">{e.actor} </span> : null}
              {e.action}
              {e.detail ? <span className="text-ink-500"> · {e.detail}</span> : null}
            </p>
            <time suppressHydrationWarning className="mt-0.5 font-mono text-[10.5px] text-ink-500">
              {formatRelative(e.ts)}
            </time>
          </li>
        ))}
      </ol>
    </section>
  );
}

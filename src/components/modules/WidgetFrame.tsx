import type { ReactNode } from "react";
import { findScene } from "@/lib/scenes";
import { SceneGlyph } from "@/components/demo/SceneLayout";

// The app window every module sandbox sits in: the same lit frame and
// app bar as a scene's Workspace, so a widget reads as a slice of real
// software. The sandboxes run on Lattice's sample data, so the bar says
// so honestly.
export function WidgetFrame({
  crumb,
  toolbar,
  children,
}: {
  /** Where in the product: "Review state machine". */
  crumb: string;
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  const lattice = findScene("lattice")!;
  return (
    <section aria-label={`${crumb} sandbox`} className="frame scene-rise-2 rounded-[22px]">
      <div className="flex h-12 items-center gap-2.5 rounded-t-[21px] border-b border-line bg-white/[0.015] px-4">
        <SceneGlyph scene={lattice} size="sm" />
        <span className="shrink-0 whitespace-nowrap text-[13px] font-semibold text-ink-100">{lattice.appName}</span>
        <span aria-hidden className="text-ink-600">
          /
        </span>
        <span className="min-w-0 truncate text-[13px] text-ink-400">{crumb}</span>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {toolbar}
          <span className="chip hidden sm:inline-flex">
            <span aria-hidden className="live-dot text-emerald-400" />
            sample data
          </span>
        </div>
      </div>
      <div className="p-4 md:p-6">{children}</div>
    </section>
  );
}

/** A small section heading inside a widget, with an optional right-hand readout. */
export function WidgetHeading({ id, children, aside }: { id: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 id={id} className="heading text-lg text-ink-50">
        {children}
      </h2>
      {aside ? <div className="text-xs text-ink-500">{aside}</div> : null}
    </div>
  );
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

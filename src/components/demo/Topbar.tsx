import Link from "next/link";

// Small topbar shown above scene content. The DemoBanner is above this.
// Back-to-scenes link + scene name (+ optional flavour label), scene-
// tinted via CSS vars. The playground scenes own their own reset, so
// the topbar no longer renders one.

export function Topbar({
  sceneName,
  personaLabel,
}: {
  sceneName: string;
  personaLabel?: string;
  /** Deprecated, retained so existing call sites compile; ignored. */
  showReset?: boolean;
}) {
  return (
    <div className="border-b border-white/5 bg-black/30 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-300 transition-colors hover:text-white"
          >
            <span aria-hidden>←</span>
            <span>all scenes</span>
          </Link>
          <span className="hidden text-zinc-700 sm:inline">·</span>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              scene
            </span>
            <span className="text-sm text-zinc-100">{sceneName}</span>
            {personaLabel ? (
              <>
                <span className="text-zinc-700">·</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
                  {personaLabel}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>
      {/* Mobile-only line for scene + persona info (hidden on sm+) */}
      {personaLabel ? (
        <div className="border-t border-white/5 px-6 py-2 sm:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              {sceneName}
            </span>
            <span className="text-zinc-700">·</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
              {personaLabel}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

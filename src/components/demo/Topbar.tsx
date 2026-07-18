import Image from "next/image";
import Link from "next/link";

// Shared top chrome for every demo page. Sits under the DemoBanner.
// - home variant (entry / scene-index): brand mark + gravixar.com, no
//   back link (you're already at the top).
// - scene variant: "← all scenes" back link + scene name (+ optional
//   flavour label), scene-tinted via CSS vars.
// Same height / border / type treatment in both, so the chrome reads as
// one product across the entry and the scenes.

export function Topbar({
  sceneName,
  personaLabel,
  home = false,
}: {
  sceneName?: string;
  personaLabel?: string;
  /** Entry / scene-index chrome: brand mark instead of a back link. */
  home?: boolean;
  /** Deprecated, retained so existing call sites compile; ignored. */
  showReset?: boolean;
}) {
  return (
    <div className="border-b border-white/5 bg-black/30 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-4">
          {home ? (
            <span className="flex items-center gap-2.5">
              <Image
                src="/brand/gravixar-wordmark.png"
                alt="Gravixar"
                width={130}
                height={32}
                priority
                className="h-4 w-auto"
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                · demo
              </span>
            </span>
          ) : (
            <>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-white/30 hover:bg-white/[0.1] hover:text-white"
              >
                <span aria-hidden>←</span>
                <span>All scenes</span>
              </Link>
              <span aria-hidden className="hidden text-zinc-700 sm:inline">·</span>
              <div className="hidden items-center gap-3 sm:flex">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  scene
                </span>
                <span className="text-sm text-zinc-100">{sceneName}</span>
                {personaLabel ? (
                  <>
                    <span aria-hidden className="text-zinc-700">·</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
                      {personaLabel}
                    </span>
                  </>
                ) : null}
              </div>
            </>
          )}
        </div>

        <a
          href="https://gravixar.com"
          rel="noreferrer"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-200"
        >
          gravixar.com →
        </a>
      </div>
    </div>
  );
}

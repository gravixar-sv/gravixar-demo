import Link from "next/link";

// Small topbar shown above scene content. The DemoBanner is above this.
// Persona name + back-to-gallery link, scene-tinted via CSS vars.

export function Topbar({
  sceneName,
  personaLabel,
}: {
  sceneName: string;
  personaLabel?: string;
}) {
  return (
    <div className="border-b border-white/5 bg-black/30 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-zinc-300 transition-colors hover:text-white"
        >
          <span aria-hidden>←</span>
          <span>gallery</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            scene
          </span>
          <span className="text-sm text-zinc-100">{sceneName}</span>
          {personaLabel ? (
            <>
              <span className="text-zinc-700">·</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-scene-1)]">
                {personaLabel}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { SCENES, type Scene } from "@/lib/scenes";
import { Topbar } from "@/components/demo/Topbar";

export const metadata: Metadata = {
  title: "Gravixar Demo: live software I built for clients",
  description:
    "Real, working apps with sample data. Open one and use it. Not slides, not a signup.",
};

export default function SceneIndex() {
  const live = SCENES.filter((s) => s.status === "live");
  // Show one "coming soon" placeholder (the brand/DTC scene) so the
  // visitor knows the showcase is growing without cluttering the index.
  const upcoming = SCENES.find((s) => s.status === "coming-online" && s.persona === "brand");

  return (
    <div className="bg-gallery min-h-[calc(100dvh-40px)]">
      <Topbar home />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10 lg:px-12">

        {/* ── Header: answers "what is this?" in the first 10 seconds ── */}
        <header className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-scene-1,#FF6B6B)]">
            capability showroom
          </p>
          <h1 className="mt-3 text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-zinc-50 md:text-5xl lg:text-[3.5rem]">
            Live software I built
            <br className="hidden sm:block" />{" "}
            for clients.{" "}
            <span style={{ color: "var(--color-scene-1, #FF6B6B)" }}>
              Open one and use it.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">
            Real, working apps with sample data, not slides, not a signup.
            Click into one and try the actual workflow.
          </p>
        </header>

        {/* ── Scene cards ─────────────────────────────────────────── */}
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {live.map((scene) => (
            <SceneCard key={scene.slug} scene={scene} />
          ))}
        </div>

        {/* ── Coming soon ─────────────────────────────────────────── */}
        {upcoming ? (
          <div className="mt-4">
            <ComingSoonCard scene={upcoming} />
          </div>
        ) : null}

        {/* ── Sandbox reassurance ─────────────────────────────────── */}
        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
          Sandbox · sample data · resets every Sunday · no sign-in
        </p>
      </div>
    </div>
  );
}

// ── Live scene card — strong information scent: branded name + plain
//    subtitle + who-it's-for + one concrete thing to do + open button.
function SceneCard({ scene }: { scene: Scene }) {
  const accent = scene.swatches[1];

  return (
    <Link
      href={`/${scene.slug}`}
      className="group relative block overflow-hidden rounded-2xl"
      style={{ minHeight: "260px" }}
    >
      {/* Scene's own background so each card feels like its portal */}
      <div className={`absolute inset-0 ${scene.bgUtility}`} />
      <div
        aria-hidden
        className="bg-dot-grid pointer-events-none absolute inset-0 opacity-20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(60% 60% at 100% 0%, ${accent}1f 0%, transparent 70%)`,
        }}
      />
      {/* Border surface */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.06), 0 1px 0 0 rgba(255,255,255,0.02)",
        }}
      />
      <div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)" }}
      />

      <div className="relative flex h-full flex-col justify-between px-7 pb-7 pt-7">
        {/* Top: branded name + plain subtitle, LIVE badge */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-medium tracking-[-0.015em] text-zinc-50">
                {scene.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-300">{scene.whatItIs}</p>
            </div>
            <span className="mt-1 flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/90">
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              live
            </span>
          </div>
          <span
            className="mt-4 inline-block rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em]"
            style={{ borderColor: `${accent}40`, color: accent }}
          >
            for {scene.personaLabel}
          </span>
        </div>

        {/* Bottom: what you can do + open button */}
        <div className="mt-6 border-t border-white/5 pt-5">
          <p className="text-sm leading-relaxed text-zinc-400">
            {scene.tryLine}
          </p>
          <span
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium transition-colors group-hover:text-white"
            style={{ color: accent }}
          >
            {scene.openLabel}
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Coming-soon card — present but clearly not yet clickable.
function ComingSoonCard({ scene }: { scene: Scene }) {
  return (
    <div className="scene-card relative overflow-hidden rounded-2xl px-7 py-6">
      <div
        aria-hidden
        className="bg-dot-grid pointer-events-none absolute inset-0 opacity-10"
      />
      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg font-medium text-zinc-300">{scene.name}</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
              for {scene.personaLabel}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">{scene.whatItIs}</p>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-zinc-600" />
          building now
        </span>
      </div>
    </div>
  );
}

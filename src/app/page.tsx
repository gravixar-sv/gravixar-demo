import Link from "next/link";
import type { Metadata } from "next";
import { SCENES, type Scene } from "@/lib/scenes";

export const metadata: Metadata = {
  title: "Gravixar Demo — What are you building for?",
  description:
    "Pick the context closest to yours. I built each of these for a real client problem.",
};

export default function EntryScreen() {
  const agencyScene = SCENES.find((s) => s.persona === "agency" && s.status === "live")!;
  const foundersScene = SCENES.find((s) => s.persona === "founders" && s.status === "live")!;
  const brandScene = SCENES.find((s) => s.persona === "brand")!;

  return (
    <div className="bg-gallery min-h-[calc(100dvh-40px)]">
      <div className="mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-16">

        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="flex items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              Gravixar · Demo
            </p>
            <h1 className="mt-4 text-5xl font-medium leading-[1.02] tracking-[-0.03em] text-zinc-50 md:text-6xl lg:text-7xl">
              What are you
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #FF6B6B 0%, #FF2D95 55%, #00E1FF 100%)",
                }}
              >
                building for?
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-zinc-400 md:text-lg">
              Pick the context closest to yours. I built each of these for a
              real client problem.
            </p>
          </div>
          <a
            href="https://gravixar.com"
            rel="noreferrer"
            className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-200 md:block"
          >
            gravixar.com →
          </a>
        </header>

        {/* ── Identity tiles — live scenes ───────────────────────── */}
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <LiveTile scene={agencyScene} accentColor="#FF6B6B" />
          <LiveTile scene={foundersScene} accentColor="#00E1FF" />
        </div>

        {/* ── Brand & DTC — coming soon ───────────────────────────── */}
        <div className="mt-4">
          <ComingSoonTile scene={brandScene} />
        </div>

        {/* ── Footer note ─────────────────────────────────────────── */}
        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
          Sandboxed · Resets every Sunday · No sign-in required
        </p>
      </div>
    </div>
  );
}

// ── Live scene tile ────────────────────────────────────────────────

function LiveTile({
  scene,
  accentColor,
}: {
  scene: Scene;
  accentColor: string;
}) {
  return (
    <Link
      href={`/${scene.slug}`}
      className="group relative block overflow-hidden rounded-2xl"
      style={{ minHeight: "300px" }}
    >
      {/* Scene background fills the tile */}
      <div className={`absolute inset-0 ${scene.bgUtility}`} />

      {/* Dot-grid texture */}
      <div
        aria-hidden
        className="bg-dot-grid pointer-events-none absolute inset-0 opacity-20"
      />

      {/* Hover accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(60% 60% at 100% 0%, ${accentColor}18 0%, transparent 70%)`,
        }}
      />

      {/* scene-card border + surface over the bg */}
      <div
        className="absolute inset-0 rounded-2xl transition-all duration-220"
        style={{
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.06), 0 1px 0 0 rgba(255,255,255,0.02)",
        }}
      />
      <div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-220 group-hover:opacity-100"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
        }}
      />

      {/* Content */}
      <div className="relative flex h-full flex-col justify-between px-7 pb-7 pt-7">
        {/* Top: persona + status */}
        <div className="flex items-center justify-between">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ color: accentColor }}
          >
            {scene.personaLabel}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/90">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            live
          </span>
        </div>

        {/* Middle: problem statement */}
        <div className="mt-8">
          <p className="text-xl font-medium leading-snug tracking-[-0.015em] text-zinc-50 md:text-2xl">
            {scene.problemStatement}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            {scene.description}
          </p>
        </div>

        {/* Bottom: scene name + enter */}
        <div className="mt-8 flex items-end justify-between gap-4 border-t border-white/5 pt-5">
          <div>
            <p className="text-sm font-medium text-zinc-100">{scene.name}</p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              {scene.bucket}
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors group-hover:text-white"
            style={{ color: accentColor }}
          >
            Enter scene
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

// ── Coming-soon tile ───────────────────────────────────────────────

function ComingSoonTile({ scene }: { scene: Scene }) {
  return (
    <div className="scene-card relative overflow-hidden rounded-2xl px-7 py-6">
      <div
        aria-hidden
        className="bg-dot-grid pointer-events-none absolute inset-0 opacity-10"
      />
      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
            {scene.personaLabel}
          </span>
          <p className="mt-2 text-base font-medium text-zinc-500">
            {scene.problemStatement}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-zinc-600" />
            Building now
          </span>
          <span className="rounded-sm border border-white/8 bg-white/[0.03] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">
            {scene.name}
          </span>
        </div>
      </div>
    </div>
  );
}

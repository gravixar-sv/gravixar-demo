// Gallery landing, reframed as the dashboard for the demo. Polish
// session 1 (2026-05-07): replaces the previous long-scroll marketing
// landing with a single-screen-ish dashboard layout. The
// DashboardShell provides the persistent rail; this file fills the
// main pane with hero + scene tiles + modules strip + coming-online
// strip.

import Link from "next/link";
import { SCENES } from "@/lib/scenes";
import { DashboardShell } from "@/components/demo/DashboardShell";

export default function GalleryDashboard() {
  const live = SCENES.filter((s) => s.status === "live");
  const coming = SCENES.filter((s) => s.status === "coming-online");

  return (
    <DashboardShell>
      <div className="space-y-12">
        <HeroTile />
        <LiveScenes scenes={live} />
        <ModulesStrip />
        {coming.length > 0 ? <ComingOnline scenes={coming} /> : null}
      </div>
    </DashboardShell>
  );
}

// ── Hero ──────────────────────────────────────────────────────────

function HeroTile() {
  return (
    <section
      aria-labelledby="hero-title"
      className="scene-card relative overflow-hidden rounded-2xl"
    >
      <div
        aria-hidden
        className="bg-dot-grid pointer-events-none absolute inset-0 opacity-30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 80% at 100% 0%, rgba(255, 107, 107, 0.18) 0%, transparent 60%), radial-gradient(50% 80% at 0% 100%, rgba(0, 225, 255, 0.10) 0%, transparent 55%)",
        }}
      />
      <div className="relative px-6 pb-8 pt-8 md:px-10 md:py-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#FF6B6B]">
          gravixar, demo gallery
        </p>
        <h1
          id="hero-title"
          className="mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.02em] text-zinc-50 md:text-5xl lg:text-6xl"
        >
          Pick a portal.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B6B] to-[#00E1FF]">
            Click around.
          </span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-300 md:text-lg">
          The same shapes run for agencies, clinics, accountants, consultancies,
          and DTC brands. Each scene below is a real running portal — sign in
          as a persona, try the workflow, see what fits.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/tour"
            className="inline-flex items-center gap-2 rounded-md border border-[#FF6B6B]/40 bg-[#FF6B6B]/15 px-4 py-2.5 text-sm font-medium text-[#FF6B6B] transition-colors hover:bg-[#FF6B6B]/25"
          >
            Start the 60-second tour
            <span aria-hidden>→</span>
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            or scroll to pick a scene
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Live scenes section ──────────────────────────────────────────

function LiveScenes({ scenes }: { scenes: typeof SCENES }) {
  return (
    <section aria-labelledby="live-scenes-title">
      <SectionHeader id="live-scenes-title" title="Live now" meta={`${scenes.length} ${scenes.length === 1 ? "scene" : "scenes"}`} />
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {scenes.map((scene, i) => (
          <SceneTile key={scene.slug} scene={scene} index={i} />
        ))}
      </div>
    </section>
  );
}

function SceneTile({
  scene,
  index,
}: {
  scene: (typeof SCENES)[number];
  index: number;
}) {
  return (
    <Link
      href={`/${scene.slug}`}
      className="scene-card group relative block overflow-hidden rounded-2xl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 transition-opacity group-hover:opacity-80"
        style={{
          background: `radial-gradient(70% 80% at 100% 0%, ${scene.swatches[1]}28 0%, transparent 60%), radial-gradient(50% 80% at 0% 100%, ${scene.swatches[2]}1a 0%, transparent 55%)`,
        }}
      />
      <div className="relative px-6 pb-6 pt-6 md:px-7 md:pt-7 md:pb-7">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            {String(index + 1).padStart(2, "0")} / {scene.bucket}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/90">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 text-emerald-400" />
            live
          </span>
        </div>
        <h3 className="mt-6 text-2xl font-medium leading-tight tracking-[-0.015em] md:text-[1.7rem]">
          {scene.name}
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-300">
          {scene.tagline}
        </p>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-1.5">
            {scene.swatches.map((c, i) => (
              <span
                key={`${c}-${i}`}
                className="h-4 w-4 rounded-full border border-white/15"
                style={{ background: c }}
                aria-hidden
              />
            ))}
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-200 transition-colors group-hover:text-white">
            enter scene
            <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Modules strip ────────────────────────────────────────────────

function ModulesStrip() {
  return (
    <section aria-labelledby="modules-title">
      <SectionHeader id="modules-title" title="Modules, the building blocks" meta="12 patterns" />
      <Link
        href="/modules"
        className="scene-card group mt-5 block overflow-hidden rounded-2xl"
      >
        <div className="relative px-6 pb-6 pt-6 md:px-7 md:pt-7 md:pb-7">
          <div className="flex items-center justify-between">
            <p className="text-base text-zinc-200 md:text-lg">
              Skip the scenes. Try one capability at a time.
            </p>
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/90">
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 text-emerald-400" />
              3 interactive
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Review state machine, daily check-in, audit log + restore — three
            interactive sandboxes plus nine more coming online.
          </p>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {["auth", "audit", "ai", "finance", "ops"].map((c) => (
                <span
                  key={c}
                  className="rounded-sm border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400"
                >
                  {c}
                </span>
              ))}
            </div>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-200 transition-colors group-hover:text-white">
              open library
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}

// ── Coming online strip ──────────────────────────────────────────

function ComingOnline({ scenes }: { scenes: typeof SCENES }) {
  return (
    <section aria-labelledby="coming-title">
      <SectionHeader id="coming-title" title="Coming online" meta={`${scenes.length} in build`} />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {scenes.map((scene) => (
          <div
            key={scene.slug}
            className="scene-card flex items-center justify-between rounded-2xl px-5 py-4"
          >
            <div>
              <p className="text-sm text-zinc-200">{scene.name}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                {scene.bucket}
              </p>
            </div>
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-zinc-500 text-zinc-500" />
              soon
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Section header (shared) ──────────────────────────────────────

function SectionHeader({
  id,
  title,
  meta,
}: {
  id: string;
  title: string;
  meta?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 id={id} className="text-xl font-medium tracking-[-0.015em] text-zinc-100 md:text-2xl">
        {title}
      </h2>
      {meta ? (
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          {meta}
        </p>
      ) : null}
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { SCENES, type Scene } from "@/lib/scenes";
import { Topbar } from "@/components/demo/Topbar";
import { ScenePreview } from "@/components/demo/ScenePreview";
import { Starfield } from "@/components/demo/Starfield";

export const metadata: Metadata = {
  title: "Gravixar Demo: live software I built for clients",
  description:
    "Real, working apps with sample data. Open one and use it. Not slides, not a signup.",
};

// Constellation field is a 16:10 box; the Gravixar core sits at centre and the
// scene nodes orbit it at the corners (% of the box). Conduits are drawn in the
// same coordinate space (viewBox 1600×1000) so they stay locked to the nodes at
// any size. Below lg the field collapses to a plain stacked grid.
const VB_W = 1600;
const VB_H = 1000;
const CORE = { x: 50, y: 52 };

type NodePlacement = { x: number; y: number; w: number; delay: string };

const PLACEMENTS: NodePlacement[] = [
  { x: 23, y: 27, w: 27, delay: "0s" }, // top-left
  { x: 77, y: 27, w: 27, delay: "-1.8s" }, // top-right
  { x: 77, y: 78, w: 27, delay: "-3.6s" }, // bottom-right
  { x: 23, y: 78, w: 27, delay: "-5.4s" }, // bottom-left
];

function toVB(xPct: number, yPct: number): [number, number] {
  return [(xPct / 100) * VB_W, (yPct / 100) * VB_H];
}

function conduitPath(p: NodePlacement): string {
  const [x1, y1] = toVB(CORE.x, CORE.y);
  const [x2, y2] = toVB(p.x, p.y);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  // Bow the control point perpendicular to the line for an organic arc.
  const cx = mx - dy * 0.12;
  const cy = my + dx * 0.12;
  return `M ${x1.toFixed(0)} ${y1.toFixed(0)} Q ${cx.toFixed(0)} ${cy.toFixed(0)} ${x2.toFixed(0)} ${y2.toFixed(0)}`;
}

export default function SceneIndex() {
  const live = SCENES.filter((s) => s.status === "live");
  const upcoming = SCENES.find((s) => s.status === "coming-online");
  const nodes: (NodePlacement & { scene: Scene; index: number })[] = [];
  live.slice(0, 4).forEach((scene, i) => {
    const p = PLACEMENTS[i];
    if (p) nodes.push({ scene, ...p, index: i + 1 });
  });

  return (
    <div className="bg-cosmos relative min-h-[calc(100dvh-40px)] overflow-hidden">
      <Topbar home />
      <Starfield />
      <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-[0.10]" />
      <div className="cosmos-vignette pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-14 md:px-10 lg:px-12 lg:pt-16">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <header className="gallery-rise relative z-10 max-w-2xl">
          <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--color-scene-1,#FF6B6B)]">
            <span className="h-px w-10 bg-[var(--color-scene-1,#FF6B6B)]/50" />
            Capability showroom
          </p>
          <h1 className="mt-7 text-[2.6rem] font-medium leading-[0.95] tracking-[-0.045em] text-zinc-50 sm:text-6xl lg:text-7xl">
            Live software
            <br className="hidden sm:block" /> I built for clients.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-zinc-400 lg:text-xl">
            Real, working apps with sample data. Open one and use it —
            <span className="text-zinc-300"> not slides, not a signup.</span>
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {live.length} live scenes
            </span>
            <span className="text-zinc-700">·</span>
            <span>sample data</span>
            <span className="text-zinc-700">·</span>
            <span>resets Sunday</span>
            <span className="text-zinc-700">·</span>
            <span>no sign-in</span>
          </div>
        </header>

        {/* ── Constellation field ───────────────────────────────────
            Desktop: a wired star-map. Mobile: a clean 1/2-col stack. ── */}
        <section className="relative mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-8 lg:block lg:aspect-[16/10]">

          {/* Conduits (desktop only) */}
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="xMidYMid meet"
            className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
            aria-hidden
          >
            <defs>
              <filter id="conduitGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" />
              </filter>
            </defs>
            {nodes.map((n) => {
              const d = conduitPath(n);
              const accent = n.scene.swatches[1];
              return (
                <g key={n.scene.slug}>
                  <path d={d} fill="none" stroke={accent} strokeWidth="3.5" opacity="0.3" filter="url(#conduitGlow)" />
                  <path d={d} fill="none" stroke={accent} strokeWidth="1" opacity="0.4" />
                  <path
                    d={d}
                    fill="none"
                    stroke={accent}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeDasharray="6 14"
                    opacity="0.95"
                    className="conduit-flow"
                  />
                </g>
              );
            })}
          </svg>

          {/* Core (desktop only) */}
          <div
            className="absolute left-1/2 top-[52%] z-10 hidden -translate-x-1/2 -translate-y-1/2 flex-col items-center lg:flex"
            aria-hidden
          >
            <div className="relative">
              <div
                className="core-pulse absolute -inset-9 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(255,45,90,0.5) 0%, transparent 70%)" }}
              />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-black/60 shadow-[0_0_44px_-6px_rgba(255,45,90,0.7)] backdrop-blur">
                <Image src="/brand/gravixar-avatar.png" alt="" width={48} height={48} className="rounded-full" />
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-300">
                Gravixar core
              </p>
              <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">
                showroom data exchange
              </p>
            </div>
          </div>

          {/* Scene nodes */}
          {nodes.map((n) => {
            const accent = n.scene.swatches[1];
            return (
              <Link
                key={n.scene.slug}
                href={`/${n.scene.slug}`}
                className="group gallery-rise relative z-20 block lg:absolute lg:w-[var(--nw)] lg:left-[var(--nx)] lg:top-[var(--ny)] lg:-translate-x-1/2 lg:-translate-y-1/2"
                style={
                  {
                    "--nx": `${n.x}%`,
                    "--ny": `${n.y}%`,
                    "--nw": `${n.w}%`,
                    animationDelay: `${n.index * 70}ms`,
                  } as CSSProperties
                }
              >
                <div className="node-float" style={{ animationDelay: n.delay }}>
                  <div className="relative">
                    {/* accent halo */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -inset-5 rounded-[1.75rem] opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-80"
                      style={{ background: `radial-gradient(circle, ${accent}55 0%, transparent 70%)` }}
                    />
                    <div className="relative transition-transform duration-500 ease-out group-hover:scale-[1.03]">
                      <ScenePreview scene={n.scene} sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw" />
                    </div>
                  </div>

                  <div className="mt-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
                        <span style={{ color: accent }}>●</span> node {n.index}
                      </span>
                      <span
                        aria-hidden
                        className="text-xs opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                        style={{ color: accent }}
                      >
                        →
                      </span>
                    </div>
                    <h2 className="mt-1.5 text-lg font-medium tracking-[-0.01em] text-zinc-50">
                      {n.scene.name}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">{n.scene.whatItIs}</p>
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-600">
                      for {n.scene.personaLabel}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

        {/* ── Coming online ─────────────────────────────────────── */}
        {upcoming ? (
          <div className="relative z-10 mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-6 lg:mt-12">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                next
              </span>
              <h2 className="text-base font-medium text-zinc-300">{upcoming.name}</h2>
              <span className="text-sm text-zinc-500">{upcoming.whatItIs}</span>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-600" />
              coming online
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

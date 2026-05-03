// Lattice persona-pick. Visitor lands here from the gallery, picks who
// they want to log in as, drops into that role's landing.

import Link from "next/link";
import { LATTICE_PERSONAS } from "@/lib/personas/lattice";
import { GlassPanel } from "@/components/demo/GlassPanel";

export default function LatticePersonaPick() {
  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:px-10 md:pt-24 lg:px-16">
      {/* Editorial header */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-scene-1)]">
            scene 01, operations infrastructure
          </p>
          <h1 className="mt-5 font-display-serif text-5xl font-light leading-[0.95] tracking-tight md:text-7xl lg:text-[80px]">
            Lattice Studio
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300">
            A creative studio runs its delivery, scope, and review on this
            portal. Pick a role and step into it, every persona sees the
            same data, filtered to what they&apos;re allowed to touch.
          </p>
        </div>
        <div className="lg:col-span-5 lg:pt-6">
          <GlassPanel className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              what this scene shows
            </p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              <li className="flex gap-2">
                <span className="text-[var(--color-scene-1)]">→</span>
                <span>Full delivery flow: inquiry → scope → activation → review → ship</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--color-scene-1)]">→</span>
                <span>6-state task review machine with role-aware actions</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--color-scene-1)]">→</span>
                <span>Compliance-grade audit log with safe-restore</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--color-scene-1)]">→</span>
                <span>AI intake wizard generating brand briefs from a URL</span>
              </li>
            </ul>
          </GlassPanel>
        </div>
      </div>

      {/* Persona cards */}
      <div className="mt-16">
        <h2 className="font-display-serif text-2xl font-light tracking-tight md:text-3xl">
          Pick who you are.
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {LATTICE_PERSONAS.map((p, i) => (
            <form
              key={p.id}
              action={`/api/persona/${p.id}`}
              method="POST"
              className="contents"
            >
              <input type="hidden" name="redirect" value={p.landing} />
              <button
                type="submit"
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[var(--color-scene-1)]/60 hover:bg-white/[0.07]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-scene-1)] to-[var(--color-scene-2)] font-mono text-xs font-medium text-[#0a1230]">
                    {p.initials}
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-5 font-display-serif text-xl font-light tracking-tight text-zinc-50">
                  {p.name}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--color-scene-1)]">
                  {p.title}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-zinc-400">{p.blurb}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-300 group-hover:text-white">
                  log in as {p.name.split(" ")[0]?.toLowerCase()}
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </button>
            </form>
          ))}
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          no password needed · cookie-only session · cleared on reset
        </p>
      </div>

      <div className="mt-16 border-t border-white/5 pt-8">
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-200"
        >
          ← back to gallery
        </Link>
      </div>
    </div>
  );
}

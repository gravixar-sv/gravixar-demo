// Lattice client dashboard — Mira Voss's view. Placeholder data; real
// queries land after Postgres is provisioned.

import { redirect } from "next/navigation";
import { findLatticePersona } from "@/lib/personas/lattice";
import { getActivePersonaId } from "@/lib/demo/session";
import { GlassPanel } from "@/components/demo/GlassPanel";
import { WindowDots } from "@/components/demo/WindowChrome";

export default async function LatticeDashboard() {
  const personaId = await getActivePersonaId();
  const persona = personaId ? findLatticePersona(personaId) : null;

  // Demo gate — if no persona, send back to the picker
  if (!persona) redirect("/lattice");

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-12 md:px-10 lg:px-16">
      {/* Greeting header */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-scene-1)]">
            {persona.role} dashboard
          </p>
          <h1 className="mt-4 font-display-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
            Welcome back, {persona.name.split(" ")[0]}.
          </h1>
          <p className="mt-4 max-w-xl text-zinc-400">
            Two deliverables waiting on your review. One open question on the
            brand brief. PM Kai is online.
          </p>
        </div>
        <div className="lg:col-span-5 lg:pt-6">
          <GlassPanel withChrome className="px-5 pb-5">
            <div className="flex items-center gap-3 pb-3">
              <WindowDots />
              <span className="ml-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                quick actions
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-zinc-200 hover:border-[var(--color-scene-1)]/60">
                Open project<br />
                <span className="font-mono text-[10px] text-zinc-500">brand-refresh-q2</span>
              </button>
              <button className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-zinc-200 hover:border-[var(--color-scene-1)]/60">
                Message Kai<br />
                <span className="font-mono text-[10px] text-zinc-500">last seen 2m ago</span>
              </button>
              <button className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-zinc-200 hover:border-[var(--color-scene-1)]/60">
                Review queue<br />
                <span className="font-mono text-[10px] text-zinc-500">2 pending</span>
              </button>
              <button className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-zinc-200 hover:border-[var(--color-scene-1)]/60">
                Files<br />
                <span className="font-mono text-[10px] text-zinc-500">14 shared</span>
              </button>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Project cards */}
      <div className="mt-16">
        <h2 className="mb-6 font-display-serif text-2xl font-light tracking-tight">
          Your projects
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ProjectCard
            name="Brand refresh — Q2"
            status="In review"
            statusTone="active"
            next="2 deliverables awaiting your review"
            updated="updated 14 min ago"
          />
          <ProjectCard
            name="Reel series — May launch"
            status="Active"
            statusTone="default"
            next="Storyboard locked, animation in progress"
            updated="updated 2 hours ago"
          />
          <ProjectCard
            name="LinkedIn sprint"
            status="Shipped"
            statusTone="muted"
            next="6 posts live, last published yesterday"
            updated="completed Mon"
          />
        </div>
      </div>

      <p className="mt-12 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
        ⚠ placeholder data — wired to live db after neon provisioning
      </p>
    </div>
  );
}

function ProjectCard({
  name,
  status,
  statusTone,
  next,
  updated,
}: {
  name: string;
  status: string;
  statusTone: "active" | "default" | "muted";
  next: string;
  updated: string;
}) {
  const tone =
    statusTone === "active"
      ? "text-[var(--color-scene-1)] border-[var(--color-scene-1)]/40"
      : statusTone === "muted"
        ? "text-zinc-500 border-zinc-700"
        : "text-zinc-200 border-zinc-600";
  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[var(--color-scene-1)]/40">
      <div className="flex items-start justify-between">
        <h3 className="font-display-serif text-xl font-light leading-tight tracking-tight">
          {name}
        </h3>
        <span
          className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${tone}`}
        >
          {status}
        </span>
      </div>
      <p className="mt-4 text-sm text-zinc-400">{next}</p>
      <p className="mt-5 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
        {updated}
      </p>
    </div>
  );
}

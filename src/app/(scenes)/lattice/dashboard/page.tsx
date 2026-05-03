// Mira's client dashboard — real data from Postgres.

import { redirect } from "next/navigation";
import { findLatticePersona } from "@/lib/personas/lattice";
import { getActivePersonaId } from "@/lib/demo/session";
import {
  getClientProjects,
  getPendingReviewTasks,
  projectStatusTone,
} from "@/lib/queries/lattice";
import { GlassPanel } from "@/components/demo/GlassPanel";
import { WindowDots } from "@/components/demo/WindowChrome";

export const dynamic = "force-dynamic";

export default async function LatticeDashboard() {
  const personaId = await getActivePersonaId();
  const persona = personaId ? findLatticePersona(personaId) : null;
  if (!persona) redirect("/lattice");

  const [projects, pendingReview] = await Promise.all([
    getClientProjects(persona.id),
    getPendingReviewTasks(persona.id),
  ]);

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
            {pendingReview.length > 0 ? (
              <>
                {pendingReview.length} deliverable{pendingReview.length === 1 ? "" : "s"} waiting on your review.
              </>
            ) : (
              <>You&apos;re all caught up. Nothing waiting on your review.</>
            )}
          </p>
        </div>
        <div className="lg:col-span-5 lg:pt-6">
          <GlassPanel className="px-5 pb-5">
            <div className="flex items-center gap-3 pb-3">
              <WindowDots />
              <span className="ml-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                quick stats
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-y-3 text-xs">
              <Stat k="projects" v={String(projects.length)} />
              <Stat k="awaiting review" v={String(pendingReview.length)} accent />
              <Stat
                k="active"
                v={String(projects.filter((p) => p.status === "ACTIVE" || p.status === "IN_REVIEW").length)}
              />
              <Stat k="shipped" v={String(projects.filter((p) => p.status === "SHIPPED").length)} />
            </dl>
          </GlassPanel>
        </div>
      </div>

      {/* Pending review */}
      {pendingReview.length > 0 ? (
        <div className="mt-12">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-scene-1)]">
            awaiting your review
          </h2>
          <ul className="mt-4 divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
            {pendingReview.map((task) => (
              <li key={task.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-sm text-zinc-100">{task.title}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    updated {timeAgo(task.updatedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/10 px-3 py-1.5 text-xs text-[var(--color-scene-1)] hover:bg-[var(--color-scene-1)]/20"
                >
                  review →
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Project cards */}
      <div className="mt-16">
        <h2 className="mb-6 font-display-serif text-2xl font-light tracking-tight">
          Your projects
        </h2>
        {projects.length === 0 ? (
          <p className="text-zinc-500">No projects yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                name={p.name}
                status={p.status}
                statusTone={projectStatusTone(p.status)}
                pendingReviewCount={p.pendingReviewCount}
                lastActivityAt={p.lastActivityAt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  k,
  v,
  accent = false,
}: {
  k: string;
  v: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] uppercase tracking-widest text-zinc-500">{k}</dt>
      <dd
        className={`mt-1 text-2xl font-light tracking-tight ${
          accent ? "text-[var(--color-scene-1)]" : "text-zinc-100"
        }`}
      >
        {v}
      </dd>
    </div>
  );
}

function ProjectCard({
  name,
  status,
  statusTone,
  pendingReviewCount,
  lastActivityAt,
}: {
  name: string;
  status: string;
  statusTone: "active" | "default" | "muted";
  pendingReviewCount: number;
  lastActivityAt: Date;
}) {
  const tone =
    statusTone === "active"
      ? "text-[var(--color-scene-1)] border-[var(--color-scene-1)]/40"
      : statusTone === "muted"
        ? "text-zinc-500 border-zinc-700"
        : "text-zinc-200 border-zinc-600";
  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[var(--color-scene-1)]/40">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display-serif text-xl font-light leading-tight tracking-tight">
          {name}
        </h3>
        <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${tone}`}>
          {status.replace("_", " ").toLowerCase()}
        </span>
      </div>
      <p className="mt-4 text-sm text-zinc-400">
        {pendingReviewCount > 0
          ? `${pendingReviewCount} deliverable${pendingReviewCount === 1 ? "" : "s"} awaiting your review`
          : "All deliverables addressed"}
      </p>
      <p className="mt-5 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
        updated {timeAgo(lastActivityAt)}
      </p>
    </div>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

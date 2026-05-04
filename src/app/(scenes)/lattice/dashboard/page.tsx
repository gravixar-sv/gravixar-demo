// Mira's client dashboard, real data + functional review buttons.

import { redirect } from "next/navigation";
import { findLatticePersona } from "@/lib/personas/lattice";
import { getActivePersonaId } from "@/lib/demo/session";
import {
  getClientProjects,
  getPendingReviewTasks,
  projectStatusTone,
} from "@/lib/queries/lattice";
import { approveTaskAction, requestRevisionAction } from "@/lib/actions/lattice";
import { GlassPanel } from "@/components/demo/GlassPanel";
import { WindowDots } from "@/components/demo/WindowChrome";
import { TryNext } from "@/components/demo/TryNext";

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
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-scene-1)]">
            {persona.role} dashboard
          </p>
          <h1 className="mt-4 font-display-serif text-4xl font-medium leading-tight tracking-tight md:text-6xl">
            Welcome back, {persona.name.split(" ")[0]}.
          </h1>
          <p className="mt-4 max-w-xl text-zinc-400">
            {pendingReview.length > 0
              ? `${pendingReview.length} deliverable${pendingReview.length === 1 ? "" : "s"} waiting on your review.`
              : "You're all caught up. Nothing waiting on your review."}
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

      <div className="mt-10">
        <TryNext>
          {pendingReview.length > 0 ? (
            <>
              Approve a deliverable, or click <em>request revision</em> to
              loop it back to the designer. Then sign in as <strong>Nox</strong> from
              the gallery to see your action in the audit log. Use <em>↻ reset scene</em>{" "}
              in the topbar to try the loop again.
            </>
          ) : (
            <>
              All caught up — meaning Sage hasn&apos;t submitted anything new yet.
              Sign in as <strong>Sage</strong> from the gallery, submit a draft for
              client, then come back here. Use <em>↻ reset scene</em> in the topbar
              if you want a fresh seed.
            </>
          )}
        </TryNext>
      </div>

      {pendingReview.length > 0 ? (
        <div className="mt-10">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
            awaiting your review
          </h2>
          <ul className="mt-4 divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
            {pendingReview.map((task) => (
              <li key={task.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-zinc-100">{task.title}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {task.project.name} · updated {timeAgo(task.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-shrink-0 gap-2">
                  <form action={requestRevisionAction}>
                    <input type="hidden" name="taskId" value={task.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-white/10 bg-transparent px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-white/30"
                    >
                      request revision
                    </button>
                  </form>
                  <form action={approveTaskAction}>
                    <input type="hidden" name="taskId" value={task.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/15 px-3 py-1.5 text-xs text-[var(--color-scene-1)] transition-colors hover:bg-[var(--color-scene-1)]/25"
                    >
                      approve →
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-16">
        <h2 className="mb-6 font-display-serif text-2xl font-medium tracking-tight">
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

function Stat({ k, v, accent = false }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] uppercase tracking-widest text-zinc-500">{k}</dt>
      <dd
        className={`mt-1 text-2xl font-medium tracking-tight ${
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
        <h3 className="font-display-serif text-xl font-medium leading-tight tracking-tight">
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

// Sage's designer task list, real data, with submit-for-client action
// on draft tasks.

import { redirect } from "next/navigation";
import { findLatticePersona } from "@/lib/personas/lattice";
import { getActivePersonaId } from "@/lib/demo/session";
import { getDesignerTasks, reviewStateTone } from "@/lib/queries/lattice";
import { submitForClientAction } from "@/lib/actions/lattice";
import { TryNext } from "@/components/demo/TryNext";

export const dynamic = "force-dynamic";

export default async function LatticeTasks() {
  const personaId = await getActivePersonaId();
  const persona = personaId ? findLatticePersona(personaId) : null;
  if (!persona) redirect("/lattice");

  const tasks = await getDesignerTasks(persona.id);

  // Group by project for editorial layout
  const byProject = new Map<string, { name: string; tasks: typeof tasks }>();
  for (const t of tasks) {
    const cur = byProject.get(t.project.id) ?? { name: t.project.name, tasks: [] };
    cur.tasks.push(t);
    byProject.set(t.project.id, cur);
  }
  const groups = Array.from(byProject.values());

  const draftCount = tasks.filter((t) => t.reviewState === "DRAFT").length;
  const readyCount = tasks.filter((t) => t.reviewState === "INTERNAL_APPROVED").length;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-12 md:px-10 lg:px-16">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-scene-1)]">
        designer tasks
      </p>
      <h1 className="mt-4 font-display-serif text-4xl font-medium tracking-tight md:text-5xl">
        Hi {persona.name.split(" ")[0]}, {tasks.length} task{tasks.length === 1 ? "" : "s"} on your plate.
      </h1>
      <p className="mt-4 max-w-2xl text-zinc-400">
        {draftCount} in draft · {readyCount} ready to ship to client review.
      </p>

      <div className="mt-10">
        <TryNext>
          {draftCount > 0 ? (
            <>
              Click <em>submit for client</em> on a DRAFT task to advance it
              to SUBMITTED_FOR_CLIENT. Then sign in as <strong>Mira</strong> from
              the gallery to approve or request revision. <em>↻ reset scene</em>{" "}
              gives you a fresh batch of drafts.
            </>
          ) : (
            <>
              No drafts to submit right now — Mira already responded to
              everything. Use <em>↻ reset scene</em> in the topbar to get a
              fresh batch.
            </>
          )}
        </TryNext>
      </div>

      <div className="mt-10 space-y-10">
        {groups.length === 0 ? (
          <p className="text-zinc-500">No tasks assigned.</p>
        ) : (
          groups.map((group, i) => (
            <section key={`${group.name}-${i}`}>
              <h2 className="font-display-serif text-2xl font-medium tracking-tight">
                {group.name}
              </h2>
              <ul className="mt-4 divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
                {group.tasks.map((t) => {
                  const tone = reviewStateTone(t.reviewState);
                  return (
                    <li
                      key={t.id}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm text-zinc-100">{t.title}</p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                          {tone.label}
                        </p>
                      </div>
                      {t.reviewState === "DRAFT" ? (
                        <form action={submitForClientAction}>
                          <input type="hidden" name="taskId" value={t.id} />
                          <button
                            type="submit"
                            className="rounded-md border border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/15 px-3 py-1.5 text-xs text-[var(--color-scene-1)] hover:bg-[var(--color-scene-1)]/25"
                          >
                            submit for client →
                          </button>
                        </form>
                      ) : (
                        <span
                          className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
                            tone.tone === "active"
                              ? "border-[var(--color-scene-1)]/40 text-[var(--color-scene-1)]"
                              : tone.tone === "muted"
                                ? "border-zinc-700 text-zinc-500"
                                : "border-zinc-600 text-zinc-300"
                          }`}
                        >
                          {tone.label.toLowerCase()}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

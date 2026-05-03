// Kai's PM inbox — real inquiries from the DB.

import { redirect } from "next/navigation";
import { findLatticePersona } from "@/lib/personas/lattice";
import { getActivePersonaId } from "@/lib/demo/session";
import { getPmInquiries, getPmActiveProjects } from "@/lib/queries/lattice";
import { GlassPanel } from "@/components/demo/GlassPanel";
import { WindowDots } from "@/components/demo/WindowChrome";

export const dynamic = "force-dynamic";

export default async function LatticeInbox() {
  const personaId = await getActivePersonaId();
  const persona = personaId ? findLatticePersona(personaId) : null;
  if (!persona) redirect("/lattice");

  const [inquiries, activeProjects] = await Promise.all([
    getPmInquiries(persona.id),
    getPmActiveProjects(persona.id),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-12 md:px-10 lg:px-16">
      {/* Header */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-scene-1)]">
            pm inbox
          </p>
          <h1 className="mt-4 font-display-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
            Hi {persona.name.split(" ")[0]} — {inquiries.length} inquir{inquiries.length === 1 ? "y" : "ies"}.
          </h1>
          <p className="mt-4 max-w-xl text-zinc-400">
            {activeProjects.length} project{activeProjects.length === 1 ? "" : "s"} in flight,{" "}
            {inquiries.filter((i) => i.status === "PM_ASSIGNED").length} waiting for your first reply.
          </p>
        </div>
        <div className="lg:col-span-5 lg:pt-6">
          <GlassPanel className="px-5 pb-5">
            <div className="flex items-center gap-3 pb-3">
              <WindowDots />
              <span className="ml-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                today
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-y-3 text-xs">
              <Stat k="inquiries" v={String(inquiries.length)} />
              <Stat k="awaiting reply" v={String(inquiries.filter((i) => i.status === "PM_ASSIGNED").length)} accent />
              <Stat k="active projects" v={String(activeProjects.length)} />
              <Stat k="in review" v={String(activeProjects.filter((p) => p.status === "IN_REVIEW").length)} />
            </dl>
          </GlassPanel>
        </div>
      </div>

      {/* Inquiries */}
      <div className="mt-14">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-scene-1)]">
          inquiries
        </h2>
        {inquiries.length === 0 ? (
          <p className="mt-4 text-zinc-500">No inquiries — inbox zero.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
            {inquiries.map((iq) => {
              const lastMessage = iq.messages[0];
              const clientName = iq.client.user.name;
              return (
                <li key={iq.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-3">
                      <p className="text-sm font-medium text-zinc-100">{clientName}</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{iq.client.company}</p>
                    </div>
                    <p className="mt-1 text-sm text-zinc-300">{iq.summary}</p>
                    {lastMessage ? (
                      <p className="mt-2 truncate text-xs text-zinc-500">
                        &ldquo;{lastMessage.body}&rdquo;
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="rounded-full border border-[var(--color-scene-1)]/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-[var(--color-scene-1)]">
                      {iq.status.replace("_", " ").toLowerCase()}
                    </span>
                    <p className="font-mono text-[10px] text-zinc-600">{iq._count.messages} msg</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Active projects */}
      <div className="mt-12">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-scene-1)]">
          your active projects
        </h2>
        {activeProjects.length === 0 ? (
          <p className="mt-4 text-zinc-500">No active projects assigned to you.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  {p.client.company}
                </p>
                <h3 className="mt-2 font-display-serif text-lg font-light tracking-tight">
                  {p.name}
                </h3>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                  {p._count.tasks} task{p._count.tasks === 1 ? "" : "s"} · {p.status.replace("_", " ").toLowerCase()}
                </p>
              </div>
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

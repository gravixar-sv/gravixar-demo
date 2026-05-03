// Nox's admin console, multi-section view of studio operations.
// Audit log, team status today, leave requests, finance snapshot.

import { redirect } from "next/navigation";
import { findLatticePersona } from "@/lib/personas/lattice";
import { getActivePersonaId } from "@/lib/demo/session";
import {
  dailyStatusTone,
  formatMoney,
  getAuditLogRecent,
  getFinanceSummary,
  getLeaveRequests,
  getTeamStatusToday,
  leaveStatusTone,
  shortDate,
} from "@/lib/queries/lattice";
import { approveLeaveAction, rejectLeaveAction } from "@/lib/actions/lattice";
import { GlassPanel } from "@/components/demo/GlassPanel";
import { WindowDots } from "@/components/demo/WindowChrome";

export const dynamic = "force-dynamic";

export default async function LatticeAdmin() {
  const personaId = await getActivePersonaId();
  const persona = personaId ? findLatticePersona(personaId) : null;
  if (!persona) redirect("/lattice");

  const [audit, team, leave, finance] = await Promise.all([
    getAuditLogRecent(8),
    getTeamStatusToday(),
    getLeaveRequests(),
    getFinanceSummary(),
  ]);

  const pendingLeave = leave.filter((l) => l.status === "PENDING");

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-12 md:px-10 lg:px-16">
      {/* Header */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-scene-1)]">
            admin console
          </p>
          <h1 className="mt-4 font-display-serif text-4xl font-light leading-tight tracking-tight md:text-6xl">
            Studio operations.
          </h1>
          <p className="mt-4 max-w-xl text-zinc-400">
            Audit trail, who&apos;s where today, leave waiting on approval, finance running.
            Everything Nox needs to keep the studio honest.
          </p>
        </div>
        <div className="lg:col-span-5 lg:pt-6">
          <GlassPanel className="px-5 pb-5">
            <div className="flex items-center gap-3 pb-3">
              <WindowDots />
              <span className="ml-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                this week
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-y-3 text-xs">
              <Stat k="audit events" v={String(audit.length)} />
              <Stat k="leave pending" v={String(pendingLeave.length)} accent={pendingLeave.length > 0} />
              <Stat k="team online" v={String(team.length)} />
              <Stat k="spend (30d)" v={formatMoney(finance.total30d)} />
            </dl>
          </GlassPanel>
        </div>
      </div>

      {/* Section: Team status today */}
      <Section title="Team status, today" subtitle="who's where">
        {team.length === 0 ? (
          <Empty>No check-ins yet.</Empty>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {team.map((row) => {
              const t = dailyStatusTone(row.status);
              const ringTone =
                t.tone === "good"
                  ? "border-emerald-400/40 text-emerald-300"
                  : t.tone === "warn"
                    ? "border-amber-400/40 text-amber-300"
                    : "border-zinc-700 text-zinc-500";
              return (
                <li
                  key={row.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md"
                >
                  <div>
                    <p className="text-sm text-zinc-100">{row.user.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                      {row.user.role.toLowerCase()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${ringTone}`}
                  >
                    {t.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* Section: Leave requests */}
      <Section title="Leave management" subtitle="pending + recent">
        {leave.length === 0 ? (
          <Empty>No leave requests.</Empty>
        ) : (
          <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
            {leave.map((l) => {
              const tone = leaveStatusTone(l.status);
              const toneCls =
                tone === "active"
                  ? "border-[var(--color-scene-1)]/40 text-[var(--color-scene-1)]"
                  : tone === "muted"
                    ? "border-zinc-700 text-zinc-500"
                    : "border-emerald-400/40 text-emerald-300";
              return (
                <li
                  key={l.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm text-zinc-100">
                      <span className="font-medium">{l.user.name}</span>{" "}
                      <span className="text-zinc-500">·</span> {l.type.toLowerCase()}{" "}
                      <span className="text-zinc-500">·</span> {shortDate(l.startDate)} – {shortDate(l.endDate)}
                    </p>
                    {l.reason ? (
                      <p className="mt-1 text-xs text-zinc-500">&ldquo;{l.reason}&rdquo;</p>
                    ) : null}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {l.status === "PENDING" ? (
                      <>
                        <form action={rejectLeaveAction}>
                          <input type="hidden" name="requestId" value={l.id} />
                          <button
                            type="submit"
                            className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:border-white/30"
                          >
                            reject
                          </button>
                        </form>
                        <form action={approveLeaveAction}>
                          <input type="hidden" name="requestId" value={l.id} />
                          <button
                            type="submit"
                            className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-400/20"
                          >
                            approve →
                          </button>
                        </form>
                      </>
                    ) : (
                      <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${toneCls}`}>
                        {l.status.toLowerCase()}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* Section: Finance */}
      <Section title="Finance snapshot" subtitle="last 30 days">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              total spend
            </p>
            <p className="mt-2 font-display-serif text-4xl font-light tracking-tight text-zinc-100">
              {formatMoney(finance.total30d)}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              across {finance.byCategory.reduce((a, c) => a + c.count, 0)} transactions
            </p>
            <ul className="mt-5 space-y-2 text-xs">
              {finance.byCategory.map((c) => {
                const pct = finance.total30d > 0 ? (c.total / finance.total30d) * 100 : 0;
                return (
                  <li key={c.category} className="space-y-1">
                    <div className="flex items-baseline justify-between text-zinc-300">
                      <span className="font-mono text-[10px] uppercase tracking-widest">
                        {c.category.toLowerCase()}
                      </span>
                      <span>{formatMoney(c.total)}</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded bg-white/5">
                      <div
                        className="h-full bg-[var(--color-scene-1)]/70"
                        style={{ width: `${pct.toFixed(1)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              recent transactions
            </p>
            {finance.recent.length === 0 ? (
              <Empty>No expenses recorded.</Empty>
            ) : (
              <ul className="mt-3 divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
                {finance.recent.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-100">{e.vendor}</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                        {e.category.toLowerCase()} · {shortDate(e.paidAt)}
                      </p>
                    </div>
                    <span className="font-mono text-sm text-zinc-200">
                      {formatMoney(Number(e.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>

      {/* Section: Audit log */}
      <Section title="Activity log" subtitle="last 8 events">
        {audit.length === 0 ? (
          <Empty>No activity yet.</Empty>
        ) : (
          <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
            {audit.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-200">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                      {row.action}
                    </span>{" "}
                    <span className="text-zinc-100">{row.table}</span>
                    {row.note ? <span className="text-zinc-400">, {row.note}</span> : null}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {row.actor?.name ?? "system"} · {timeAgo(row.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Section: Internal controls (placeholder card, managed elsewhere) */}
      <Section title="Internal controls" subtitle="permissions & policies">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400 backdrop-blur-md">
          <p>
            Role hierarchy, per-feature permission flags, and audit-restore allowlist are
            managed via the platform CLI rather than the UI, the principle is &ldquo;safe
            defaults, opt-in surface area.&rdquo;
          </p>
          <ul className="mt-4 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <Pill k="roles" v="4 active" />
            <Pill k="permissions" v="14 flagged" />
            <Pill k="restore allowlist" v="6 fields" />
            <Pill k="security watch" v="last run 6h ago" />
          </ul>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display-serif text-2xl font-light tracking-tight md:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
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

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-sm text-zinc-500">
      {children}
    </div>
  );
}

function Pill({ k, v }: { k: string; v: string }) {
  return (
    <li className="rounded-md border border-white/10 bg-white/[0.04] p-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{k}</p>
      <p className="mt-1 text-zinc-100">{v}</p>
    </li>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

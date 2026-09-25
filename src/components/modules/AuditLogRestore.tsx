// Audit log + safe restore. The visitor edits a project record, saves,
// and sees each changed field land as an UPDATE row with its before and
// after. Restore puts a field back, and the restore is itself a new row
// ("restore of #N"): every change is on record, even the corrections.
// Only allowlisted fields are restorable; nothing touches a database.

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { withViewTransition } from "@/lib/viewTransition";
import { WidgetFrame, WidgetHeading, timeAgo } from "@/components/modules/WidgetFrame";

type AuditRow = {
  id: number;
  field: Field;
  before: string;
  after: string;
  actor: string;
  at: Date;
  /** A restore that comes from the audit log itself is also a row. */
  restoredFrom?: number;
};

const ALLOWLIST = ["name", "tagline"] as const;
type Field = (typeof ALLOWLIST)[number];

const SEED: Record<Field, string> = {
  name: "Spring campaign · Lattice",
  tagline: "Outdoor + retargeting set, 6 deliverables",
};

const LABEL: Record<Field, string> = { name: "Project name", tagline: "Tagline" };

const ACTOR = "Rhea (admin)";

export function AuditLogRestore() {
  const [project, setProject] = useState({ ...SEED });
  const [draft, setDraft] = useState({ ...SEED });
  const [audit, setAudit] = useState<AuditRow[]>([]);
  /** Field that just changed by restore, so its input flashes. */
  const [flash, setFlash] = useState<{ field: Field; n: number } | null>(null);

  const dirty = ALLOWLIST.some((f) => draft[f] !== project[f]);
  const lastId = audit[0]?.id ?? 0;

  function save() {
    let id = lastId;
    const rows: AuditRow[] = [];
    for (const field of ALLOWLIST) {
      if (draft[field] === project[field]) continue;
      id += 1;
      rows.push({ id, field, before: project[field], after: draft[field], actor: ACTOR, at: new Date() });
    }
    if (rows.length === 0) return;
    withViewTransition(() => {
      setAudit((a) => [...rows.reverse(), ...a]);
      setProject({ ...draft });
    });
  }

  function restore(row: AuditRow) {
    const restoreRow: AuditRow = {
      id: lastId + 1,
      field: row.field,
      before: project[row.field],
      after: row.before,
      actor: ACTOR,
      at: new Date(),
      restoredFrom: row.id,
    };
    withViewTransition(() => {
      setAudit((a) => [restoreRow, ...a]);
      setProject((p) => ({ ...p, [row.field]: row.before }));
      setDraft((d) => ({ ...d, [row.field]: row.before }));
      setFlash((f) => ({ field: row.field, n: (f?.n ?? 0) + 1 }));
    });
  }

  function resetAll() {
    setProject({ ...SEED });
    setDraft({ ...SEED });
    setAudit([]);
    setFlash(null);
  }

  return (
    <div className="space-y-6">
      <WidgetFrame
        crumb="Project record"
        toolbar={
          <Button
            variant="ghost"
            size="sm"
            icon="↻"
            onClick={resetAll}
            disabled={audit.length === 0 && !dirty}
            className="font-mono uppercase tracking-[0.08em]"
          >
            Reset
          </Button>
        }
      >
        <p className="label-mono">Project record</p>
        <p className="heading mt-2 text-xl text-ink-50 md:text-2xl">Edit a field, save, then restore it.</p>

        <div className="mt-6 grid gap-4">
          {ALLOWLIST.map((f) => {
            const edits = audit.filter((r) => r.field === f).length;
            const changed = draft[f] !== project[f];
            return (
              <label key={f} className="block">
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-medium text-ink-200">{LABEL[f]}</span>
                  <span className="flex items-center gap-2">
                    {changed ? <span className="chip chip-caution">unsaved</span> : null}
                    {edits > 0 ? (
                      <span key={edits} className="chip chip-mono pop-in">
                        {edits} {edits === 1 ? "change" : "changes"} on record
                      </span>
                    ) : null}
                  </span>
                </span>
                <input
                  key={flash?.field === f ? `flash-${flash.n}` : "steady"}
                  type="text"
                  value={draft[f]}
                  onChange={(e) => setDraft((d) => ({ ...d, [f]: e.target.value }))}
                  className={cn(
                    "mt-2 min-h-11 w-full rounded-xl border border-line-strong bg-ink-950/60 px-3.5 py-2.5 text-sm text-ink-50 outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-500 focus:border-[color-mix(in_oklab,var(--color-scene-1)_60%,transparent)] focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-scene-1)_14%,transparent)]",
                    flash?.field === f && "pg-fresh",
                  )}
                />
              </label>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-xs text-ink-500">
            Restorable fields: name, tagline. Status enums and money never live on this list.
          </p>
          <div className="flex gap-2">
            {dirty ? (
              <Button variant="ghost" size="sm" onClick={() => setDraft({ ...project })}>
                Discard
              </Button>
            ) : null}
            <Button variant="primary" size="sm" onClick={save} disabled={!dirty}>
              Save changes
            </Button>
          </div>
        </div>
      </WidgetFrame>

      <section aria-labelledby="alr-audit-heading" className="surface rounded-2xl p-5 md:p-6">
        <WidgetHeading id="alr-audit-heading" aside={`${audit.length} ${audit.length === 1 ? "row" : "rows"}, append-only`}>
          Audit log, this session
        </WidgetHeading>
        {audit.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-white/[0.1] px-4 py-6 text-center text-xs leading-relaxed text-ink-500">
            No edits yet. Change a field above and save it.
          </p>
        ) : (
          <ol aria-live="polite" className="mt-5 space-y-2">
            {audit.map((row) => {
              const isRestore = row.restoredFrom !== undefined;
              return (
                <li
                  key={row.id}
                  style={{ viewTransitionName: `alr-${row.id}` }}
                  className="row-land grid gap-3 rounded-xl border border-line px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] text-ink-500">#{row.id}</span>
                      <span className={cn("chip chip-mono", isRestore ? "chip-accent" : "")}>
                        {isRestore ? `RESTORE of #${row.restoredFrom}` : "UPDATE"}
                      </span>
                      <span className="text-[13px] text-ink-300">{LABEL[row.field]}</span>
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
                      <span className="rounded-md bg-rose-400/[0.08] px-2 py-0.5 text-rose-200/90 line-through decoration-rose-300/60">
                        {row.before}
                      </span>
                      <span aria-hidden className="text-ink-500">
                        →
                      </span>
                      <span className="sr-only">became</span>
                      <span className="rounded-md bg-emerald-400/[0.08] px-2 py-0.5 text-emerald-200">{row.after}</span>
                    </p>
                    <p className="mt-1.5 text-xs text-ink-500">
                      <span className="text-ink-300">{row.actor}</span> ·{" "}
                      <time suppressHydrationWarning>{timeAgo(row.at)}</time>
                    </p>
                  </div>
                  {isRestore ? (
                    <span className="chip chip-mono justify-self-start sm:justify-self-end">restored</span>
                  ) : (
                    <Button variant="quiet" size="sm" icon="↺" onClick={() => restore(row)} className="justify-self-start sm:justify-self-end">
                      Restore
                    </Button>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}

"use client";

// Audit log + safe-restore demo. Visitor edits a project's name, sees
// an UPDATE row land in the audit log, then clicks restore to revert.
// Demonstrates the "every change is on record, even the corrections"
// principle without any DB involvement.

import { useState } from "react";

type AuditRow = {
  id: number;
  field: string;
  before: string;
  after: string;
  actor: string;
  at: Date;
  /** A restore that comes from the audit log itself is also an audit row,
   *  flagged so the UI can show "restored from #N". */
  restoredFrom?: number;
};

const ALLOWLIST = ["name", "tagline"] as const;
type Field = (typeof ALLOWLIST)[number];

const SEED = {
  name: "Spring campaign · Lattice",
  tagline: "Outdoor + retargeting set, 6 deliverables",
};

const ACTOR = "Nox (admin)";

export function AuditLogRestore() {
  const [project, setProject] = useState({ ...SEED });
  const [draft, setDraft] = useState({ ...SEED });
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [counter, setCounter] = useState(0);

  const dirty =
    draft.name !== project.name || draft.tagline !== project.tagline;

  function save() {
    const newRows: AuditRow[] = [];
    let nextCounter = counter;
    for (const field of ALLOWLIST) {
      if (draft[field] !== project[field]) {
        nextCounter += 1;
        newRows.push({
          id: nextCounter,
          field,
          before: project[field],
          after: draft[field],
          actor: ACTOR,
          at: new Date(),
        });
      }
    }
    if (newRows.length === 0) return;
    setCounter(nextCounter);
    setAudit((rows) => [...newRows.reverse(), ...rows]);
    setProject({ ...draft });
  }

  function restore(row: AuditRow) {
    setCounter((c) => c + 1);
    const restoreRow: AuditRow = {
      id: counter + 1,
      field: row.field,
      before: project[row.field as Field],
      after: row.before,
      actor: ACTOR,
      at: new Date(),
      restoredFrom: row.id,
    };
    setAudit((rows) => [restoreRow, ...rows]);
    setProject((p) => ({ ...p, [row.field]: row.before }));
    setDraft((d) => ({ ...d, [row.field]: row.before }));
  }

  function resetAll() {
    setProject({ ...SEED });
    setDraft({ ...SEED });
    setAudit([]);
    setCounter(0);
  }

  return (
    <div className="space-y-8">
      {/* Editable record */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              project record
            </p>
            <p className="mt-2 text-base font-medium text-zinc-100">
              Edit a field to see the audit row land below.
            </p>
          </div>
          <button
            type="button"
            onClick={resetAll}
            className="rounded-md border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400 transition-colors hover:border-white/30 hover:text-zinc-200"
          >
            ↻ reset everything
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <Field
            label="name"
            value={draft.name}
            onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
          />
          <Field
            label="tagline"
            value={draft.tagline}
            onChange={(v) => setDraft((d) => ({ ...d, tagline: v }))}
          />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
            allowlist · name, tagline · status enums and money would never live
            here
          </p>
          <button
            type="button"
            onClick={save}
            disabled={!dirty}
            className="rounded-md border border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/15 px-4 py-1.5 text-xs text-[var(--color-scene-1)] transition-colors hover:bg-[var(--color-scene-1)]/25 disabled:opacity-40"
          >
            save changes
          </button>
        </div>
      </div>

      {/* Audit log */}
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
          audit log, this session
        </p>
        {audit.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-sm text-zinc-500">
            No edits yet. Change a field above and click save.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03]">
            {audit.map((row) => {
              const isRestore = row.restoredFrom !== undefined;
              const isAllowlisted = ALLOWLIST.includes(row.field as Field);
              const canRestore = isAllowlisted && !isRestore;
              return (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-200">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        update #{row.id} {isRestore ? `· restore of #${row.restoredFrom}` : ""}
                      </span>
                    </p>
                    <p className="mt-1 truncate text-sm">
                      <span className="text-zinc-500">{row.field}: </span>
                      <span className="text-zinc-400 line-through">
                        {row.before}
                      </span>{" "}
                      <span className="text-zinc-600">→</span>{" "}
                      <span className="text-[var(--color-scene-1)]">
                        {row.after}
                      </span>
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      {row.actor} · {timeAgo(row.at)}
                    </p>
                  </div>
                  {canRestore ? (
                    <button
                      type="button"
                      onClick={() => restore(row)}
                      className="shrink-0 rounded-md border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
                    >
                      ↺ restore
                    </button>
                  ) : (
                    <span className="shrink-0 rounded-sm border border-zinc-700 bg-zinc-900/60 px-2 py-0.5 font-mono text-[9px] text-zinc-500">
                      {isRestore ? "restored" : "not restorable"}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-[var(--color-scene-1)]/60"
      />
    </label>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

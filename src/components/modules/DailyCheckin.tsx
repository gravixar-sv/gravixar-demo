"use client";

// Daily check-in widget. Visitor picks their own status (first row in
// the team grid), watches the team count update. The other 5 rows are
// fixed teammates with random-but-deterministic statuses so the team
// grid feels populated without a DB.

import { useState } from "react";

type Status = "OFFICE" | "WFH" | "FIELD" | null;

const STATUSES: { value: Exclude<Status, null>; label: string; tone: string }[] = [
  { value: "OFFICE", label: "in office", tone: "border-emerald-400/40 text-emerald-300 bg-emerald-400/5" },
  { value: "WFH", label: "wfh", tone: "border-cyan-400/40 text-cyan-300 bg-cyan-400/5" },
  { value: "FIELD", label: "field", tone: "border-amber-400/40 text-amber-300 bg-amber-400/5" },
];

const TEAM = [
  { name: "Mira Voss", role: "client lead", status: "WFH" as Exclude<Status, null> },
  { name: "Kai Render", role: "pm", status: "OFFICE" as Exclude<Status, null> },
  { name: "Nox Bellini", role: "admin", status: "OFFICE" as Exclude<Status, null> },
  { name: "Sage Holloway", role: "designer", status: "FIELD" as Exclude<Status, null> },
  { name: "Olin Park", role: "engineer", status: "WFH" as Exclude<Status, null> },
];

export function DailyCheckin() {
  const [me, setMe] = useState<Status>(null);

  const counts = STATUSES.map((s) => {
    const teamCount = TEAM.filter((t) => t.status === s.value).length;
    const total = teamCount + (me === s.value ? 1 : 0);
    return { ...s, total };
  });

  return (
    <div className="space-y-8">
      {/* Picker */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              your check-in, today
            </p>
            <p className="mt-2 text-base font-medium text-zinc-100">
              Where are you working from?
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              In production this modal auto-prompts on the first portal
              pageview each calendar day. Karachi business-day timezone, not
              UTC, so the prompt fires correctly for PK-based teams.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          {STATUSES.map((s) => {
            const active = me === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setMe(active ? null : s.value)}
                className={`rounded-xl border px-4 py-3 text-left transition-all ${
                  active
                    ? s.tone + " ring-1 ring-current"
                    : "border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/25"
                }`}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em]">
                  {s.value.toLowerCase()}
                </p>
                <p className="mt-1 text-sm">
                  {active ? "you're here today" : s.label}
                </p>
              </button>
            );
          })}
        </div>

        {me ? (
          <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
            <p className="text-xs text-zinc-400">
              Saved. The team view below picks up your status. Modal won&apos;t
              re-prompt until tomorrow.
            </p>
            <button
              type="button"
              onClick={() => setMe(null)}
              className="rounded-md border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400 transition-colors hover:border-white/30 hover:text-zinc-200"
            >
              ↻ reset
            </button>
          </div>
        ) : null}
      </div>

      {/* Team grid */}
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
          team status, today
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {counts.map((s) => (
            <div
              key={s.value}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                {s.value.toLowerCase()}
              </p>
              <p className="mt-1 text-2xl font-medium text-zinc-100">
                {s.total}
              </p>
            </div>
          ))}
        </div>

        <ul className="mt-5 divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03]">
          {/* "You" row, only renders if a status is picked */}
          {me ? (
            <Row name="you" role="visitor" status={me} highlight />
          ) : null}
          {TEAM.map((t) => (
            <Row key={t.name} name={t.name} role={t.role} status={t.status} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function Row({
  name,
  role,
  status,
  highlight = false,
}: {
  name: string;
  role: string;
  status: Exclude<Status, null>;
  highlight?: boolean;
}) {
  const tone = STATUSES.find((s) => s.value === status)!.tone;
  return (
    <li
      className={`flex items-center justify-between gap-3 px-5 py-3 ${
        highlight ? "bg-[var(--color-scene-1)]/[0.04]" : ""
      }`}
    >
      <div>
        <p className="text-sm text-zinc-100">{name}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          {role}
        </p>
      </div>
      <span
        className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] ${tone}`}
      >
        {status.toLowerCase()}
      </span>
    </li>
  );
}

// Daily check-in. The visitor picks where they are working from today
// and their "You" chip slides into that column of the team board (a
// View Transition), with the column counts popping as they change. The
// five teammates are fixed sample data, so the board feels populated
// without a database.

import { useState, type ReactNode } from "react";
import { Avatar, type AvatarHue } from "@/components/demo/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { withViewTransition } from "@/lib/viewTransition";
import { WidgetFrame, WidgetHeading } from "@/components/modules/WidgetFrame";

type Status = "OFFICE" | "WFH" | "FIELD";

const STATUSES: { value: Status; label: string; hint: string; tone: string; dot: string; icon: ReactNode }[] = [
  {
    value: "OFFICE",
    label: "In the office",
    hint: "Desk, meeting rooms, the studio",
    tone: "border-emerald-400/50 bg-emerald-400/[0.08] text-emerald-200",
    dot: "bg-emerald-400",
    icon: (
      <path d="M4 20V6l8-3 8 3v14M9 20v-4h6v4M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01" />
    ),
  },
  {
    value: "WFH",
    label: "Working from home",
    hint: "Online, on Slack, on calls",
    tone: "border-sky-400/50 bg-sky-400/[0.08] text-sky-200",
    dot: "bg-sky-400",
    icon: <path d="M4 11l8-7 8 7v9H4zM10 20v-5h4v5" />,
  },
  {
    value: "FIELD",
    label: "In the field",
    hint: "On a shoot, at a client, travelling",
    tone: "border-amber-400/50 bg-amber-400/[0.08] text-amber-200",
    dot: "bg-amber-400",
    icon: <path d="M12 21s-6-5.3-6-10a6 6 0 1112 0c0 4.7-6 10-6 10zM12 13a2 2 0 100-4 2 2 0 000 4z" />,
  },
];

type Person = { name: string; role: string; initials: string; hue: AvatarHue; status: Status };

const TEAM: Person[] = [
  { name: "Mira Voss", role: "client lead", initials: "MV", hue: { from: "#FF8A8A", to: "#C2410C", ink: "#2A0E08" }, status: "WFH" },
  { name: "Kai Render", role: "PM", initials: "KR", hue: { from: "#7DD3FC", to: "#4338CA", ink: "#0A1230" }, status: "OFFICE" },
  { name: "Rhea Castell", role: "admin", initials: "RC", hue: { from: "#F0ABFC", to: "#7E22CE", ink: "#240833" }, status: "OFFICE" },
  { name: "Sage Holloway", role: "designer", initials: "SH", hue: { from: "#86EFAC", to: "#047857", ink: "#04221A" }, status: "FIELD" },
  { name: "Olin Park", role: "engineer", initials: "OP", hue: { from: "#FDE68A", to: "#B45309", ink: "#2A1804" }, status: "WFH" },
];

const YOU_HUE: AvatarHue = { from: "#FFB199", to: "#FF6B5E", ink: "#2A0E08" };

export function DailyCheckin() {
  const [me, setMe] = useState<Status | null>(null);
  const pick = (s: Status | null) => withViewTransition(() => setMe(s));
  const picked = STATUSES.find((s) => s.value === me);

  return (
    <div className="space-y-6">
      <WidgetFrame
        crumb="Daily check-in"
        toolbar={
          me ? (
            <Button variant="ghost" size="sm" icon="↻" onClick={() => pick(null)} className="font-mono uppercase tracking-[0.08em]">
              Reset
            </Button>
          ) : null
        }
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label-mono">Today&apos;s check-in</p>
            <p className="heading mt-2 text-xl text-ink-50 md:text-2xl">Where are you working from today?</p>
            <p className="mt-2 max-w-[60ch] text-xs leading-relaxed text-ink-500">
              In production this prompt opens on the first portal page view of each calendar day, counted on the
              team&apos;s own business day (Karachi time for PK-based teams), not UTC.
            </p>
          </div>
        </div>

        <div role="group" aria-label="Where are you working from today?" className="mt-6 grid gap-3 sm:grid-cols-3">
          {STATUSES.map((s) => {
            const active = me === s.value;
            return (
              <button
                key={s.value}
                type="button"
                aria-pressed={active}
                data-spot
                onClick={() => pick(active ? null : s.value)}
                className={cn(
                  "item group flex flex-col items-start gap-3 rounded-2xl p-4 text-left",
                  active && cn(s.tone, "shadow-[0_18px_40px_-20px_rgb(0_0_0/0.8)]"),
                )}
              >
                <span className="flex w-full items-center justify-between">
                  <span
                    aria-hidden
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-300",
                      active ? "border-current" : "border-line-strong text-ink-300 group-hover:text-ink-100",
                    )}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      {s.icon}
                    </svg>
                  </span>
                  <span
                    aria-hidden
                    key={active ? "on" : "off"}
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px]",
                      active ? "pop-in bg-current" : "ring-1 ring-white/15",
                    )}
                  >
                    {active ? <span className="text-ink-950">✓</span> : null}
                  </span>
                </span>
                <span>
                  <span className={cn("block text-[15px] font-semibold", active ? "" : "text-ink-100")}>{s.label}</span>
                  <span className={cn("mt-0.5 block text-xs", active ? "opacity-80" : "text-ink-500")}>{s.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        <p aria-live="polite" className="mt-5 min-h-5 border-t border-line pt-4 text-xs text-ink-400">
          {picked ? (
            <>
              Saved as <span className="text-ink-100">{picked.label.toLowerCase()}</span>. The team board picks it up,
              and the prompt will not open again until tomorrow.
            </>
          ) : (
            "Pick one. It is one status per person per day, enforced by a unique constraint."
          )}
        </p>
      </WidgetFrame>

      {/* The team board */}
      <section aria-labelledby="checkin-team-heading" className="surface rounded-2xl p-5 md:p-6">
        <WidgetHeading id="checkin-team-heading" aside="What a manager sees, live">
          Team today
        </WidgetHeading>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {STATUSES.map((s) => {
            const people = TEAM.filter((t) => t.status === s.value);
            const total = people.length + (me === s.value ? 1 : 0);
            return (
              <div key={s.value} className="rounded-xl border border-line bg-white/[0.015] p-3.5">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-[13px] font-medium text-ink-200">
                    <span aria-hidden className={cn("h-2 w-2 rounded-full", s.dot)} />
                    {s.label}
                  </p>
                  <span key={total} className="pop-in display text-2xl tabular-nums text-ink-50">
                    {total}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {me === s.value ? (
                    <li style={{ viewTransitionName: "checkin-you" }}>
                      <PersonChip initials="YOU" hue={YOU_HUE} name="You" role="visitor" highlight />
                    </li>
                  ) : null}
                  {people.map((p) => (
                    <li key={p.name}>
                      <PersonChip initials={p.initials} hue={p.hue} name={p.name} role={p.role} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PersonChip({
  initials,
  hue,
  name,
  role,
  highlight = false,
}: {
  initials: string;
  hue: AvatarHue;
  name: string;
  role: string;
  highlight?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2 py-1.5",
        highlight
          ? "bg-[color-mix(in_oklab,var(--color-scene-1)_12%,transparent)] ring-1 ring-[color-mix(in_oklab,var(--color-scene-1)_45%,transparent)]"
          : "",
      )}
    >
      <Avatar initials={initials === "YOU" ? "Y" : initials} hue={hue} size="xs" ring={false} />
      <span className="min-w-0">
        <span className="block truncate text-[13px] text-ink-100">{name}</span>
        <span className="block text-[11px] text-ink-500">{role}</span>
      </span>
    </span>
  );
}

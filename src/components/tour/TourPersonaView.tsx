"use client";

// One component, three personas. The panel content branches on
// persona.key — Mira reviews a deliverable, Kai replies to an inquiry,
// Nox reads the audit log. Tooltip + chrome are constant.

import { PersonaChrome } from "./PersonaChrome";
import { TourTooltip } from "./TourTooltip";
import {
  TOUR_AUDIT_BASE,
  TOUR_DELIVERABLE,
  TOUR_INQUIRY,
  TOUR_PERSONAS,
  type TourPersonaKey,
} from "@/lib/tour/script";

type Props = {
  personaKey: TourPersonaKey;
  // Mira-only: optional designer-note ripple (echoed in Nox audit log)
  comment: string;
  onCommentChange: (value: string) => void;
  // Action handlers — only used for Mira/Kai
  onApprove: () => void;
  onReply: () => void;
  // Action state — once true, the action button switches to a confirmed
  // state. Used to acknowledge before auto-advance.
  approved: boolean;
  replied: boolean;
  // "Skip ahead" lets the visitor advance manually without waiting for
  // the auto-timer.
  onSkip: () => void;
};

export function TourPersonaView({
  personaKey,
  comment,
  onCommentChange,
  onApprove,
  onReply,
  approved,
  replied,
  onSkip,
}: Props) {
  const persona = TOUR_PERSONAS[personaKey];

  return (
    <div className="tour-step-enter mx-auto max-w-6xl px-4 pb-12 pt-6 md:px-8 md:pt-10">
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <PersonaChrome persona={persona}>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-scene-1)]">
                {persona.role.toLowerCase()} dashboard
              </p>
              <h2 className="mt-3 text-2xl font-medium tracking-[-0.015em] text-zinc-50 md:text-3xl">
                {persona.headline}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">{persona.subheadline}</p>
            </div>

            <div className="mt-6">
              {personaKey === "mira" ? (
                <MiraPanel
                  comment={comment}
                  onCommentChange={onCommentChange}
                  onApprove={onApprove}
                  approved={approved}
                />
              ) : null}
              {personaKey === "kai" ? (
                <KaiPanel onReply={onReply} replied={replied} />
              ) : null}
              {personaKey === "nox" ? <NoxPanel comment={comment} /> : null}
            </div>
          </PersonaChrome>
        </div>

        <div className="lg:col-span-4">
          <TourTooltip
            title={persona.tooltipTitle}
            body={persona.tooltipBody}
          />
          <div className="mt-4 flex items-center justify-between gap-2 px-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              tour auto-advances
            </p>
            <button
              type="button"
              onClick={onSkip}
              className="rounded-md border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 hover:border-white/30 hover:text-white"
            >
              skip ahead →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mira panel ────────────────────────────────────────────────────────

function MiraPanel({
  comment,
  onCommentChange,
  onApprove,
  approved,
}: {
  comment: string;
  onCommentChange: (v: string) => void;
  onApprove: () => void;
  approved: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start gap-4">
        <div
          aria-hidden
          className="h-16 w-16 flex-shrink-0 rounded-md bg-gradient-to-br from-[var(--color-scene-1)]/40 via-[var(--color-scene-2)]/30 to-[var(--color-scene-1)]/10"
        />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            {TOUR_DELIVERABLE.project}
          </p>
          <h3 className="mt-1 text-lg font-medium tracking-[-0.01em] text-zinc-100">
            {TOUR_DELIVERABLE.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {TOUR_DELIVERABLE.thumbBlurb}
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
            submitted by {TOUR_DELIVERABLE.designer}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            leave a note for the designer (optional)
          </span>
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="e.g. Looks great — push the hero up 8px"
            rows={2}
            disabled={approved}
            className="mt-1.5 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[var(--color-scene-1)]/50 disabled:opacity-60"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled
          className="rounded-md border border-white/10 px-3 py-2 text-xs text-zinc-500"
          title="Disabled in tour mode — try the full Lattice scene to use this"
        >
          request revision
        </button>
        <button
          type="button"
          onClick={onApprove}
          disabled={approved}
          className="rounded-md border border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/15 px-4 py-2 text-xs font-medium text-[var(--color-scene-1)] transition-colors hover:bg-[var(--color-scene-1)]/25 disabled:opacity-90"
        >
          {approved ? "✓ approved" : "approve →"}
        </button>
      </div>
    </div>
  );
}

// ── Kai panel ────────────────────────────────────────────────────────

function KaiPanel({
  onReply,
  replied,
}: {
  onReply: () => void;
  replied: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-baseline gap-3">
        <p className="text-sm font-medium text-zinc-100">
          {TOUR_INQUIRY.fromName}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          {TOUR_INQUIRY.fromCompany}
        </p>
        <span className="ml-auto rounded-full border border-[var(--color-scene-1)]/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
          pm assigned
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-300">{TOUR_INQUIRY.summary}</p>
      <p className="mt-3 rounded-md border border-white/5 bg-black/30 px-3 py-3 text-sm leading-relaxed text-zinc-300">
        &ldquo;{TOUR_INQUIRY.preview}&rdquo;
      </p>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled
          className="rounded-md border border-white/10 px-3 py-2 text-xs text-zinc-500"
        >
          archive
        </button>
        <button
          type="button"
          onClick={onReply}
          disabled={replied}
          className="rounded-md border border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/15 px-4 py-2 text-xs font-medium text-[var(--color-scene-1)] transition-colors hover:bg-[var(--color-scene-1)]/25 disabled:opacity-90"
        >
          {replied ? "✓ first reply sent" : "send first reply →"}
        </button>
      </div>
    </div>
  );
}

// ── Nox panel ────────────────────────────────────────────────────────

function NoxPanel({ comment }: { comment: string }) {
  // Build the audit feed dynamically: prepend the visitor's actions in
  // reverse-chronological order, with the optional comment row.
  const fresh = [];
  fresh.push({
    id: "live-2",
    time: "just now",
    actor: "Mira Voss",
    action: `approved deliverable`,
    detail: TOUR_DELIVERABLE.title,
    fresh: true,
  });
  if (comment.trim().length > 0) {
    fresh.push({
      id: "live-2b",
      time: "just now",
      actor: "Mira Voss",
      action: "left a note for the designer",
      detail: `"${comment.trim()}"`,
      fresh: true,
    });
  }
  fresh.push({
    id: "live-1",
    time: "1 min ago",
    actor: "Kai Render",
    action: "sent first reply on inquiry",
    detail: `${TOUR_INQUIRY.fromCompany} · ${TOUR_INQUIRY.summary}`,
    fresh: true,
  });

  const rows = [...fresh, ...TOUR_AUDIT_BASE];

  return (
    <ul className="divide-y divide-white/5 rounded-xl border border-white/10 bg-white/[0.02]">
      {rows.map((row) => (
        <li
          key={row.id}
          className={[
            "flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-3",
            row.fresh ? "tour-fresh-pulse" : "",
          ].join(" ")}
        >
          <p className="w-24 flex-shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            {row.time}
          </p>
          <p className="text-sm text-zinc-200">
            <span className="font-medium text-zinc-100">{row.actor}</span>{" "}
            <span className="text-zinc-400">{row.action}</span>
            {row.detail ? (
              <>
                {" "}
                <span className="text-zinc-300">— {row.detail}</span>
              </>
            ) : null}
          </p>
          {row.fresh ? (
            <span className="ml-auto rounded-full border border-[var(--color-scene-1)]/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
              new
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

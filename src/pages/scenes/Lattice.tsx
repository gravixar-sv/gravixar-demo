// Agency OS (Lattice): a deliverable hand-off across three people.
// Client (Mira) · PM (Kai) · Editor (Sage). A deliverable is a real
// object that moves pane to pane as it is approved, revised or pushed
// back, with an attachment that pops on hover and an activity log of
// every hop. See src/lib/playground/lattice-deliverables.ts.
//
// Every card carries a view-transition-name keyed on its deliverable and
// every action dispatches inside a View Transition, so a hand-off is the
// card sliding to the next pane (and reset rewinds them all). The
// flowPulse orb covers browsers without View Transitions.
//
// This is the reference layout for all five scenes:
//   SceneLayout > SceneIntro (h1 + live checklist) > Workspace (panes)
//   > LearnBeat > OutcomePanel > ActivityLog (+ scene extras) > SceneCTA

import { useEffect, useState } from "react";
import {
  PERSONAS,
  createInitialLatticeState,
  latticeReducer,
  outcomeStats,
  trySteps,
  type Deliverable,
  type LatticeEvent,
} from "@/lib/playground/lattice-deliverables";
import { Avatar } from "@/components/demo/Avatar";
import { MockupThumb } from "@/components/demo/DeliverableMockup";
import { SceneLayout } from "@/components/demo/SceneLayout";
import { SceneIntro } from "@/components/demo/SceneIntro";
import { ActivityLog, EmptyState, ItemCard, Pane, Workspace } from "@/components/demo/Workspace";
import { LearnBeat } from "@/components/demo/LearnBeat";
import { OutcomePanel } from "@/components/demo/OutcomePanel";
import { SceneCTA } from "@/components/demo/SceneCTA";
import { Button } from "@/components/ui/Button";
import { flowPulse } from "@/lib/flowPulse";
import { useSceneDispatch } from "@/lib/useSceneDispatch";
import { useStartHint } from "@/lib/useStartHint";
import { vtName } from "@/lib/viewTransition";

const FRESH_DECAY_MS = 2200;

type Dispatch = React.Dispatch<LatticeEvent>;

export default function LatticePage() {
  return (
    <SceneLayout slug="lattice">
      <LatticeReviewLoop />
    </SceneLayout>
  );
}

function LatticeReviewLoop() {
  const [state, dispatch] = useSceneDispatch(latticeReducer, createInitialLatticeState);
  const { hint, endHint } = useStartHint();

  useEffect(() => {
    const ids = [
      ...state.deliverables.filter((d) => d.fresh).map((d) => d.id),
      ...state.rules.filter((r) => r.fresh).map((r) => r.id),
      ...state.feed.filter((f) => f.fresh).map((f) => f.id),
    ];
    if (ids.length === 0) return;
    const timers = ids.map((id) => window.setTimeout(() => dispatch({ type: "DECAY_FRESH", id }), FRESH_DECAY_MS));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [state.deliverables, state.rules, state.feed, dispatch]);

  const byState = (...states: Deliverable["state"][]) =>
    state.deliverables.filter((d) => states.includes(d.state));

  const shipped = byState("shipped").length;
  const learnedCount = state.rules.filter((r) => r.learned).length;
  const clientItems = byState("with_client", "shipped");
  const pmItems = byState("in_pm_review", "revision_requested");
  const editorItems = byState("editing");

  return (
    <>
      <SceneIntro
        slug="lattice"
        title="Watch a deliverable move."
        lede={
          <>
            The review loop from an agency operating system I run in production. Work flows Editor to PM to Client
            and back, and every decision the client makes{" "}
            <span className="text-ink-200">teaches the studio a house rule</span>.
          </>
        }
        steps={trySteps(state)}
        onReset={() => dispatch({ type: "RESET" })}
        status={
          shipped > 0 ? (
            <span key={shipped} className="chip chip-positive pop-in">
              ✓ {shipped} shipped
            </span>
          ) : null
        }
      />

      <Workspace
        slug="lattice"
        board="Spring rebrand · review board"
        onClickCapture={endHint}
        toolbar={
          <span aria-hidden className="hidden -space-x-1.5 md:flex">
            {Object.values(PERSONAS).map((p) => (
              <span key={p.key} className="rounded-full ring-2 ring-ink-925">
                <Avatar initials={p.initials} hue={p.hue} size="xs" ring={false} />
              </span>
            ))}
          </span>
        }
      >
        <Pane
          id="lattice-client"
          flow="lat-client"
          lead={<Avatar initials={PERSONAS.client.initials} hue={PERSONAS.client.hue} />}
          title={PERSONAS.client.name}
          tag={PERSONAS.client.role}
          sub={PERSONAS.client.contextLine}
          count={clientItems.length}
          status="Your review"
        >
          {byState("with_client").map((d, i) => (
            <ClientCard key={d.id} d={d} dispatch={dispatch} hint={hint && i === 0} />
          ))}
          {byState("shipped").map((d) => (
            <DoneCard key={d.id} d={d} />
          ))}
          <EmptyState show={clientItems.length === 0}>Nothing waiting on you right now.</EmptyState>
        </Pane>

        <Pane
          id="lattice-pm"
          flow="lat-pm"
          lead={<Avatar initials={PERSONAS.pm.initials} hue={PERSONAS.pm.hue} />}
          title={PERSONAS.pm.name}
          tag="PM"
          sub={PERSONAS.pm.contextLine}
          count={pmItems.length}
          status="Queue"
        >
          {byState("in_pm_review").map((d) => (
            <PMReviewCard key={d.id} d={d} dispatch={dispatch} />
          ))}
          {byState("revision_requested").map((d) => (
            <PMRevisionCard key={d.id} d={d} dispatch={dispatch} />
          ))}
          <EmptyState show={pmItems.length === 0}>Inbox clear.</EmptyState>
        </Pane>

        <Pane
          id="lattice-editor"
          flow="lat-editor"
          lead={<Avatar initials={PERSONAS.editor.initials} hue={PERSONAS.editor.hue} />}
          title={PERSONAS.editor.name}
          tag={PERSONAS.editor.role}
          sub={PERSONAS.editor.contextLine}
          count={editorItems.length}
          status="In progress"
        >
          {editorItems.map((d) => (
            <EditorCard key={d.id} d={d} dispatch={dispatch} />
          ))}
          <EmptyState show={editorItems.length === 0}>No revisions to action.</EmptyState>
        </Pane>
      </Workspace>

      <LearnBeat
        rules={state.rules}
        learnedCount={learnedCount}
        flow="lat-rules"
        headingId="lattice-rules-heading"
        heading="House rules"
        sub="What every client decision teaches the studio"
        learnedLabel={`learned from ${PERSONAS.client.firstName}`}
        emptyText={`Have ${PERSONAS.client.firstName} approve or revise a deliverable and the studio starts a house rulebook.`}
        renderMeta={(rule) => (
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-ink-500">
            <span>For {rule.audience === "editor" ? PERSONAS.editor.firstName : PERSONAS.pm.firstName}</span>
            {rule.learned ? (
              <span className="font-medium text-scene-soft">Learned from {PERSONAS.client.firstName}</span>
            ) : (
              <span>House default</span>
            )}
          </p>
        )}
      />
      <OutcomePanel stats={outcomeStats(state)} liveProductLabel="the agency OS I run" />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <ActivityLog
          id="lattice-activity"
          sub="Every hop, logged as it happens"
          entries={state.feed}
          vtPrefix="lat-feed"
        />
        <CapabilityStrip />
      </div>

      <SceneCTA
        personaLabel="Agencies"
        noun="agency"
        headline={
          <>
            Run your agency <span className="voice font-normal text-scene-soft">on this.</span>
          </>
        }
        blurb="This is the operating system I build for agencies: scoped projects, the review loop, invoicing and payment requests, partner commissions, leave and WFH, all gated and audited. Most builds run 4 to 8 weeks. One call to scope it, no obligation."
      />
    </>
  );
}

// ─── Cards ──────────────────────────────────────────────────────────

function CardHead({ d, stage }: { d: Deliverable; stage: string }) {
  return (
    <div className="flex items-start gap-3">
      <MockupThumb kind={d.kind} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug text-ink-50">{d.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="chip chip-mono">v{d.version}</span>
          <span className="text-[11px] text-ink-500">{stage}</span>
        </div>
      </div>
    </div>
  );
}

function ClientCard({ d, dispatch, hint = false }: { d: Deliverable; dispatch: Dispatch; hint?: boolean }) {
  const [note, setNote] = useState("");
  const [revising, setRevising] = useState(false);

  return (
    <ItemCard vt={vtName("lat", d.id)} fresh={d.fresh}>
      <CardHead d={d} stage="Waiting on your sign-off" />
      {revising ? (
        <div className="mt-3.5">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            aria-label="Revision note"
            placeholder="What should change?"
            className="w-full resize-none rounded-lg border border-line-strong bg-ink-950/60 px-3 py-2 text-[13px] text-ink-100 placeholder:text-ink-500 focus:border-[color-mix(in_oklab,var(--color-scene-1)_60%,transparent)] focus:outline-none"
          />
          <div className="mt-2 flex gap-2">
            <Button
              variant="caution"
              size="sm"
              arrow
              onClick={(e) => {
                flowPulse(e.currentTarget, "lat-pm");
                dispatch({ type: "CLIENT_REVISE", id: d.id, note });
              }}
            >
              Send revision
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setRevising(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3.5 flex flex-wrap gap-2">
          <Button
            variant="positive"
            size="sm"
            arrow
            hint={hint}
            onClick={(e) => {
              flowPulse(e.currentTarget, "lat-rules");
              dispatch({ type: "CLIENT_APPROVE", id: d.id });
            }}
          >
            Approve
          </Button>
          <Button variant="caution" size="sm" onClick={() => setRevising(true)}>
            Request revision
          </Button>
        </div>
      )}
    </ItemCard>
  );
}

function PMReviewCard({ d, dispatch }: { d: Deliverable; dispatch: Dispatch }) {
  return (
    <ItemCard vt={vtName("lat", d.id)} fresh={d.fresh}>
      <CardHead d={d} stage="From Sage, needs your sign-off" />
      <Button
        variant="accent"
        size="sm"
        arrow
        className="mt-3.5"
        onClick={(e) => {
          flowPulse(e.currentTarget, "lat-client");
          dispatch({ type: "PM_APPROVE", id: d.id });
        }}
      >
        Approve &amp; send to client
      </Button>
    </ItemCard>
  );
}

function PMRevisionCard({ d, dispatch }: { d: Deliverable; dispatch: Dispatch }) {
  return (
    <ItemCard vt={vtName("lat", d.id)} fresh={d.fresh} tone="caution">
      <CardHead d={d} stage="Client asked for changes" />
      <blockquote className="mt-3 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2 text-[12.5px] leading-relaxed text-amber-100/90">
        <span className="mr-1.5 text-[11px] font-semibold text-amber-300/90">{PERSONAS.client.firstName}:</span>
        {d.revisionNote}
      </blockquote>
      <Button
        variant="accent"
        size="sm"
        arrow
        className="mt-3"
        onClick={(e) => {
          flowPulse(e.currentTarget, "lat-editor");
          dispatch({ type: "PM_TO_EDITOR", id: d.id });
        }}
      >
        Push to editor
      </Button>
    </ItemCard>
  );
}

function EditorCard({ d, dispatch }: { d: Deliverable; dispatch: Dispatch }) {
  return (
    <ItemCard vt={vtName("lat", d.id)} fresh={d.fresh}>
      <CardHead d={d} stage={d.revisionNote ? "Reworking against the client's note" : "Drafting the first cut"} />
      <Button
        variant="accent"
        size="sm"
        className="mt-3.5"
        icon="↑"
        onClick={(e) => {
          flowPulse(e.currentTarget, "lat-pm");
          dispatch({ type: "EDITOR_SUBMIT", id: d.id });
        }}
      >
        Submit for review
      </Button>
    </ItemCard>
  );
}

function DoneCard({ d }: { d: Deliverable }) {
  return (
    <ItemCard vt={vtName("lat", d.id)} fresh={d.fresh} tone="positive" className="flex items-center gap-3 py-3">
      <MockupThumb kind={d.kind} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-200">{d.title}</p>
        <p className="mt-1 text-[11px] font-medium text-emerald-300/90">
          <span aria-hidden>✓</span> Shipped · v{d.version}
        </p>
      </div>
    </ItemCard>
  );
}

// ─── The rest of the OS ─────────────────────────────────────────────
// The review loop is one surface. This names the rest of the operating
// system running alongside it, so the scene reads as production
// software, not a single trick. Illustrative state, a spec sheet rather
// than a grid of identical cards.

const OS_MODULES: { name: string; desc: string; stat: string }[] = [
  { name: "Scoped projects", desc: "Retainers and one-off scopes with budgets and burn", stat: "12 active" },
  { name: "Invoicing & payment requests", desc: "Raise, approve, send", stat: "£412k issued" },
  { name: "Partner commissions", desc: "Referral splits tracked and paid per partner", stat: "6 partners" },
  { name: "Leave & WFH", desc: "Office, WFH and field check-ins, leave balances", stat: "3 office · 2 WFH" },
  { name: "AI feedback triage", desc: "Inbound notes drafted and routed to the right lead", stat: "behind a gate" },
];

function CapabilityStrip() {
  return (
    <section className="surface rounded-2xl p-5 md:p-6" aria-labelledby="os-heading">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="os-heading" className="heading text-lg text-ink-50">
          The rest of the OS
        </h2>
        <p className="text-xs text-ink-500">Running alongside this loop</p>
      </div>
      <ul className="mt-4 divide-y divide-line">
        {OS_MODULES.map((m) => (
          <li
            key={m.name}
            className="group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-0.5 py-3 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_auto]"
          >
            <p className="col-start-1 row-start-1 text-[13.5px] font-medium text-ink-100 transition-colors group-hover:text-white">{m.name}</p>
            <p className="col-span-2 col-start-1 row-start-2 text-[12.5px] text-ink-500 sm:col-span-1 sm:col-start-2 sm:row-start-1">{m.desc}</p>
            <span className="col-start-2 row-start-1 font-mono text-[11px] text-scene-soft sm:col-start-3">{m.stat}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

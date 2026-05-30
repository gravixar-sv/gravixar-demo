// Lattice review-loop state machine. A deliverable is a real object
// that moves across three columns (Client · PM · Editor) through a
// review lifecycle. Action in one column transitions the deliverable
// (which re-renders in another column) and logs to the activity feed.
//
// editing → in_pm_review → with_client → shipped
//                  ↑              │
//                  └── editing ←──┘  (revision_requested → PM pushes to Editor)

import type { AvatarHue } from "@/components/demo/Avatar";

export type RoleKey = "client" | "pm" | "editor";

export type Persona = {
  key: RoleKey;
  name: string;
  firstName: string;
  role: string;
  initials: string;
  contextLine: string;
  hue: AvatarHue;
};

export const PERSONAS: Record<RoleKey, Persona> = {
  client: {
    key: "client",
    name: "Mira Voss",
    firstName: "Mira",
    role: "Client",
    initials: "MV",
    contextLine: "Lattice Studio: Spring rebrand",
    hue: { from: "#FF8A8A", to: "#C2410C", ink: "#2A0E08" },
  },
  pm: {
    key: "pm",
    name: "Kai Render",
    firstName: "Kai",
    role: "Project manager",
    initials: "KR",
    contextLine: "3 / 12 retainers active",
    hue: { from: "#7DD3FC", to: "#4338CA", ink: "#0A1230" },
  },
  editor: {
    key: "editor",
    name: "Sage Holloway",
    firstName: "Sage",
    role: "Editor",
    initials: "SH",
    contextLine: "Senior designer · 2 in progress",
    hue: { from: "#86EFAC", to: "#047857", ink: "#04221A" },
  },
};

export type DeliverableKind = "web" | "social" | "email";

export type DeliverableState =
  | "editing"
  | "in_pm_review"
  | "with_client"
  | "revision_requested"
  | "shipped";

export type Deliverable = {
  id: string;
  title: string;
  kind: DeliverableKind;
  state: DeliverableState;
  version: number;
  /** Latest client revision note, when state === revision_requested / after a bounce. */
  revisionNote?: string;
  /** Just transitioned — drives the card's pop-in highlight. */
  fresh?: boolean;
};

export type FeedEntry = {
  id: string;
  ts: number;
  actor: string;
  action: string;
  detail?: string;
  fresh?: boolean;
};

export type LatticeState = {
  deliverables: Deliverable[];
  feed: FeedEntry[];
};

export type LatticeEvent =
  | { type: "EDITOR_SUBMIT"; id: string }
  | { type: "PM_APPROVE"; id: string }
  | { type: "PM_TO_EDITOR"; id: string }
  | { type: "CLIENT_APPROVE"; id: string }
  | { type: "CLIENT_REVISE"; id: string; note: string }
  | { type: "DECAY_FRESH"; id: string }
  | { type: "RESET" };

const SEED_DELIVERABLES: Omit<Deliverable, "fresh">[] = [
  { id: "d-hero", title: "Homepage hero, v2", kind: "web", state: "with_client", version: 2 },
  { id: "d-carousel", title: "Launch carousel, slide 1", kind: "social", state: "in_pm_review", version: 1 },
  { id: "d-email", title: "Welcome email banner", kind: "email", state: "editing", version: 1 },
];

const FEED_SEED: Array<Omit<FeedEntry, "ts"> & { offsetMs: number }> = [
  { id: "lf-1", offsetMs: 90_000, actor: "Sage Holloway", action: "submitted", detail: "Homepage hero, v2 → PM review" },
  { id: "lf-2", offsetMs: 60_000, actor: "Kai Render", action: "approved + sent to client", detail: "Homepage hero, v2" },
];

export function createInitialLatticeState(): LatticeState {
  const now = Date.now();
  return {
    deliverables: SEED_DELIVERABLES.map((d) => ({ ...d })),
    feed: FEED_SEED.map((f) => ({
      id: f.id,
      ts: now - f.offsetMs,
      actor: f.actor,
      action: f.action,
      detail: f.detail,
    })),
  };
}

function nextId(): string {
  return `lf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function findKind(state: LatticeState, id: string): Deliverable | undefined {
  return state.deliverables.find((d) => d.id === id);
}

function transition(
  state: LatticeState,
  id: string,
  patch: Partial<Deliverable>,
  feed: { actor: string; action: string; detail?: string },
): LatticeState {
  const target = findKind(state, id);
  if (!target) return state;
  return {
    deliverables: state.deliverables.map((d) =>
      d.id === id ? { ...d, ...patch, fresh: true } : d,
    ),
    feed: [
      { id: nextId(), ts: Date.now(), fresh: true, ...feed },
      ...state.feed,
    ],
  };
}

export function latticeReducer(
  state: LatticeState,
  event: LatticeEvent,
): LatticeState {
  switch (event.type) {
    case "EDITOR_SUBMIT": {
      const d = findKind(state, event.id);
      if (!d || d.state !== "editing") return state;
      return transition(
        state,
        event.id,
        { state: "in_pm_review", revisionNote: undefined },
        { actor: PERSONAS.editor.name, action: "submitted for review", detail: `${d.title} · v${d.version}` },
      );
    }
    case "PM_APPROVE": {
      const d = findKind(state, event.id);
      if (!d || d.state !== "in_pm_review") return state;
      return transition(
        state,
        event.id,
        { state: "with_client" },
        { actor: PERSONAS.pm.name, action: "approved + sent to client", detail: d.title },
      );
    }
    case "CLIENT_APPROVE": {
      const d = findKind(state, event.id);
      if (!d || d.state !== "with_client") return state;
      return transition(
        state,
        event.id,
        { state: "shipped" },
        { actor: PERSONAS.client.name, action: "approved, shipped", detail: d.title },
      );
    }
    case "CLIENT_REVISE": {
      const d = findKind(state, event.id);
      if (!d || d.state !== "with_client") return state;
      const note = event.note.trim() || "Please tweak this.";
      return transition(
        state,
        event.id,
        { state: "revision_requested", revisionNote: note },
        { actor: PERSONAS.client.name, action: "requested a revision", detail: `${d.title} · “${note}”` },
      );
    }
    case "PM_TO_EDITOR": {
      const d = findKind(state, event.id);
      if (!d || d.state !== "revision_requested") return state;
      return transition(
        state,
        event.id,
        { state: "editing", version: d.version + 1 },
        { actor: PERSONAS.pm.name, action: "pushed to editor", detail: `${d.title} · now v${d.version + 1}` },
      );
    }
    case "DECAY_FRESH":
      return {
        deliverables: state.deliverables.map((d) =>
          d.id === event.id ? { ...d, fresh: false } : d,
        ),
        feed: state.feed.map((f) =>
          f.id === event.id && f.fresh ? { ...f, fresh: false } : f,
        ),
      };
    case "RESET":
      return createInitialLatticeState();
    default:
      return state;
  }
}

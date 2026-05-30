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

/** A rule the studio has learned from how the client reviews work. */
export type RuleSpec = { text: string; kind: "do" | "dont" };
export type Rule = RuleSpec & {
  id: string;
  /** True when from a client action; false for AI-seeded house rules. */
  learned: boolean;
  /** For-whom audience tag (shows next to the rule). */
  audience: "editor" | "pm";
  fresh?: boolean;
};

export type Deliverable = {
  id: string;
  title: string;
  kind: DeliverableKind;
  state: DeliverableState;
  version: number;
  /** Latest client revision note, when state === revision_requested / after a bounce. */
  revisionNote?: string;
  /** Rule learned when the client approves this deliverable. */
  approvalRule?: RuleSpec & { audience: Rule["audience"] };
  /** Rule learned when the client requests a revision on this deliverable. */
  revisionRule?: RuleSpec & { audience: Rule["audience"] };
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
  rules: Rule[];
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
  {
    id: "d-hero",
    title: "Homepage hero, v2",
    kind: "web",
    state: "with_client",
    version: 2,
    approvalRule: {
      text: "Sage's web heroes land on v2 — keep v1 → v2 as the default cadence",
      kind: "do",
      audience: "editor",
    },
    revisionRule: {
      text: "Confirm hero copy direction with Mira before the first cut",
      kind: "do",
      audience: "pm",
    },
  },
  {
    id: "d-carousel",
    title: "Launch carousel, slide 1",
    kind: "social",
    state: "in_pm_review",
    version: 1,
    approvalRule: {
      text: "Sage's social carousels pass first try when slide 1 is the strongest frame",
      kind: "do",
      audience: "editor",
    },
    revisionRule: {
      text: "Push slide 1 thumbnails past Mira before Kai approves",
      kind: "do",
      audience: "pm",
    },
  },
  {
    id: "d-email",
    title: "Welcome email banner",
    kind: "email",
    state: "editing",
    version: 1,
    approvalRule: {
      text: "Email banners that mirror the hero crop fly through review",
      kind: "do",
      audience: "editor",
    },
    revisionRule: {
      text: "Hold email banners until the hero is locked",
      kind: "dont",
      audience: "pm",
    },
  },
];

const FEED_SEED: Array<Omit<FeedEntry, "ts"> & { offsetMs: number }> = [
  { id: "lf-1", offsetMs: 90_000, actor: "Sage Holloway", action: "submitted", detail: "Homepage hero, v2 → PM review" },
  { id: "lf-2", offsetMs: 60_000, actor: "Kai Render", action: "approved + sent to client", detail: "Homepage hero, v2" },
];

const RULES_SEED: Rule[] = [
  {
    id: "lr-seed-revisions",
    text: "Standard retainer = 2 revision rounds; flag 3+ for scope review",
    kind: "do",
    audience: "pm",
    learned: false,
  },
  {
    id: "lr-seed-watermark",
    text: "Watermark every client preview · drop on shipped delivery",
    kind: "do",
    audience: "editor",
    learned: false,
  },
];

export function createInitialLatticeState(): LatticeState {
  const now = Date.now();
  return {
    deliverables: SEED_DELIVERABLES.map((d) => ({ ...d })),
    rules: RULES_SEED.map((r) => ({ ...r })),
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

function nextRuleId(): string {
  return `lr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function findKind(state: LatticeState, id: string): Deliverable | undefined {
  return state.deliverables.find((d) => d.id === id);
}

function learnRule(
  rules: Rule[],
  spec: (RuleSpec & { audience: Rule["audience"] }) | undefined,
): Rule[] {
  if (!spec) return rules;
  return [
    {
      id: nextRuleId(),
      text: spec.text,
      kind: spec.kind,
      audience: spec.audience,
      learned: true,
      fresh: true,
    },
    ...rules,
  ];
}

function transition(
  state: LatticeState,
  id: string,
  patch: Partial<Deliverable>,
  feed: { actor: string; action: string; detail?: string },
  ruleSpec?: (RuleSpec & { audience: Rule["audience"] }) | undefined,
): LatticeState {
  const target = findKind(state, id);
  if (!target) return state;
  return {
    deliverables: state.deliverables.map((d) =>
      d.id === id ? { ...d, ...patch, fresh: true } : d,
    ),
    rules: learnRule(state.rules, ruleSpec),
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
        d.approvalRule,
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
        d.revisionRule,
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
        rules: state.rules.map((r) =>
          r.id === event.id && r.fresh ? { ...r, fresh: false } : r,
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

// Northbeam Goods — brand governance for a DTC/brand team. The
// signature workflow research validated: locked self-serve templates
// (non-designers edit copy, brand elements stay locked) → route for
// approval with an AI tone/compliance/brand-alignment check → publish,
// with an audit trail. Same "AI checks the 80%, human approves" grammar
// as the other scenes, but the buyer + workflow are distinct.

import type { DeliverableKind } from "@/lib/playground/lattice-deliverables";

export type Template = {
  id: string;
  name: string;
  kind: DeliverableKind;
  locked: string;
  editable: string;
  requestedBy: string;
};

export type AiCheck = { label: string; ok: boolean };

export type AssetState = "in_review" | "changes_requested" | "published";

export type BrandAsset = {
  id: string;
  title: string;
  kind: DeliverableKind;
  by: string;
  state: AssetState;
  checks: AiCheck[];
  version: number;
  fresh?: boolean;
};

export type FeedEntry = { id: string; ts: number; text: string; fresh?: boolean };

export type NorthbeamState = {
  templates: Template[];
  assets: BrandAsset[];
  feed: FeedEntry[];
};

export type NorthbeamEvent =
  | { type: "USE_TEMPLATE"; id: string }
  | { type: "APPROVE_PUBLISH"; id: string }
  | { type: "REQUEST_CHANGE"; id: string }
  | { type: "RESUBMIT"; id: string }
  | { type: "DECAY_FRESH"; id: string }
  | { type: "RESET" };

const TEMPLATES: Template[] = [
  {
    id: "tpl-promo",
    name: "Instagram promo",
    kind: "social",
    locked: "logo, brand colours, safe-zone",
    editable: "headline + offer copy",
    requestedBy: "Jordan (social)",
  },
  {
    id: "tpl-aplus",
    name: "Amazon A+ module",
    kind: "web",
    locked: "layout grid + typography",
    editable: "product claims + imagery",
    requestedBy: "Priya (marketplace)",
  },
  {
    id: "tpl-email",
    name: "Campaign email header",
    kind: "email",
    locked: "wordmark + footer",
    editable: "subject + hero line",
    requestedBy: "Dana (lifecycle)",
  },
];

// Deterministic AI brand-check per template kind (mock).
function checksFor(kind: DeliverableKind): AiCheck[] {
  if (kind === "social")
    return [
      { label: "Logo safe-zone respected", ok: true },
      { label: "On-palette", ok: true },
      { label: "“guaranteed” may need a legal disclaimer", ok: false },
    ];
  if (kind === "web")
    return [
      { label: "Typography locked to brand", ok: true },
      { label: "Claims match approved product copy", ok: true },
      { label: "Tone on-brand (confident, not hypey)", ok: true },
    ];
  return [
    { label: "Wordmark + footer intact", ok: true },
    { label: "Subject within 45 chars", ok: true },
    { label: "Reading level on target", ok: true },
  ];
}

const ASSETS_SEED: BrandAsset[] = [
  {
    id: "a-spring",
    title: "Spring sale — IG promo",
    kind: "social",
    by: "Jordan (social)",
    state: "in_review",
    checks: checksFor("social"),
    version: 1,
  },
  {
    id: "a-bundle",
    title: "Bundle launch — A+ module",
    kind: "web",
    by: "Priya (marketplace)",
    state: "published",
    checks: checksFor("web"),
    version: 2,
  },
];

const FEED_SEED: Array<{ id: string; offsetMs: number; text: string }> = [
  { id: "nf-1", offsetMs: 120_000, text: "Brand check ran on 'Bundle launch — A+ module' · 3/3 passed" },
  { id: "nf-2", offsetMs: 300_000, text: "Published · Bundle launch — A+ module (v2)" },
];

export function createInitialNorthbeamState(): NorthbeamState {
  const now = Date.now();
  return {
    templates: TEMPLATES.map((t) => ({ ...t })),
    assets: ASSETS_SEED.map((a) => ({ ...a })),
    feed: FEED_SEED.map((f) => ({ id: f.id, ts: now - f.offsetMs, text: f.text })),
  };
}

function nextId(): string {
  return `nf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
function log(feed: FeedEntry[], text: string): FeedEntry[] {
  return [{ id: nextId(), ts: Date.now(), text, fresh: true }, ...feed];
}

export function northbeamReducer(
  state: NorthbeamState,
  event: NorthbeamEvent,
): NorthbeamState {
  switch (event.type) {
    case "USE_TEMPLATE": {
      const tpl = state.templates.find((t) => t.id === event.id);
      if (!tpl) return state;
      const asset: BrandAsset = {
        id: `asset-${tpl.id}-${Date.now().toString(36)}`,
        title: `${tpl.name} draft`,
        kind: tpl.kind,
        by: tpl.requestedBy,
        state: "in_review",
        checks: checksFor(tpl.kind),
        version: 1,
        fresh: true,
      };
      return {
        ...state,
        assets: [asset, ...state.assets],
        feed: log(state.feed, `${tpl.requestedBy} submitted a ${tpl.name} for brand review`),
      };
    }
    case "APPROVE_PUBLISH": {
      const a = state.assets.find((x) => x.id === event.id);
      if (!a || a.state === "published") return state;
      return {
        ...state,
        assets: state.assets.map((x) =>
          x.id === a.id ? { ...x, state: "published", fresh: true } : x,
        ),
        feed: log(state.feed, `Approved + published · ${a.title} (v${a.version})`),
      };
    }
    case "REQUEST_CHANGE": {
      const a = state.assets.find((x) => x.id === event.id);
      if (!a || a.state !== "in_review") return state;
      return {
        ...state,
        assets: state.assets.map((x) =>
          x.id === a.id ? { ...x, state: "changes_requested", fresh: true } : x,
        ),
        feed: log(state.feed, `Sent back for changes · ${a.title}`),
      };
    }
    case "RESUBMIT": {
      const a = state.assets.find((x) => x.id === event.id);
      if (!a || a.state !== "changes_requested") return state;
      return {
        ...state,
        assets: state.assets.map((x) =>
          x.id === a.id
            ? { ...x, state: "in_review", version: x.version + 1, checks: checksFor(x.kind), fresh: true }
            : x,
        ),
        feed: log(state.feed, `Resubmitted for review · ${a.title} (v${a.version + 1})`),
      };
    }
    case "DECAY_FRESH":
      return {
        ...state,
        assets: state.assets.map((a) => (a.id === event.id ? { ...a, fresh: false } : a)),
        feed: state.feed.map((f) => (f.id === event.id && f.fresh ? { ...f, fresh: false } : f)),
      };
    case "RESET":
      return createInitialNorthbeamState();
    default:
      return state;
  }
}

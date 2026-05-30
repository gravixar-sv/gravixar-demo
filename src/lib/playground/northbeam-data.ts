// Northbeam Goods — a real brand AGENT for a DTC team (not a passive
// compliance scanner). The loop: a plain brief comes in → the agent drafts
// it ON-BRAND (or BLOCKS it at the guardrail if it would break a locked
// rule) → a human approves, requests a change, or overrides → and the agent
// LEARNS a do/don't rule from that decision. The learned brand rules are the
// star of the scene: you watch the brand memory grow as you approve.
//
// Same "AI does the work, a human gates anything that ships" grammar as the
// other scenes, plus the missing beat — it learns from your approvals.

import type { DeliverableKind } from "@/lib/playground/lattice-deliverables";

export type RuleKind = "do" | "dont";

export type BrandRule = {
  id: string;
  kind: RuleKind;
  text: string;
  /** True for rules the agent learned from a human decision (vs. seeded). */
  learned?: boolean;
  fresh?: boolean;
};

export type RequestStatus = "open" | "published" | "dropped";

export type BrandRequest = {
  id: string;
  title: string;
  kind: DeliverableKind;
  brief: string;
  by: string;
  /** The deliberately off-brand request — the agent blocks it. */
  offBrand?: boolean;
  status: RequestStatus;
};

/** What the agent produces in the workspace: an on-brand draft or a drift block. */
export type Draft = {
  requestId: string;
  title: string;
  kind: DeliverableKind;
  mode: "draft" | "drift";
  /** Generated copy lines (draft) or the explanation (drift). */
  lines: string[];
  /** Brand rules the agent applied — surfaced as reasoning, not just a verdict. */
  applied?: string[];
  /** Rules the request violates — drift mode only. */
  violations?: string[];
};

export type Gate = "idle" | "pending" | "approved" | "changed" | "blocked";

export type AuditEntry = {
  id: string;
  ts: number;
  actor: string;
  action: string;
  detail?: string;
  fresh?: boolean;
};

export type NorthbeamState = {
  requests: BrandRequest[];
  current: string | null;
  draft: Draft | null;
  gate: Gate;
  rules: BrandRule[];
  feed: AuditEntry[];
};

export type NorthbeamEvent =
  | { type: "GENERATE"; id: string }
  | { type: "APPROVE" }
  | { type: "REQUEST_CHANGE" }
  | { type: "OVERRIDE" }
  | { type: "DROP" }
  | { type: "DECAY_FRESH"; id: string }
  | { type: "RESET" };

// --- the agent's per-request script (deterministic mock output) ---

type Recipe = {
  draft: { lines: string[]; applied: string[] };
  learnsDo: string;
  learnsDont: string;
};

const RECIPES: Record<string, Recipe> = {
  "req-spring": {
    draft: {
      lines: [
        "Headline: Brighter days, brighter routines.",
        "Sub: Spring picks, 20% off through Sunday.",
        "CTA: Refresh yours →",
      ],
      applied: [
        "Benefit-led headline (offer moved to the subhead)",
        "On-palette · wordmark safe-zone preserved",
        "Confident tone, no hype words",
      ],
    },
    learnsDo: "Lead seasonal promos with a benefit (“brighter routines”), not the %",
    learnsDont: "Don’t open a promo on the discount number",
  },
  "req-bundle": {
    draft: {
      lines: [
        "Module H1: The set that does the work for you.",
        "Body: Three essentials, one routine. Bundled.",
        "Badge: Best value · ships free",
      ],
      applied: [
        "Claims match the approved product copy",
        "Locked A+ layout grid + typography respected",
        "Superlative tied to a real proof point (price)",
      ],
    },
    learnsDo: "“Does the work for you” benefit angle fits the A+ voice",
    learnsDont: "Don’t use a superlative without a proof point attached",
  },
  "req-email": {
    draft: {
      lines: [
        "Subject: Your spring lineup is here (and lighter).",
        "Hero: Five minutes to a fresher routine.",
        "Preheader: New picks, plus a little something off.",
      ],
      applied: [
        "Subject under 45 characters",
        "Benefit-led hero line",
        "Wordmark + footer intact · soft-offer preheader",
      ],
    },
    learnsDo: "A soft-offer preheader beats a “SALE” subject in this voice",
    learnsDont: "Don’t shout the discount in the subject line",
  },
};

// The override path: a clean, compliant version of the off-brand flash request.
const OVERRIDE_DRAFT: { lines: string[]; applied: string[] } = {
  lines: [
    "Headline: The spring edit, while it lasts.",
    "Sub: Up to 60% off, ends Sunday.",
    "CTA: See the edit →",
  ],
  applied: [
    "Urgency kept, the all-caps shout dropped",
    "Offer moved out of the headline",
    "On-palette, no neon banner",
  ],
};

const DRIFT_VIOLATIONS = [
  "Discount % in the headline",
  "ALL-CAPS hype / neon “SALE” banner",
];

// --- seed ---

const REQUESTS_SEED: BrandRequest[] = [
  {
    id: "req-spring",
    title: "Spring sale: IG promo",
    kind: "social",
    brief: "Promote the 20% spring sale. One Instagram promo.",
    by: "Jordan · social",
    status: "open",
  },
  {
    id: "req-bundle",
    title: "Bundle launch: A+ module",
    kind: "web",
    brief: "Launch the 3-pack bundle on the Amazon A+ module.",
    by: "Priya · marketplace",
    status: "open",
  },
  {
    id: "req-email",
    title: "May newsletter header",
    kind: "email",
    brief: "Subject line + hero for the May lifecycle email.",
    by: "Dana · lifecycle",
    status: "open",
  },
  {
    id: "req-flash",
    title: "Flash banner: “60% OFF”",
    kind: "social",
    brief: "Loud 60% OFF flash banner. ALL CAPS, neon. Make it scream.",
    by: "Marketing · rush",
    offBrand: true,
    status: "open",
  },
];

const RULES_SEED: BrandRule[] = [
  { id: "r-do-benefit", kind: "do", text: "Lead with the product benefit, then the offer" },
  { id: "r-do-safezone", kind: "do", text: "Wordmark top-left, 24px safe-zone" },
  { id: "r-dont-pct", kind: "dont", text: "Discount % in the headline" },
  { id: "r-dont-hype", kind: "dont", text: "ALL-CAPS hype or neon “SALE” banners" },
];

const FEED_SEED: Array<{ id: string; offsetMs: number; actor: string; action: string; detail?: string }> = [
  { id: "nf-1", offsetMs: 300_000, actor: "Brand agent", action: "drafted + published", detail: "Bundle teaser: IG" },
  { id: "nf-2", offsetMs: 180_000, actor: "You", action: "approved a draft", detail: "agent learned 1 rule" },
];

export function createInitialNorthbeamState(): NorthbeamState {
  const now = Date.now();
  return {
    requests: REQUESTS_SEED.map((r) => ({ ...r })),
    current: null,
    draft: null,
    gate: "idle",
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

// --- helpers ---

let seq = 0;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

function log(
  feed: AuditEntry[],
  actor: string,
  action: string,
  detail?: string,
): AuditEntry[] {
  return [{ id: nextId("nf"), ts: Date.now(), actor, action, detail, fresh: true }, ...feed];
}

function learnRule(rules: BrandRule[], kind: RuleKind, text: string): BrandRule[] {
  // No-op if we already know this rule (keeps repeated approvals honest).
  if (rules.some((r) => r.text.toLowerCase() === text.toLowerCase())) return rules;
  return [{ id: nextId("r"), kind, text, learned: true, fresh: true }, ...rules];
}

// --- reducer ---

export function northbeamReducer(
  state: NorthbeamState,
  event: NorthbeamEvent,
): NorthbeamState {
  switch (event.type) {
    case "GENERATE": {
      const req = state.requests.find((r) => r.id === event.id);
      if (!req || req.status !== "open") return state;

      if (req.offBrand) {
        const draft: Draft = {
          requestId: req.id,
          title: req.title,
          kind: req.kind,
          mode: "drift",
          violations: DRIFT_VIOLATIONS,
          lines: [
            "The brief asks for “60% OFF” in all-caps neon.",
            "That breaks two locked brand rules. I won’t publish it as-is.",
            "I can draft a compliant version that still lands the urgency.",
          ],
        };
        return {
          ...state,
          current: req.id,
          draft,
          gate: "blocked",
          feed: log(state.feed, "Brand agent", "blocked an off-brand request", req.title),
        };
      }

      const recipe = RECIPES[req.id];
      if (!recipe) return state;
      const draft: Draft = {
        requestId: req.id,
        title: req.title,
        kind: req.kind,
        mode: "draft",
        lines: recipe.draft.lines,
        applied: recipe.draft.applied,
      };
      return {
        ...state,
        current: req.id,
        draft,
        gate: "pending",
        feed: log(state.feed, "Brand agent", "drafted an on-brand variant", req.title),
      };
    }

    case "APPROVE": {
      if (state.gate !== "pending" || !state.draft) return state;
      const reqId = state.draft.requestId;
      const recipe = RECIPES[reqId];
      const rules = recipe ? learnRule(state.rules, "do", recipe.learnsDo) : state.rules;
      return {
        ...state,
        gate: "approved",
        requests: state.requests.map((r) =>
          r.id === reqId ? { ...r, status: "published" } : r,
        ),
        rules,
        feed: log(
          state.feed,
          "You",
          "approved + published",
          recipe ? "agent learned a do-rule" : state.draft.title,
        ),
      };
    }

    case "REQUEST_CHANGE": {
      if (state.gate !== "pending" || !state.draft) return state;
      const reqId = state.draft.requestId;
      const recipe = RECIPES[reqId];
      const rules = recipe ? learnRule(state.rules, "dont", recipe.learnsDont) : state.rules;
      return {
        ...state,
        gate: "changed",
        rules,
        feed: log(
          state.feed,
          "You",
          "requested a change",
          recipe ? "agent learned a don’t-rule" : state.draft.title,
        ),
      };
    }

    case "OVERRIDE": {
      // Human overrides the guardrail; the agent adapts into a compliant draft.
      if (state.gate !== "blocked" || !state.draft) return state;
      const draft: Draft = {
        requestId: state.draft.requestId,
        title: state.draft.title,
        kind: state.draft.kind,
        mode: "draft",
        lines: OVERRIDE_DRAFT.lines,
        applied: OVERRIDE_DRAFT.applied,
      };
      return {
        ...state,
        draft,
        gate: "pending",
        feed: log(state.feed, "You", "overrode the block", "agent drafted a compliant version"),
      };
    }

    case "DROP": {
      if (state.gate !== "blocked" || !state.draft) return state;
      const reqId = state.draft.requestId;
      return {
        ...state,
        current: null,
        draft: null,
        gate: "idle",
        requests: state.requests.map((r) =>
          r.id === reqId ? { ...r, status: "dropped" } : r,
        ),
        feed: log(state.feed, "You", "dropped the off-brand request", state.draft.title),
      };
    }

    case "DECAY_FRESH":
      return {
        ...state,
        rules: state.rules.map((r) => (r.id === event.id && r.fresh ? { ...r, fresh: false } : r)),
        feed: state.feed.map((f) => (f.id === event.id && f.fresh ? { ...f, fresh: false } : f)),
      };

    case "RESET":
      return createInitialNorthbeamState();

    default:
      return state;
  }
}

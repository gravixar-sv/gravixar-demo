// Hardcoded content for the V1 Lattice playground. Single agency
// context. Patterns lifted from src/lib/tour/script.ts so the audit
// rows, deliverable, and inquiry read consistently with what the tour
// shipped (which the playground is replacing). No per-visitor
// branching — V2 will replace static content with AI-personalized
// scripts behind the same shape.

export const PLAYGROUND_AGENCY = {
  domain: "your-agency.com",
  studioName: "Lattice Studio",
  project: "Lattice spring rebrand",
} as const;

export type PlaygroundPersonaKey = "mira" | "kai" | "nox";

export type PlaygroundPersona = {
  key: PlaygroundPersonaKey;
  name: string;
  firstName: string;
  role: string;
  initials: string;
  contextLine: string;
};

export const PLAYGROUND_PERSONAS: Record<PlaygroundPersonaKey, PlaygroundPersona> = {
  mira: {
    key: "mira",
    name: "Mira Voss",
    firstName: "Mira",
    role: "Client",
    initials: "MV",
    contextLine: `Active project: ${PLAYGROUND_AGENCY.studioName} — Spring rebrand`,
  },
  kai: {
    key: "kai",
    name: "Kai Render",
    firstName: "Kai",
    role: "PM",
    initials: "KR",
    contextLine: "Pipeline: 3 / 12 retainers active",
  },
  nox: {
    key: "nox",
    name: "Nox Bellini",
    firstName: "Nox",
    role: "Admin",
    initials: "NB",
    contextLine: "Activity, real-time",
  },
};

// Mira's deliverable card.
export const PLAYGROUND_DELIVERABLE = {
  title: "Homepage v2",
  fullTitle: "Homepage hero, v2",
  designer: "Sage Holloway",
  blurb:
    "Final hero composition for the new homepage. Includes the updated wordmark lockup and the spring palette swap.",
} as const;

// Kai's inquiry card.
export const PLAYGROUND_INQUIRY = {
  fromName: "Theo Marquez",
  fromCompany: "Marquez & Co.",
  summary: "Brand identity refresh + landing page",
  preview:
    "Hi — we're a 12-person consultancy and our brand is starting to feel dated. Looking for a 4-6 week engagement to refresh the wordmark and ship a new homepage.",
} as const;

// Initial seed audit (3 rows). Times are offsets in ms behind "now"
// at first render — the reducer's lazy initializer subtracts these
// from Date.now() so display times read as relative ("1 min ago").
export type SeedAuditEntry = {
  id: string;
  offsetMs: number;
  actor: string;
  action: string;
  detail?: string;
};

export const PLAYGROUND_AUDIT_SEED: SeedAuditEntry[] = [
  {
    id: "seed-1",
    offsetMs: 60_000,
    actor: PLAYGROUND_DELIVERABLE.designer,
    action: "submitted deliverable for client review",
    detail: PLAYGROUND_DELIVERABLE.fullTitle,
  },
  {
    id: "seed-2",
    offsetMs: 180_000,
    actor: "system",
    action: "routed inquiry to PM",
    detail: `${PLAYGROUND_INQUIRY.fromCompany} → ${PLAYGROUND_PERSONAS.kai.firstName}`,
  },
  {
    id: "seed-3",
    offsetMs: 540_000,
    actor: PLAYGROUND_PERSONAS.nox.name,
    action: "approved leave request",
    detail: `${PLAYGROUND_DELIVERABLE.designer} · May 12 – May 14`,
  },
];

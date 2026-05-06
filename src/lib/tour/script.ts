// Hardcoded content for the V1 demo tour. Single agency context. No
// per-visitor branching — V2 will replace this with AI-personalized
// scripts behind the same shape.

export const TOUR_AGENCY = {
  domain: "your-agency.com",
  studioName: "Lattice Studio",
} as const;

// Step IDs used by the reducer. Linear progression.
export type TourStepId =
  | "welcome"
  | "login"
  | "mira"
  | "transition-mira-kai"
  | "kai"
  | "transition-kai-nox"
  | "nox"
  | "done";

// Read-window in ms before auto-advance fires for each step. Steps that
// are gated by a click (or don't auto-advance at all) get null.
export const TOUR_STEP_DURATION_MS: Record<TourStepId, number | null> = {
  welcome: null,
  login: null,
  mira: 15000,
  "transition-mira-kai": 2000,
  kai: 15000,
  "transition-kai-nox": 2000,
  nox: 12000,
  done: null,
};

// Order used to drive the progress dots in the topbar.
export const TOUR_PROGRESS_STEPS: TourStepId[] = [
  "welcome",
  "login",
  "mira",
  "kai",
  "nox",
  "done",
];

export type TourPersonaKey = "mira" | "kai" | "nox";

export type TourPersonaScript = {
  key: TourPersonaKey;
  name: string;
  firstName: string;
  role: string;
  email: string;
  initials: string;
  tooltipTitle: string;
  tooltipBody: string;
  // Copy for the panel header
  headline: string;
  subheadline: string;
};

export const TOUR_PERSONAS: Record<TourPersonaKey, TourPersonaScript> = {
  mira: {
    key: "mira",
    name: "Mira Voss",
    firstName: "Mira",
    role: "Client",
    email: `mira@${TOUR_AGENCY.domain}`,
    initials: "MV",
    tooltipTitle: "You're the client",
    tooltipBody:
      "Your designer just submitted work. Approve to ship it, or leave a note and request a revision.",
    headline: "1 deliverable awaiting your review",
    subheadline: "Submitted by Sage Holloway · 2 minutes ago",
  },
  kai: {
    key: "kai",
    name: "Kai Render",
    firstName: "Kai",
    role: "PM",
    email: `kai@${TOUR_AGENCY.domain}`,
    initials: "KR",
    tooltipTitle: "Now you're the PM",
    tooltipBody:
      "A new inquiry came in. Send the first reply to advance it through the funnel.",
    headline: "1 inquiry awaiting first reply",
    subheadline: "Routed to you · just now",
  },
  nox: {
    key: "nox",
    name: "Nox Bellini",
    firstName: "Nox",
    role: "Admin",
    email: `nox@${TOUR_AGENCY.domain}`,
    initials: "NB",
    tooltipTitle: "Now you're the admin",
    tooltipBody:
      "Here's the audit trail of everything that just happened. This is what compliance teams check.",
    headline: "Activity log",
    subheadline: "Real-time, append-only, role-attributed",
  },
};

// The single deliverable Mira reviews in the tour.
export const TOUR_DELIVERABLE = {
  title: "Homepage hero, v2",
  project: "Lattice spring rebrand",
  thumbBlurb:
    "Final hero composition for the new homepage. Includes the updated wordmark lockup and the spring palette swap.",
  designer: "Sage Holloway",
} as const;

// The single inquiry Kai replies to in the tour.
export const TOUR_INQUIRY = {
  fromName: "Theo Marquez",
  fromCompany: "Marquez & Co.",
  summary: "Brand identity refresh + landing page",
  preview:
    "Hi — we're a 12-person consultancy and our brand is starting to feel dated. Looking for a 4-6 week engagement to refresh the wordmark and ship a new homepage.",
} as const;

// The Nox audit log — a fixed scaffold that gets dynamic rows prepended
// based on what the visitor did at the Mira and Kai steps. Times are
// relative to "now" in the demo's frame, i.e. fake.
export type AuditEntry = {
  id: string;
  time: string;
  actor: string;
  action: string;
  detail?: string;
  fresh?: boolean;
};

export const TOUR_AUDIT_BASE: AuditEntry[] = [
  {
    id: "a-1",
    time: "2:31 pm",
    actor: "Sage Holloway",
    action: "submitted deliverable for client review",
    detail: TOUR_DELIVERABLE.title,
  },
  {
    id: "a-2",
    time: "11:14 am",
    actor: "Kai Render",
    action: "scheduled discovery call",
    detail: "Northwind · Tuesday 3:00 pm",
  },
  {
    id: "a-3",
    time: "9:02 am",
    actor: "Nox Bellini",
    action: "approved leave request",
    detail: "Sage Holloway · May 12 – May 14",
  },
];

// Welcome + login + done copy.
export const TOUR_COPY = {
  welcome: {
    eyebrow: "60-second guided tour",
    headline: "See what your portal would feel like.",
    body: "Three roles, one system, one audit trail. We'll walk you through it as the client, the project manager, and the admin in turn — about a minute total.",
    cta: "Start the tour →",
  },
  login: {
    eyebrow: "signing in as",
    title: TOUR_AGENCY.studioName,
    submitLabel: "Sign in",
    submitting: "Signing in…",
  },
  done: {
    eyebrow: "tour complete",
    headline: "That's the round-trip.",
    body: "Three roles, one system, one audit trail. The same pattern runs in production at our existing clients.",
    primaryCta: "Try it freely →",
    primaryHref: "/lattice",
    secondaryCta: "Talk to Qamar →",
    secondaryHref: "https://gravixar.com/contact",
    restart: "Take the tour again",
  },
} as const;

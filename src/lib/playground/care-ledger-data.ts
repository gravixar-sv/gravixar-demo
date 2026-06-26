// Care Ledger — a HIPAA-conscious medical-billing + credentialing portal
// for a clinic network, as a 3-column live workspace. Mirrors a live
// portal we've shipped; the signature loop runs left to right:
//
//   Credentialing intake  →  Finance / billing  →  Sales pipeline
//
//   - Credentialing: providers come in (NPI / license / DEA / CAQH), a
//     Zoom intake call is the human touchpoint, then a human credentials
//     them — which enables billing downstream.
//   - Billing: claim batches and billing-enablement requests wait behind
//     an approval gate. Nothing submits without a human.
//   - Sales: clinics move through a pipeline with a Zoom discovery call;
//     a signed clinic sends its providers back into credentialing.
//
// Same "AI does the work, a human holds the gate, every action is
// audited" grammar as the other scenes, plus a learn beat. The hard
// architecture rule: NO PHI in the portal. Claims carry codes and
// amounts; patient records stay in the clinic's EHR, isolated by design.
//
// All data here is illustrative sample data: no real patient, provider,
// or clinic information, and no real names.

export type RuleKind = "do" | "dont";
export type RuleSpec = { text: string; kind: RuleKind };
export type Rule = RuleSpec & {
  id: string;
  /** True when learned from a human action; false for seeded house rules. */
  learned: boolean;
  fresh?: boolean;
};

// ── Credentialing ──────────────────────────────────────────────────
export type CredKind = "NPI" | "License" | "DEA" | "CAQH";
export type Credential = { kind: CredKind; status: "verified" | "pending" };

export type Provider = {
  id: string;
  name: string;
  specialty: string;
  creds: Credential[];
  /** Zoom intake call — the human touchpoint before credentialing. */
  intake: "scheduled" | "done";
  status: "intake" | "credentialed";
  fresh?: boolean;
};

// ── Billing / finance ──────────────────────────────────────────────
export type BillingItem = {
  id: string;
  label: string;
  detail: string;
  amount?: string;
  state: "pending" | "approved";
  source: "credentialing" | "claims";
  learnedRule?: RuleSpec;
  fresh?: boolean;
};

/** Read-only finance summary tiles (no gate, no PHI). */
export type FinanceTile = { id: string; label: string; value: string; sub: string };

// ── Sales pipeline ─────────────────────────────────────────────────
export type DealStage = "discovery" | "demo" | "contract" | "live";
export type Deal = {
  id: string;
  clinic: string;
  seats: string;
  stage: DealStage;
  /** Zoom discovery call touchpoint. */
  zoom: "scheduled" | "done";
  /** Provider sent into credentialing when the clinic signs. */
  spawns?: { name: string; specialty: string };
  fresh?: boolean;
};

export type AuditEntry = {
  id: string;
  ts: number;
  actor: string;
  action: string;
  detail?: string;
  fresh?: boolean;
};

export type CareLedgerState = {
  providers: Provider[];
  billing: BillingItem[];
  finance: FinanceTile[];
  deals: Deal[];
  rules: Rule[];
  feed: AuditEntry[];
};

export type CareLedgerEvent =
  | { type: "COMPLETE_INTAKE"; id: string }
  | { type: "CREDENTIAL"; id: string }
  | { type: "APPROVE_BILLING"; id: string }
  | { type: "ADVANCE_DEAL"; id: string }
  | { type: "DECAY_FRESH"; id: string }
  | { type: "RESET" };

// ── Seeds ──────────────────────────────────────────────────────────

const PROVIDERS_SEED: Provider[] = [
  {
    id: "p-okonkwo",
    name: "Dr. A. Okonkwo",
    specialty: "Cardiology",
    creds: [
      { kind: "NPI", status: "verified" },
      { kind: "License", status: "verified" },
      { kind: "DEA", status: "verified" },
      { kind: "CAQH", status: "verified" },
    ],
    intake: "done",
    status: "intake",
  },
  {
    id: "p-castellano",
    name: "Dr. M. Castellano",
    specialty: "Pediatrics",
    creds: [
      { kind: "NPI", status: "verified" },
      { kind: "License", status: "verified" },
      { kind: "DEA", status: "pending" },
      { kind: "CAQH", status: "verified" },
    ],
    intake: "scheduled",
    status: "intake",
  },
];

const BILLING_SEED: BillingItem[] = [
  {
    id: "b-batch",
    label: "Claim batch · week 24",
    detail: "118 claims · CPT/ICD codes only, no PHI",
    amount: "$84,200",
    state: "pending",
    source: "claims",
    learnedRule: {
      text: "Two-person approval on claim batches over $10k",
      kind: "do",
    },
  },
];

const FINANCE_SEED: FinanceTile[] = [
  { id: "f-paid", label: "Collected", value: "$612k", sub: "this quarter" },
  { id: "f-ar", label: "In A/R", value: "$148k", sub: "32 days avg" },
];

const DEALS_SEED: Deal[] = [
  {
    id: "d-cedar",
    clinic: "Cedar Park Family Practice",
    seats: "8 providers",
    stage: "discovery",
    zoom: "scheduled",
    spawns: { name: "Dr. R. Idris", specialty: "Family medicine" },
  },
  {
    id: "d-meridian",
    clinic: "Meridian Pediatrics",
    seats: "5 providers",
    stage: "demo",
    zoom: "done",
    spawns: { name: "Dr. L. Fontaine", specialty: "Pediatrics" },
  },
  {
    id: "d-lakeshore",
    clinic: "Lakeshore Cardiology",
    seats: "11 providers",
    stage: "live",
    zoom: "done",
  },
];

const RULES_SEED: Rule[] = [
  { id: "cl-seed-phi", kind: "do", text: "No PHI in the portal, claims carry codes and amounts only", learned: false },
  { id: "cl-seed-intake", kind: "do", text: "Require a Zoom intake call before credentialing a provider", learned: false },
];

const FEED_SEED: Array<{ id: string; offsetMs: number; actor: string; action: string; detail?: string }> = [
  { id: "clf-1", offsetMs: 300_000, actor: "Care Ledger", action: "verified 4 credentials", detail: "NPI · license · DEA · CAQH" },
  { id: "clf-2", offsetMs: 150_000, actor: "You", action: "approved a claim batch", detail: "week 23 · $72,140" },
];

export function createInitialCareLedgerState(): CareLedgerState {
  const now = Date.now();
  return {
    providers: PROVIDERS_SEED.map((p) => ({ ...p, creds: p.creds.map((c) => ({ ...c })) })),
    billing: BILLING_SEED.map((b) => ({ ...b })),
    finance: FINANCE_SEED.map((f) => ({ ...f })),
    deals: DEALS_SEED.map((d) => ({ ...d })),
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

// ── helpers ────────────────────────────────────────────────────────

let seq = 0;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

function log(feed: AuditEntry[], actor: string, action: string, detail?: string): AuditEntry[] {
  return [{ id: nextId("clf"), ts: Date.now(), actor, action, detail, fresh: true }, ...feed];
}

function learnRule(rules: Rule[], spec: RuleSpec | undefined): Rule[] {
  if (!spec) return rules;
  if (rules.some((r) => r.text.toLowerCase() === spec.text.toLowerCase())) return rules;
  return [{ id: nextId("cl"), text: spec.text, kind: spec.kind, learned: true, fresh: true }, ...rules];
}

const STAGE_ORDER: DealStage[] = ["discovery", "demo", "contract", "live"];
const STAGE_LABEL: Record<DealStage, string> = {
  discovery: "Discovery",
  demo: "Demo",
  contract: "Contract signed",
  live: "Live",
};
export { STAGE_LABEL };

// ── reducer ────────────────────────────────────────────────────────

export function careLedgerReducer(
  state: CareLedgerState,
  event: CareLedgerEvent,
): CareLedgerState {
  switch (event.type) {
    case "COMPLETE_INTAKE": {
      const p = state.providers.find((x) => x.id === event.id);
      if (!p || p.intake === "done") return state;
      return {
        ...state,
        providers: state.providers.map((x) =>
          x.id === p.id ? { ...x, intake: "done", fresh: true } : x,
        ),
        feed: log(state.feed, "You", "completed the Zoom intake call", p.name),
      };
    }

    case "CREDENTIAL": {
      const p = state.providers.find((x) => x.id === event.id);
      if (!p || p.status === "credentialed" || p.intake !== "done") return state;
      // Credentialing a provider enables billing downstream — a billing
      // enablement request drops into the finance column behind the gate.
      const billItem: BillingItem = {
        id: nextId("b"),
        label: `Enable billing · ${p.name}`,
        detail: "payer enrollment + claims routing",
        state: "pending",
        source: "credentialing",
        learnedRule: { text: "Auto-enable billing once NPI + CAQH verify", kind: "do" },
        fresh: true,
      };
      return {
        ...state,
        providers: state.providers.map((x) =>
          x.id === p.id ? { ...x, status: "credentialed", fresh: true } : x,
        ),
        billing: [billItem, ...state.billing],
        rules: learnRule(state.rules, {
          text: "Credential only after the Zoom intake call is logged",
          kind: "do",
        }),
        feed: log(state.feed, "You", "credentialed a provider", `${p.name} · billing enabled`),
      };
    }

    case "APPROVE_BILLING": {
      const b = state.billing.find((x) => x.id === event.id);
      if (!b || b.state === "approved") return state;
      return {
        ...state,
        billing: state.billing.map((x) =>
          x.id === b.id ? { ...x, state: "approved", fresh: true } : x,
        ),
        rules: learnRule(state.rules, b.learnedRule),
        feed: log(
          state.feed,
          "You",
          b.source === "claims" ? "approved + submitted a claim batch" : "approved billing enablement",
          b.amount ? `${b.label} · ${b.amount}` : b.label,
        ),
      };
    }

    case "ADVANCE_DEAL": {
      const d = state.deals.find((x) => x.id === event.id);
      if (!d) return state;
      const idx = STAGE_ORDER.indexOf(d.stage);
      if (idx >= STAGE_ORDER.length - 1) return state; // already live
      const nextStage = STAGE_ORDER[idx + 1] as DealStage;

      // Signing (reaching "contract") sends the clinic's providers into
      // credentialing — the loop closes back to column one.
      const signing = nextStage === "contract";
      const spawnProvider: Provider | null =
        signing && d.spawns
          ? {
              id: nextId("p"),
              name: d.spawns.name,
              specialty: d.spawns.specialty,
              creds: [
                { kind: "NPI", status: "verified" },
                { kind: "License", status: "pending" },
                { kind: "DEA", status: "pending" },
                { kind: "CAQH", status: "pending" },
              ],
              intake: "scheduled",
              status: "intake",
              fresh: true,
            }
          : null;

      return {
        ...state,
        deals: state.deals.map((x) =>
          x.id === d.id ? { ...x, stage: nextStage, fresh: true } : x,
        ),
        providers: spawnProvider ? [spawnProvider, ...state.providers] : state.providers,
        rules: signing
          ? learnRule(state.rules, {
              text: "Book a Zoom discovery before moving a clinic past demo",
              kind: "do",
            })
          : state.rules,
        feed: log(
          state.feed,
          "You",
          `advanced ${d.clinic}`,
          signing
            ? `→ ${STAGE_LABEL[nextStage]} · providers sent to credentialing`
            : `→ ${STAGE_LABEL[nextStage]}`,
        ),
      };
    }

    case "DECAY_FRESH":
      return {
        ...state,
        providers: state.providers.map((p) => (p.id === event.id && p.fresh ? { ...p, fresh: false } : p)),
        billing: state.billing.map((b) => (b.id === event.id && b.fresh ? { ...b, fresh: false } : b)),
        deals: state.deals.map((d) => (d.id === event.id && d.fresh ? { ...d, fresh: false } : d)),
        rules: state.rules.map((r) => (r.id === event.id && r.fresh ? { ...r, fresh: false } : r)),
        feed: state.feed.map((f) => (f.id === event.id && f.fresh ? { ...f, fresh: false } : f)),
      };

    case "RESET":
      return createInitialCareLedgerState();

    default:
      return state;
  }
}

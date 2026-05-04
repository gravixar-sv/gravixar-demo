// Module registry, matches the 12 entries on gravixar.com/modules
// (the marketing site's productization narrative). The demo's /modules
// surface lets visitors poke at each pattern in a sandbox without
// signing into a scene. Three are interactive in the MVP, the rest
// render a "coming soon" panel.

export type ModuleStatus = "interactive" | "coming-soon";

export type ModuleCategory = "auth" | "audit" | "ai" | "finance" | "ops" | "comms";

export type DemoModule = {
  slug: string;
  title: string;
  category: ModuleCategory;
  summary: string;
  status: ModuleStatus;
  /** Where this module is running today (matches marketing case-study slugs). */
  runningIn: string[];
  /** Stack tags shown on the detail page sidebar. */
  stack: string[];
  order: number;
};

export const MODULES: DemoModule[] = [
  {
    slug: "review-state-machine",
    title: "Review State Machine",
    category: "ops",
    summary:
      "Drag a deliverable through DRAFT → INTERNAL_APPROVED → SUBMITTED_FOR_CLIENT → CLIENT_APPROVED with revision branch back into the loop. Every transition writes an audit row.",
    status: "interactive",
    runningIn: ["Broomstick Hub"],
    stack: ["TypeScript", "discriminated unions", "Prisma transactions"],
    order: 1,
  },
  {
    slug: "daily-checkin",
    title: "Daily Check-in (Office / WFH / Field)",
    category: "ops",
    summary:
      "Pick OFFICE / WFH / FIELD on first portal pageview each calendar day. Manager+ team view auto-updates. Unique constraint enforces one status per day per user.",
    status: "interactive",
    runningIn: ["Broomstick Hub", "Beeline Medical"],
    stack: ["Karachi-business-day helpers", "Prisma unique constraint"],
    order: 2,
  },
  {
    slug: "audit-log-restore",
    title: "Audit Log + Safe-Restore",
    category: "audit",
    summary:
      "Two-tier retention (CONTRACT 7y / OPERATIONAL 1y). Allowlist-gated one-click restore on UPDATE rows. Edit something here, see the audit row appear, click restore, watch the original come back.",
    status: "interactive",
    runningIn: ["Broomstick Hub", "Beeline Medical"],
    stack: ["Prisma", "Postgres"],
    order: 3,
  },
  {
    slug: "ai-intake-wizard",
    title: "AI Intake Wizard",
    category: "ai",
    summary:
      "Adaptive client intake. Visitor types one or two sentences about their business, the wizard fetches their site, drafts a brand brief the PM walks into the discovery call already holding.",
    status: "coming-soon",
    runningIn: ["Broomstick Hub"],
    stack: ["Anthropic Claude", "Vercel AI Gateway"],
    order: 4,
  },
  {
    slug: "hipaa-ai-guardrail",
    title: "HIPAA-aware AI Guardrail",
    category: "ai",
    summary:
      "Two independent defenses on every Claude call: a PHI sniffer regex pre-persistence, and a wrapper that prepends a stop-clause to every system prompt.",
    status: "coming-soon",
    runningIn: ["Beeline Medical"],
    stack: ["Anthropic Claude", "phiSniffer regex"],
    order: 5,
  },
  {
    slug: "identity-auth",
    title: "Identity & Auth",
    category: "auth",
    summary:
      "NextAuth v5 JWT with the security defaults that should be standard but usually aren't: lockout, breach-list password check, anti-enumeration, invite-only signup.",
    status: "coming-soon",
    runningIn: ["Broomstick Hub", "Beeline Medical"],
    stack: ["NextAuth v5", "bcrypt", "HIBP k-anonymity"],
    order: 6,
  },
  {
    slug: "role-permissions",
    title: "Role hierarchy + permission guards",
    category: "auth",
    summary:
      "STAFF < TEAM_LEAD < MANAGER < ADMIN role ladder plus an isSuperAdmin tier. Guards make permission errors loud and uniform.",
    status: "coming-soon",
    runningIn: ["Broomstick Hub", "Beeline Medical"],
    stack: ["TypeScript", "AuthError"],
    order: 7,
  },
  {
    slug: "multi-currency-finance",
    title: "Multi-currency finance core",
    category: "finance",
    summary:
      "Every monetary row stores native amount + native currency + an FxRateSnapshot foreign key. Reports compute against the snapshot, never live FX.",
    status: "coming-soon",
    runningIn: ["Beeline Medical"],
    stack: ["Prisma 7", "Open Exchange Rates", "decimal.js"],
    order: 8,
  },
  {
    slug: "fbr-tax-engine",
    title: "FBR + EOBI tax engine",
    category: "finance",
    summary:
      "Property-tested salary engine for Pakistan's FBR slabs and EOBI rates. Forward Gross→Net + bisection Net→Gross solver. 17/17 vitest property tests green.",
    status: "coming-soon",
    runningIn: ["Beeline Medical"],
    stack: ["vitest + fast-check", "decimal.js"],
    order: 9,
  },
  {
    slug: "credentials-tracker",
    title: "Credentials tracker with AI reminders",
    category: "ops",
    summary:
      "NPI / state license / DEA / board cert / CAQH / UK GMC / other, with 90/60/30/7-day expiry windows. AI-generated reminder copy via the HIPAA-aware wrapper.",
    status: "coming-soon",
    runningIn: ["Beeline Medical"],
    stack: ["Vercel Cron", "Anthropic Claude"],
    order: 10,
  },
  {
    slug: "leave-management",
    title: "Leave management with atomic balances",
    category: "ops",
    summary:
      "Annual / sick / unpaid / parental / bereavement leave with pro-rated entitlements for new joiners. Balance updates run inside a Prisma transaction so balances can't desync.",
    status: "coming-soon",
    runningIn: ["Broomstick Hub", "Beeline Medical"],
    stack: ["Prisma transactions", "Resend"],
    order: 11,
  },
  {
    slug: "security-watch-cron",
    title: "Daily security-watch cron",
    category: "audit",
    summary:
      "Sweeps the audit log nightly for anomalies (mass-signup spikes, DELETE bursts, stuck inquiries) and emails admins when something trips. Quiet when nothing is wrong.",
    status: "coming-soon",
    runningIn: ["Broomstick Hub"],
    stack: ["Vercel Cron", "Resend"],
    order: 12,
  },
];

export const findModule = (slug: string) =>
  MODULES.find((m) => m.slug === slug);

export const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  auth: "auth & permissions",
  audit: "audit & compliance",
  ai: "ai & guardrails",
  finance: "finance",
  ops: "operations",
  comms: "communications",
};

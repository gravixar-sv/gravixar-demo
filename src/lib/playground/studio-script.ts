// Content for the Studio Mix playground — the AI-agents console as a
// 3-column live workspace (Agents → Output → Run feed). Mirrors the
// Lattice playground pattern: trigger in column 1, result in column 2,
// every run logs to the shared feed in column 3.
//
// Outputs are realistic, deterministic mocks (no live API needed) so
// the demo works with zero keys and resets cleanly. The shape matches
// how the real agents wire up behind AI Gateway.

export type StudioAgentKey = "echo" | "pulse" | "river" | "atlas";

/** Rule shape the studio learns when a human approves or discards a draft. */
export type StudioRuleSpec = { text: string; kind: "do" | "dont" };

export type StudioAgent = {
  key: StudioAgentKey;
  name: string;
  role: string;
  /** Accent colour for the agent chip + output header. */
  color: string;
  /** One-line description of what the agent does. */
  blurb: string;
  /** Verb phrase logged to the run feed, e.g. "drafted a blog post". */
  feedAction: string;
  /** Short detail appended in the feed row. */
  feedDetail: string;
  /** Heading shown above the output in column 2. */
  outputTitle: string;
  /** Output body lines rendered in column 2 after a run. */
  outputLines: string[];
  /** Writer agents (publish/act) wait behind a human approval; read-only
   *  agents (watch/classify/review) run autonomously. */
  gated?: boolean;
  /** Rule the studio learns when a gated draft is approved. */
  approvalRule?: StudioRuleSpec;
  /** Rule the studio learns when a gated draft is discarded. */
  discardRule?: StudioRuleSpec;
};

export const STUDIO_AGENTS: StudioAgent[] = [
  {
    key: "echo",
    name: "ECHO",
    role: "SEO drafter",
    color: "#00E1FF",
    gated: true,
    blurb: "Drafts a blog post on demand, in your voice. Lands in review, never auto-published.",
    feedAction: "drafted a blog post",
    feedDetail: "“The hidden cost of almost-working ops”",
    outputTitle: "Draft · ready for review",
    outputLines: [
      "Title: The hidden cost of almost-working ops",
      "Slug: hidden-cost-of-almost-working-ops",
      "Most small teams don't have no system. They have almost a system:",
      "Notion plus a few sheets plus a Slack channel that sort of works.",
      "That word, almost, is where the real cost hides…",
      "920 words drafted · queued for human review",
    ],
    approvalRule: {
      text: "ECHO drafts in the “almost-working” voice — keep that frame on long-form",
      kind: "do",
    },
    discardRule: {
      text: "ECHO: 920-word longform overshoots ops audiences — try 500 next",
      kind: "dont",
    },
  },
  {
    key: "pulse",
    name: "PULSE",
    role: "anomaly watch",
    color: "#FFC857",
    blurb: "Sweeps the audit log for spikes, delete-bursts, and stuck states. Emails a digest if anything trips.",
    feedAction: "flagged an anomaly",
    feedDetail: "3 DELETE events in 40s on audit_log",
    outputTitle: "Anomaly flagged · needs eyes",
    outputLines: [
      "Signal: 3 DELETE events on `audit_log` within 40 seconds",
      "Actor: svc-export-worker (off-hours, 02:14 UTC)",
      "Pattern match: bulk-wipe heuristic (threshold 3 / 60s)",
      "Action taken: digest emailed to admin · no auto-remediation",
      "Severity: medium · awaiting human review",
    ],
  },
  {
    key: "river",
    name: "RIVER",
    role: "inbound classifier",
    color: "#FF2D95",
    blurb: "Classifies inbound submissions legit / suspicious / spam, with the reasoning surfaced for override.",
    feedAction: "classified an inbound message",
    feedDetail: "promo@reach-blast.io → SPAM (0.94)",
    outputTitle: "Classification · human can override",
    outputLines: [
      "From: promo@reach-blast.io",
      "Verdict: SPAM · confidence 0.94",
      "Why: bulk-sender domain, 14 identical sends, no project context",
      "Suggested: auto-archive · keep 30 days",
      "[ mark as legit ]  [ confirm spam ]",
    ],
  },
  {
    key: "atlas",
    name: "ATLAS",
    role: "content reviewer",
    color: "#7C7CFF",
    blurb: "Reads a draft against your style guide, flags voice mismatches, suggests edits. A second opinion, not a gate.",
    feedAction: "reviewed a draft",
    feedDetail: "2 voice mismatches in “Q2 launch post”",
    outputTitle: "Review · 2 flags, 0 blockers",
    outputLines: [
      "Draft: Q2 launch post (by ECHO)",
      "Flag 1: “leverage” used as a verb (banned in style guide)",
      "Flag 2: passive voice in paragraph 2, suggest active rewrite",
      "Tone: on-brand · reading level: grade 8 (target 7 to 9) ✓",
      "Verdict: ship after 2 small edits · not a publish blocker",
    ],
  },
];

export function findStudioAgent(key: string): StudioAgent | undefined {
  return STUDIO_AGENTS.find((a) => a.key === key);
}

// Seed rows for the run feed (offsets in ms behind "now" at first render).
export type StudioSeedEntry = {
  id: string;
  offsetMs: number;
  actor: string;
  action: string;
  detail?: string;
};

export const STUDIO_FEED_SEED: StudioSeedEntry[] = [
  {
    id: "sseed-1",
    offsetMs: 120_000,
    actor: "PULSE",
    action: "ran nightly sweep",
    detail: "0 anomalies · 4,210 rows scanned",
  },
  {
    id: "sseed-2",
    offsetMs: 300_000,
    actor: "ECHO",
    action: "drafted a blog post",
    detail: "“Why I refuse to ship slides”",
  },
];

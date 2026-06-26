// Scene registry. The entry screen (self-explaining scene index) and
// each scene layout read this. Plain-English fields (whatItIs, tryLine,
// openLabel) power the scene-index cards so a first-time visitor knows
// exactly what each scene is, who it's for, and what they'll do —
// per the NN/g information-scent + "link is a promise" findings.

export type SceneStatus = "live" | "coming-online";
export type ScenePersona = "agency" | "founders" | "brand" | "healthcare";

export type Scene = {
  slug: string;
  name: string;
  /** Original codename, kept as a small secondary tag for brand flavour
   *  (e.g. "Agency OS · Lattice"). The descriptive `name` is primary. */
  codename?: string;
  tagline: string;
  description: string;
  bucket: "operations" | "ai" | "brand" | "healthcare";
  status: SceneStatus;
  /** The audience persona this scene is built for. */
  persona: ScenePersona;
  /** Display label for the persona — shown as a "for X" tag on the card. */
  personaLabel: string;
  /** Plain-English "what this is" subtitle. Sits next to the branded
   *  scene name so the jargon name is never unexplained. */
  whatItIs: string;
  /** One concrete line: what the visitor can actually do in this scene. */
  tryLine: string;
  /** Action-button label, scene-specific ("Open the portal" etc.). */
  openLabel: string;
  /** The visitor's pain this scene addresses (kept for reference / SEO). */
  problemStatement: string;
  /** Tailwind utility class that applies the scene's CSS-var overrides. */
  paletteClass: string;
  /** Background gradient utility name (defined in globals.css). */
  bgUtility: string;
  /** Display font label, informational, the actual font wires in the layout. */
  displayFont: "fraunces" | "jetbrains" | "inter";
  /** Pretty palette swatches shown on the gallery card. */
  swatches: [string, string, string];
};

export const SCENES: Scene[] = [
  {
    slug: "lattice",
    name: "Agency OS",
    codename: "Lattice",
    tagline: "The operating system a real agency runs on, end to end.",
    description:
      "The full operating system behind a working agency: scoped projects, a deliverable review loop, invoicing and payment requests, partner commissions, leave and WFH, and AI-assisted feedback triage. Every state change is gated and audited.",
    bucket: "operations",
    status: "live",
    persona: "agency",
    personaLabel: "agencies",
    whatItIs: "The operating system a real agency runs on",
    tryLine: "Deliverable review, invoicing, commissions and leave, all gated",
    openLabel: "Open the OS",
    problemStatement:
      "Your agency runs on five tools and a dozen spreadsheets.",
    paletteClass: "scene-lattice",
    bgUtility: "bg-lattice",
    displayFont: "fraunces",
    swatches: ["#0a1230", "#FF6B6B", "#F5E6D3"],
  },
  {
    slug: "studio-mix",
    name: "Agent Console",
    codename: "Studio Mix",
    tagline: "The supervised AI layer we ship, on the Claude API, behind a human gate.",
    description:
      "The real AI layer we put into a client's ops: content drafting, candidate and inbound assessment, feedback triage, anomaly watch. Built on the Claude API. Read-only agents run on their own; anything that writes, spends, or publishes waits behind a human.",
    bucket: "ai",
    status: "live",
    persona: "founders",
    personaLabel: "ops & technical teams",
    whatItIs: "A supervised AI-agent console on the Claude API",
    tryLine: "Drafting, screening and triage, every write behind a human gate",
    openLabel: "Open the console",
    problemStatement:
      "Your AI tooling is impressive in demos, invisible in production.",
    paletteClass: "scene-studio-mix",
    bgUtility: "bg-studio-mix",
    displayFont: "jetbrains",
    swatches: ["#070a14", "#00E1FF", "#FF2D95"],
  },
  {
    slug: "cockpit",
    name: "Founder Cockpit",
    codename: "Driftwood",
    tagline: "A solo founder's run-the-business cockpit.",
    description:
      "The daily-ops cockpit for a one-person business: AI triages the inbox overnight, surfaces what needs you today, and watches the money. You just approve. Inbox → Today → Money, in one view.",
    bucket: "operations",
    status: "live",
    persona: "founders",
    personaLabel: "founders & small teams",
    whatItIs: "A run-the-business cockpit for a solo founder",
    tryLine: "Inbox triage → today's priorities → cash flow, in one view",
    openLabel: "Open the cockpit",
    problemStatement: "You're CEO, support, and bookkeeper before lunch.",
    paletteClass: "scene-cockpit",
    bgUtility: "bg-cockpit",
    displayFont: "inter",
    swatches: ["#14110a", "#FBBF24", "#FB923C"],
  },
  {
    slug: "northbeam",
    name: "Brand Guardian",
    codename: "Northbeam",
    tagline: "A brand agent that drafts on-brand, blocks drift, and learns your rules.",
    description:
      "A brand agent for a DTC team: hand it a brief, it drafts the asset on-brand; ask for something off-brand and it stops at the guardrail; every approval teaches it a new do/don't. Showcases the Brand & Visuals service.",
    bucket: "brand",
    status: "live",
    persona: "brand",
    personaLabel: "brands & DTC",
    whatItIs: "A brand agent for a DTC team",
    tryLine: "Brief → on-brand draft → you approve → it learns the rule",
    openLabel: "Open the workspace",
    problemStatement:
      "Everyone makes assets; staying on-brand is the bottleneck.",
    paletteClass: "scene-northbeam",
    bgUtility: "bg-northbeam",
    displayFont: "fraunces",
    swatches: ["#1a2614", "#9DBE6E", "#F2DDC1"],
  },
  {
    slug: "care-ledger",
    name: "Billing & Credentialing",
    codename: "Care Ledger",
    tagline: "A HIPAA-conscious medical-billing portal, with PHI kept out by design.",
    description:
      "A medical-billing and credentialing portal for a clinic network: provider credentialing intake (NPI, license, DEA, CAQH) with a Zoom intake call, finance and claims behind an approval gate, and a clinic sales pipeline. No PHI in the portal, isolated by design. Every action is gated and audited.",
    bucket: "healthcare",
    status: "live",
    persona: "healthcare",
    personaLabel: "healthcare & billing",
    whatItIs: "A medical billing & credentialing portal",
    tryLine: "Credential a provider → enable billing → close the clinic deal",
    openLabel: "Open the portal",
    problemStatement:
      "Credentialing, claims, and new clinics live in three disconnected tools.",
    paletteClass: "scene-care-ledger",
    bgUtility: "bg-care-ledger",
    displayFont: "inter",
    swatches: ["#06141a", "#2DD4BF", "#7DD3FC"],
  },
  {
    slug: "verus",
    name: "Verus Partners",
    tagline: "Professional services intake, AI brief from the start.",
    description:
      "Adaptive AI intake wizard, brand brief generation from a website URL, discovery-booking flow. Showcases AI Tooling end-to-end.",
    bucket: "ai",
    status: "coming-online",
    persona: "founders",
    personaLabel: "founders & product teams",
    whatItIs: "An AI intake wizard for professional services",
    tryLine: "Adaptive intake that writes the brief for you",
    openLabel: "Open the wizard",
    problemStatement:
      "Your AI tooling is impressive in demos, invisible in production.",
    paletteClass: "scene-verus",
    bgUtility: "bg-gallery",
    displayFont: "fraunces",
    swatches: ["#1a0f1f", "#C9A227", "#7E5BEF"],
  },
];

export function findScene(slug: string): Scene | undefined {
  return SCENES.find((s) => s.slug === slug);
}

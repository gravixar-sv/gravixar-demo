// Scene registry. The entry screen (self-explaining scene index) and
// each scene layout read this. Plain-English fields (whatItIs, tryLine,
// openLabel) power the scene-index cards so a first-time visitor knows
// exactly what each scene is, who it's for, and what they'll do —
// per the NN/g information-scent + "link is a promise" findings.

export type SceneStatus = "live" | "coming-online";
export type ScenePersona = "agency" | "founders" | "brand";

export type Scene = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  bucket: "operations" | "ai" | "brand";
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
    name: "Lattice Studio",
    tagline: "A creative studio's client portal, built by Gravixar.",
    description:
      "Editorial-magazine portal for an agency. Client view, PM view, admin view, designer view. Real review state machine, real audit log, real chat.",
    bucket: "operations",
    status: "live",
    persona: "agency",
    personaLabel: "agencies",
    whatItIs: "A client portal for a creative agency",
    tryLine: "Approvals, briefs, and delivery in one place",
    openLabel: "Open the portal",
    problemStatement:
      "Your clients live in Slack threads and shared spreadsheets.",
    paletteClass: "scene-lattice",
    bgUtility: "bg-lattice",
    displayFont: "fraunces",
    swatches: ["#0a1230", "#FF6B6B", "#F5E6D3"],
  },
  {
    slug: "studio-mix",
    name: "Studio Mix",
    tagline: "Live AI agents, content, anomaly, classifier, review.",
    description:
      "Operator-console sandbox. Four agents you can poke: ECHO drafts content, PULSE flags anomalies, RIVER classifies inbound, ATLAS reviews drafts.",
    bucket: "ai",
    status: "live",
    persona: "founders",
    personaLabel: "ops & technical teams",
    whatItIs: "A supervised AI-agents console",
    tryLine: "Drafters, watchers & classifiers under a human approval queue",
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
    name: "Driftwood",
    tagline: "A solo founder's run-the-business cockpit.",
    description:
      "The morning brief for a one-person business: AI triages the inbox, surfaces what needs you today, and watches the money, you just approve.",
    bucket: "operations",
    status: "live",
    persona: "founders",
    personaLabel: "founders & small teams",
    whatItIs: "A run-my-business cockpit for a solo founder",
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
    name: "Northbeam Goods",
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

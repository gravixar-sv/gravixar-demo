// Scene registry. The entry screen and gallery both read this. Each
// scene has its own URL prefix, palette tokens, display font, and
// visitor copy. The `persona` and `problemStatement` fields power
// the identity-fork entry screen (Session 1 redesign).

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
  /** Display label for the persona on the identity-fork entry screen. */
  personaLabel: string;
  /** The visitor's pain this scene addresses — shown on the entry tile. */
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
    personaLabel: "Agency",
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
    personaLabel: "Founders & Product",
    problemStatement:
      "Your AI tooling is impressive in demos, invisible in production.",
    paletteClass: "scene-studio-mix",
    bgUtility: "bg-studio-mix",
    displayFont: "jetbrains",
    swatches: ["#070a14", "#00E1FF", "#FF2D95"],
  },
  {
    slug: "northbeam",
    name: "Northbeam Goods",
    tagline: "DTC brand admin, Amazon A+, motion review, brand system.",
    description:
      "Brand-system browser, Amazon A+ workflow with side-by-side compare, motion graphics review queue. Showcases the Brand & Visuals service.",
    bucket: "brand",
    status: "coming-online",
    persona: "brand",
    personaLabel: "Brand & DTC",
    problemStatement:
      "Your campaign ops are scattered across six tools none of your team fully knows.",
    paletteClass: "scene-northbeam",
    bgUtility: "bg-gallery",
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
    personaLabel: "Founders & Product",
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

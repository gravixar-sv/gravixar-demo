// The route table. One entry per prerendered page: the prerender walks
// it to write dist/<path>.html, the client matches location.pathname
// against it to pick the page to hydrate, and the dev server uses the
// same match. `src` names the page module so the prerender can preload
// its chunk from the build manifest.

import type { ComponentType } from "react";
import { MODULES } from "@/lib/modules";
import { findScene } from "@/lib/scenes";

export type RouteDef = {
  path: string;
  title: string;
  description: string;
  /** Social card image, site-relative. */
  image?: string;
  /** Page module, relative to the repo root, as the build manifest keys it. */
  src: string;
  load: () => Promise<ComponentType>;
};

const SITE_DESCRIPTION =
  "Five working apps with sample data. AI drafts, a human approves, the agent learns your rules. Open a scene and run the loop yourself. No signup.";

function sceneRoute(
  slug: string,
  src: string,
  load: () => Promise<{ default: ComponentType }>,
): RouteDef {
  const scene = findScene(slug);
  if (!scene) throw new Error(`routes: unknown scene ${slug}`);
  return {
    path: `/${slug}`,
    title: `${scene.name}, ${scene.codename}: Gravixar demo`,
    description: `${scene.whatItIs}. ${scene.tryLine}. Working software on sample data, no signup.`,
    image: `/scenes/${slug}.png`,
    src,
    load: () => load().then((m) => m.default),
  };
}

export const ROUTES: RouteDef[] = [
  {
    path: "/",
    title: "Gravixar Demo: AI does the work, you hold the gate",
    description: SITE_DESCRIPTION,
    image: "/scenes/lattice.png",
    src: "src/pages/Home.tsx",
    load: () => import("@/pages/Home").then((m) => m.default),
  },
  sceneRoute("lattice", "src/pages/scenes/Lattice.tsx", () => import("@/pages/scenes/Lattice")),
  sceneRoute("studio-mix", "src/pages/scenes/StudioMix.tsx", () => import("@/pages/scenes/StudioMix")),
  sceneRoute("cockpit", "src/pages/scenes/Cockpit.tsx", () => import("@/pages/scenes/Cockpit")),
  sceneRoute("northbeam", "src/pages/scenes/Northbeam.tsx", () => import("@/pages/scenes/Northbeam")),
  sceneRoute("care-ledger", "src/pages/scenes/CareLedger.tsx", () => import("@/pages/scenes/CareLedger")),
  {
    path: "/modules",
    title: "Modules: Gravixar demo",
    description:
      "The patterns I reuse across builds, running in production. Three of them have a sandbox you can press.",
    src: "src/pages/modules/ModulesIndex.tsx",
    load: () => import("@/pages/modules/ModulesIndex").then((m) => m.default),
  },
  ...MODULES.map<RouteDef>((m) => ({
    path: `/modules/${m.slug}`,
    title: `${m.title}: Gravixar demo modules`,
    description: m.summary,
    src: "src/pages/modules/ModuleDetail.tsx",
    load: () =>
      import("@/pages/modules/ModuleDetail").then(({ default: ModuleDetail }) => {
        const Bound = () => <ModuleDetail slug={m.slug} />;
        return Bound;
      }),
  })),
];

export const NOT_FOUND: RouteDef = {
  path: "/404",
  title: "Not found: Gravixar demo",
  description: SITE_DESCRIPTION,
  src: "src/pages/NotFound.tsx",
  load: () => import("@/pages/NotFound").then((m) => m.default),
};

/** Normalise a pathname: no trailing slash, no `.html`, lower case. */
export function normalisePath(pathname: string): string {
  const p = pathname.replace(/\.html$/, "").replace(/\/index$/, "").replace(/\/+$/, "");
  return (p || "/").toLowerCase();
}

export function matchRoute(pathname: string): RouteDef {
  const path = normalisePath(pathname);
  if (path === "/tour") return ROUTES[0]!;
  return ROUTES.find((r) => r.path === path) ?? NOT_FOUND;
}

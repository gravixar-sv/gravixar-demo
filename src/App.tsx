import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { DemoBanner } from "@/components/demo/DemoBanner";
import { useSpotlight } from "@/lib/interactions";

// The document body every page shares: the sandbox banner, the page,
// and Vercel's analytics beacons. Rendered identically on the server
// (prerender) and the client (hydrate).
export function App({ path, children }: { path: string; children: ReactNode }) {
  useSpotlight();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-ink-50 focus:px-3 focus:py-2 focus:text-sm focus:text-ink-950"
      >
        Skip to content
      </a>
      <DemoBanner />
      {children}
      <Analytics />
      <SpeedInsights route={path} />
    </>
  );
}

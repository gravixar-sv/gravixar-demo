import type { CSSProperties, ReactNode } from "react";
import { Topbar } from "@/components/demo/Topbar";
import { SiteFooter } from "@/components/demo/SiteFooter";

// The /modules surfaces: the site header, a neutral warm accent (each
// widget carries its own colour inside), and the footer.
const MODULE_TOKENS = {
  "--color-scene-1": "#FF8A5C",
  "--color-scene-2": "#FAFAFA",
  "--color-scene-glow": "rgba(255, 138, 92, 0.30)",
} as CSSProperties;

export function ModulesLayout({ children }: { children: ReactNode }) {
  return (
    <div style={MODULE_TOKENS} className="scene-ground min-h-dvh">
      <Topbar current="modules" />
      <main id="main" className="mx-auto max-w-[1440px] px-4 pb-24 pt-12 sm:px-6 md:pt-16 lg:px-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

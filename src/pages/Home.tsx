import type { CSSProperties } from "react";
import { Topbar } from "@/components/demo/Topbar";
import { SiteFooter } from "@/components/demo/SiteFooter";
import { Hero } from "@/components/home/Hero";
import { LoopSection } from "@/components/home/LoopSection";
import { SceneGallery } from "@/components/home/SceneGallery";
import { ProofStrip } from "@/components/home/ProofStrip";

// The index is a story in four sections: the thesis drawn live (hero
// over the gate field), the scene portals, the loop told beat by beat,
// and the production-proof close. The index's own accent is the gate's
// coral; each scene card carries its scene's colour.
const HOME_TOKENS = {
  "--color-scene-1": "#FF6B5E",
  "--color-scene-2": "#F5E6D3",
  "--color-scene-glow": "rgba(255, 107, 94, 0.34)",
} as CSSProperties;

export default function HomePage() {
  return (
    <div style={HOME_TOKENS}>
      <Topbar current="home" />
      <main id="main">
        <Hero />
        <SceneGallery />
        <LoopSection />
        <ProofStrip />
      </main>
      <SiteFooter />
    </div>
  );
}

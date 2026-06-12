import type { Metadata } from "next";
import { Topbar } from "@/components/demo/Topbar";
import { Hero } from "@/components/home/Hero";
import { LoopSection } from "@/components/home/LoopSection";
import { SceneGallery } from "@/components/home/SceneGallery";
import { ProofStrip } from "@/components/home/ProofStrip";

export const metadata: Metadata = {
  title: "Gravixar Demo: AI does the work, you hold the gate",
  description:
    "Four working apps with sample data. AI drafts, a human approves, the agent learns your rules. Open a scene and run the loop yourself. No signup.",
};

// The index is a story in four sections: the thesis drawn live (hero
// over the gate field), the loop told beat by beat, the four scene
// portals, and the production-proof close.
export default function HomePage() {
  return (
    <div className="bg-[#050508]">
      <Topbar home />
      <Hero />
      <LoopSection />
      <SceneGallery />
      <ProofStrip />
    </div>
  );
}

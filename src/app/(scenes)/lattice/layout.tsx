import type { Metadata } from "next";
import { Topbar } from "@/components/demo/Topbar";
import { findScene } from "@/lib/scenes";

const SCENE = findScene("lattice")!;

export const metadata: Metadata = {
  title: `${SCENE.name}, Gravixar demo`,
};

// The Lattice scene is now the 3-column playground (a self-contained
// client component with its own reducer + reset). No signed-in persona,
// so the layout just provides the scene chrome + background.
export default function LatticeSceneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-lattice min-h-[calc(100dvh-40px)]"
      style={
        {
          "--color-scene-1": "#FF6B6B",
          "--color-scene-2": "#F5E6D3",
          "--color-scene-glow": "rgba(255, 107, 107, 0.35)",
        } as React.CSSProperties
      }
    >
      <Topbar sceneName={SCENE.name} showReset={false} />
      {children}
    </div>
  );
}

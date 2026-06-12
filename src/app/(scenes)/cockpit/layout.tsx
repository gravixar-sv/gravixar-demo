import type { Metadata } from "next";
import { Topbar } from "@/components/demo/Topbar";
import { findScene } from "@/lib/scenes";

const SCENE = findScene("cockpit")!;

export const metadata: Metadata = {
  title: `${SCENE.name}, Gravixar demo`,
};

// Founder Cockpit — a self-contained client-side playground. Scene
// chrome + warm amber background.
export default function CockpitSceneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-cockpit min-h-[calc(100dvh-40px)]"
      style={
        {
          "--color-scene-1": "#FBBF24",
          "--color-scene-2": "#FB923C",
          "--color-scene-glow": "rgba(251, 191, 36, 0.35)",
        } as React.CSSProperties
      }
    >
      <Topbar sceneName={SCENE.name} />
      <main>{children}</main>
    </div>
  );
}

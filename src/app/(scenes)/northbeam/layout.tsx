import type { Metadata } from "next";
import { Topbar } from "@/components/demo/Topbar";
import { findScene } from "@/lib/scenes";

const SCENE = findScene("northbeam")!;

export const metadata: Metadata = {
  title: `${SCENE.name}, Gravixar demo`,
};

// Northbeam — brand-governance playground. Self-contained client state.
export default function NorthbeamSceneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-northbeam min-h-[calc(100dvh-40px)]"
      style={
        {
          "--color-scene-1": "#9DBE6E",
          "--color-scene-2": "#F2DDC1",
          "--color-scene-glow": "rgba(157, 190, 110, 0.35)",
        } as React.CSSProperties
      }
    >
      <Topbar sceneName={SCENE.name} />
      <main>{children}</main>
    </div>
  );
}

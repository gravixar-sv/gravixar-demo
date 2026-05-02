import type { Metadata } from "next";
import { Topbar } from "@/components/demo/Topbar";
import { findScene } from "@/lib/scenes";

const SCENE = findScene("studio-mix")!;

export const metadata: Metadata = {
  title: `${SCENE.name} — Gravixar demo`,
};

export default function StudioMixLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-studio-mix min-h-[calc(100dvh-40px)] font-mono"
      style={
        {
          "--color-scene-1": "#00E1FF",
          "--color-scene-2": "#FF2D95",
          "--color-scene-glow": "rgba(0, 225, 255, 0.35)",
        } as React.CSSProperties
      }
    >
      <Topbar sceneName={SCENE.name} personaLabel="operator console" />
      {children}
    </div>
  );
}

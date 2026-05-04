import type { Metadata } from "next";
import { Topbar } from "@/components/demo/Topbar";

export const metadata: Metadata = {
  title: "Modules, Gravixar demo",
};

export default function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-gallery min-h-[calc(100dvh-40px)]"
      style={
        {
          // Neutral platform palette for the modules surface, the brand
          // accent is muted on purpose so each widget can carry its own
          // accent without clashing.
          "--color-scene-1": "#FF6B35",
          "--color-scene-2": "#FAFAFA",
          "--color-scene-glow": "rgba(255, 107, 53, 0.30)",
        } as React.CSSProperties
      }
    >
      <Topbar sceneName="Modules" showReset={false} />
      {children}
    </div>
  );
}

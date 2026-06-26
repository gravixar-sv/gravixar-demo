import type { Metadata } from "next";
import { Topbar } from "@/components/demo/Topbar";
import { findScene } from "@/lib/scenes";

const SCENE = findScene("care-ledger")!;

export const metadata: Metadata = {
  title: `${SCENE.name}, Gravixar demo`,
};

// Care Ledger — a self-contained client-side playground. Scene chrome +
// clinical teal background. No PHI, no backend, no auth (stateless).
export default function CareLedgerSceneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-care-ledger min-h-[calc(100dvh-40px)]"
      style={
        {
          "--color-scene-1": "#2DD4BF",
          "--color-scene-2": "#7DD3FC",
          "--color-scene-glow": "rgba(45, 212, 191, 0.35)",
        } as React.CSSProperties
      }
    >
      <Topbar sceneName={SCENE.name} personaLabel={SCENE.codename} />
      <main>{children}</main>
    </div>
  );
}

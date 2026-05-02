import type { Metadata } from "next";
import { Topbar } from "@/components/demo/Topbar";
import { findScene } from "@/lib/scenes";
import { findLatticePersona } from "@/lib/personas/lattice";
import { getActivePersonaId } from "@/lib/demo/session";

const SCENE = findScene("lattice")!;

export const metadata: Metadata = {
  title: `${SCENE.name} — Gravixar demo`,
};

export default async function LatticeSceneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const personaId = await getActivePersonaId();
  const persona = personaId ? findLatticePersona(personaId) : null;

  return (
    <div
      className="bg-lattice min-h-[calc(100dvh-40px)]"
      style={
        {
          // Per-scene CSS variables override the theme defaults. Tailwind
          // utilities like text-scene / bg-scene read from these.
          "--color-scene-1": "#FF6B6B",
          "--color-scene-2": "#F5E6D3",
          "--color-scene-glow": "rgba(255, 107, 107, 0.35)",
        } as React.CSSProperties
      }
    >
      <Topbar
        sceneName={SCENE.name}
        personaLabel={persona ? `${persona.name} · ${persona.role}` : undefined}
      />
      {children}
    </div>
  );
}

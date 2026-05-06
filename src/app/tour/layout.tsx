import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "60-second tour, Gravixar demo",
  description:
    "A guided 60-second walk-through of a working client portal — three roles, one system, one audit trail.",
};

export default function TourLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-[calc(100dvh-40px)]"
      style={
        {
          // Lattice palette, used because the tour is set inside an
          // agency portal (the same fictional Lattice Studio).
          "--color-scene-1": "#FF6B6B",
          "--color-scene-2": "#F5E6D3",
          "--color-scene-glow": "rgba(255, 107, 107, 0.35)",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

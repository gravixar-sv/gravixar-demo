"use client";

// Faux browser-chrome wrapper for the persona-view panel. Shows the
// persona's email + a fake URL bar so visitors feel they're "logged in
// as that person" rather than reading a wireframe.

import { TOUR_AGENCY, type TourPersonaScript } from "@/lib/tour/script";

type Props = {
  persona: TourPersonaScript;
  children: React.ReactNode;
};

export function PersonaChrome({ persona, children }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur">
      <div className="flex items-center gap-3 border-b border-white/5 bg-black/40 px-4 py-2.5">
        <div
          aria-hidden
          className="flex items-center gap-1.5"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" />
        </div>
        <div className="hidden flex-1 items-center justify-center gap-2 sm:flex">
          <span className="rounded-md border border-white/10 bg-black/40 px-3 py-1 font-mono text-[10px] tracking-tight text-zinc-400">
            {TOUR_AGENCY.studioName.toLowerCase().replace(/\s+/g, "")}.app/{persona.role.toLowerCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 sm:inline">
            {persona.email}
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-scene-1)] to-[var(--color-scene-2)] font-mono text-[9px] font-medium text-[#0a1230]">
            {persona.initials}
          </span>
        </div>
      </div>
      <div className="px-5 py-6 md:px-7 md:py-8">{children}</div>
    </div>
  );
}

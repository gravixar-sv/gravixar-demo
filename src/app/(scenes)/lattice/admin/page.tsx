import { redirect } from "next/navigation";
import { findLatticePersona } from "@/lib/personas/lattice";
import { getActivePersonaId } from "@/lib/demo/session";

export default async function LatticeAdmin() {
  const personaId = await getActivePersonaId();
  const persona = personaId ? findLatticePersona(personaId) : null;
  if (!persona) redirect("/lattice");

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-12 md:px-10 lg:px-16">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-scene-1)]">
        admin console
      </p>
      <h1 className="mt-4 font-display-serif text-4xl font-light tracking-tight md:text-5xl">
        Studio operations — {persona.name.split(" ")[0]}.
      </h1>
      <p className="mt-12 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
        ⚠ audit log + presence dashboard come online with the data layer · placeholder route
      </p>
    </div>
  );
}

// Lattice Studio personas. These names are intentionally globally-placeable
// (no obvious regional pin) and distinct from any real client, Gravixar's
// demo never reuses Broomstick's Casey/Anri/Fahad names.

export type LatticePersona = {
  id: string;
  name: string;
  role: "client" | "pm" | "admin" | "designer";
  title: string;
  blurb: string;
  /** Initials for the avatar fallback. */
  initials: string;
  /** Default landing path inside /lattice after persona-pick. */
  landing: string;
};

export const LATTICE_PERSONAS: LatticePersona[] = [
  {
    id: "mira-voss",
    name: "Mira Voss",
    role: "client",
    title: "Client, Active project",
    blurb:
      "Logged in as the founder of a B2B brand mid-rebrand. Two deliverables waiting on her review.",
    initials: "MV",
    landing: "/lattice/dashboard",
  },
  {
    id: "kai-render",
    name: "Kai Render",
    role: "pm",
    title: "Project Manager",
    blurb:
      "Logged in as the assigned PM. Two inquiries in the inbox, three projects in flight, one scope to lock today.",
    initials: "KR",
    landing: "/lattice/inbox",
  },
  {
    id: "nox-bellini",
    name: "Nox Bellini",
    role: "admin",
    title: "Admin, Studio operations",
    blurb:
      "Logged in as the operations admin. Sees every project, the audit log, presence dashboard, and the daily security-watch digest.",
    initials: "NB",
    landing: "/lattice/admin",
  },
  {
    id: "sage-holloway",
    name: "Sage Holloway",
    role: "designer",
    title: "Designer, Senior",
    blurb:
      "Logged in as a senior designer. Personal task list, one deliverable to upload, one revision to address.",
    initials: "SH",
    landing: "/lattice/tasks",
  },
];

export function findLatticePersona(id: string): LatticePersona | undefined {
  return LATTICE_PERSONAS.find((p) => p.id === id);
}

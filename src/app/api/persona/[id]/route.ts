// Persona switch handler. POST a form here with persona id + redirect path.
// Sets the persona cookie, redirects into the scene's landing page.
//
// When real auth lands (after Postgres is provisioned), this becomes
// a NextAuth signIn() under the hood. Surface stays the same.

import { NextResponse } from "next/server";
import { findLatticePersona } from "@/lib/personas/lattice";
import { setActivePersona } from "@/lib/demo/session";

export const runtime = "nodejs";

const PERSONA_REGISTRY: Array<{
  match: (id: string) => boolean;
  defaultLanding: (id: string) => string;
}> = [
  {
    match: (id) => !!findLatticePersona(id),
    defaultLanding: (id) => findLatticePersona(id)?.landing ?? "/lattice",
  },
];

async function handle(req: Request, params: Promise<{ id: string }>) {
  const { id } = await params;

  const known = PERSONA_REGISTRY.find((reg) => reg.match(id));
  if (!known) {
    return NextResponse.json({ error: "unknown_persona" }, { status: 404 });
  }

  // form-encoded redirect override; otherwise the persona's default landing
  let redirectTo = known.defaultLanding(id);
  try {
    const form = await req.formData();
    const r = form.get("redirect");
    if (typeof r === "string" && r.startsWith("/")) redirectTo = r;
  } catch {
    // body wasn't form-encoded; fine, use default landing
  }

  await setActivePersona(id);
  return NextResponse.redirect(new URL(redirectTo, req.url), 303);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return handle(req, ctx.params);
}

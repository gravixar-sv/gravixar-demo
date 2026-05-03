// Persona switch handler. POST a form here with persona id + redirect path.
// Calls NextAuth signIn() to start a real signed-in session, then
// redirects into the persona's landing.

import { NextResponse } from "next/server";
import { findLatticePersona } from "@/lib/personas/lattice";
import { signIn } from "@/lib/auth";

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

  // signIn() with redirectTo handles the cookie + redirect for us.
  // It throws a NEXT_REDIRECT under the hood; we let that propagate.
  await signIn("credentials", {
    personaId: id,
    redirectTo,
  });

  // Unreachable — signIn throws a redirect — but the type system
  // wants something here.
  return NextResponse.redirect(new URL(redirectTo, req.url), 303);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  return handle(req, ctx.params);
}

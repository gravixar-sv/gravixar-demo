// Demo session helpers. Sits on top of NextAuth, server components and
// route handlers call getActivePersona() to get the signed-in persona's
// id and role.

import { auth } from "@/lib/auth";

export async function getActivePersonaId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.personaId ?? null;
}

export async function getActiveSession() {
  return auth();
}

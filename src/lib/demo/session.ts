// Lightweight persona session for the demo. Real NextAuth integration
// lands when Postgres is provisioned — for now, picking a persona just
// sets a signed cookie that scene layouts read on the server.
//
// The real auth pattern (lifted from bs-hub) replaces this when we wire
// the DB. The gateway through env.GRAVIXAR_DEMO_MODE keeps the
// surface small enough that swap is mechanical.

import { cookies } from "next/headers";

export const PERSONA_COOKIE = "gravixar_persona";

/** Server-side: read the active persona id from the cookie. */
export async function getActivePersonaId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(PERSONA_COOKIE)?.value ?? null;
}

/** Server-side: set persona cookie. Called from the persona route handler. */
export async function setActivePersona(personaId: string): Promise<void> {
  const jar = await cookies();
  jar.set(PERSONA_COOKIE, personaId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // 24h — demo sessions don't need to persist longer than a single visit
    maxAge: 60 * 60 * 24,
  });
}

/** Clear the persona cookie. */
export async function clearActivePersona(): Promise<void> {
  const jar = await cookies();
  jar.delete(PERSONA_COOKIE);
}

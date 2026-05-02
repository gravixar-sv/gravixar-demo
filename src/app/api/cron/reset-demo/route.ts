// Weekly reset cron stub. Wired in vercel.ts (Sunday 03:00 UTC).
//
// When Postgres is provisioned this calls into prisma/seed.ts to wipe
// + reseed. For now it short-circuits — endpoint exists so the cron
// schedule is valid in vercel.ts and so we have a single place to wire
// the real implementation later.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  // TODO(after-db): import { resetDemo } from "@/lib/demo/reset" — wipes
  // tables in dependency-safe order, then runs prisma/seed.ts.
  return NextResponse.json({
    ok: true,
    note: "reset endpoint reachable; database wiring lands after Neon provisioning",
    ranAt: new Date().toISOString(),
  });
}

// Weekly reset cron. Wired in vercel.ts (Sunday 03:00 UTC).
// Calls the shared wipeAndReseedDemo() so the same data the seed
// script writes is what visitors see after each reset.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { wipeAndReseedDemo } from "@/lib/demo/reset-data";

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

  const start = Date.now();
  const counts = await wipeAndReseedDemo(prisma);
  const elapsedMs = Date.now() - start;

  return NextResponse.json({
    ok: true,
    elapsedMs,
    ranAt: new Date().toISOString(),
    counts,
    note: "demo state reset to canonical seed",
  });
}

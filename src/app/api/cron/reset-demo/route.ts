// Weekly reset cron. Wired in vercel.ts (Sunday 03:00 UTC).
//
// Spawns the seed script's logic directly — wipes every demo table,
// reseeds canonical state. Idempotent — safe to re-run any time.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

  // Wipe in dependency-safe order
  await prisma.agentRun.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.inquiryMessage.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Reseed by importing the seed module's main() function path. We
  // inline a minimal reseed here rather than importing prisma/seed.ts
  // so the bundler doesn't try to pull node-only seed tooling into the
  // function bundle.
  const mira = await prisma.user.create({
    data: { personaId: "mira-voss", name: "Mira Voss", email: "mira@voss.demo", role: "CLIENT" },
  });
  const kai = await prisma.user.create({
    data: { personaId: "kai-render", name: "Kai Render", email: "kai@lattice.demo", role: "PM" },
  });
  const nox = await prisma.user.create({
    data: { personaId: "nox-bellini", name: "Nox Bellini", email: "nox@lattice.demo", role: "ADMIN" },
  });
  const sage = await prisma.user.create({
    data: { personaId: "sage-holloway", name: "Sage Holloway", email: "sage@lattice.demo", role: "DESIGNER" },
  });

  const vossCo = await prisma.client.create({
    data: { userId: mira.id, company: "Voss & Co", industry: "B2B Brand" },
  });

  const brandRefresh = await prisma.project.create({
    data: {
      name: "Brand refresh — Q2",
      status: "IN_REVIEW",
      clientId: vossCo.id,
      pmId: kai.id,
      clientUserId: mira.id,
    },
  });
  await prisma.task.createMany({
    data: [
      { title: "Logo direction — round 2", reviewState: "SUBMITTED_FOR_CLIENT", projectId: brandRefresh.id, assigneeId: sage.id },
      { title: "Color system + typography pairings", reviewState: "SUBMITTED_FOR_CLIENT", projectId: brandRefresh.id, assigneeId: sage.id },
      { title: "Brand guidelines draft", reviewState: "SUBMITTED_FOR_INTERNAL", projectId: brandRefresh.id, assigneeId: sage.id },
    ],
  });

  const reelSeries = await prisma.project.create({
    data: {
      name: "Reel series — May launch",
      status: "ACTIVE",
      clientId: vossCo.id,
      pmId: kai.id,
      clientUserId: mira.id,
    },
  });
  await prisma.task.createMany({
    data: [
      { title: "Storyboard frames 1-12", reviewState: "CLIENT_APPROVED", projectId: reelSeries.id, assigneeId: sage.id },
      { title: "Animation pass — frames 1-6", reviewState: "DRAFT", projectId: reelSeries.id, assigneeId: sage.id },
    ],
  });

  await prisma.project.create({
    data: {
      name: "LinkedIn sprint",
      status: "SHIPPED",
      clientId: vossCo.id,
      pmId: kai.id,
      clientUserId: mira.id,
      tasks: {
        create: [{ title: "6 posts shipped", reviewState: "CLIENT_APPROVED", assigneeId: sage.id }],
      },
    },
  });

  const inquiry = await prisma.inquiry.create({
    data: {
      clientId: vossCo.id,
      status: "PM_ASSIGNED",
      summary: "Q3 product launch campaign — needs full creative + AI-assisted intake",
    },
  });
  await prisma.inquiryMessage.create({
    data: {
      inquiryId: inquiry.id,
      authorId: mira.id,
      body: "We're prepping a Q3 launch and need a creative campaign + an intake form that adapts to leads from different verticals.",
    },
  });

  await prisma.auditLog.createMany({
    data: [
      { table: "Project", recordId: brandRefresh.id, action: "UPDATE", actorId: kai.id, note: "Status moved to IN_REVIEW" },
      { table: "User", recordId: mira.id, action: "CREATE", actorId: nox.id, note: "New client onboarded" },
    ],
  });

  await prisma.agentRun.createMany({
    data: [
      { agent: "ECHO", status: "success", input: { topic: "the case against auto-publish" }, output: { tokens: 1140 } },
      { agent: "PULSE", status: "success", input: { window: "24h" }, output: { incidents: 0 } },
    ],
  });

  const elapsedMs = Date.now() - start;

  return NextResponse.json({
    ok: true,
    elapsedMs,
    ranAt: new Date().toISOString(),
    note: "demo state reset to canonical seed",
  });
}

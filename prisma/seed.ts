// Demo seed. Wipes existing rows, inserts the canonical scenarios:
//
// Lattice — 4 personas, 1 active client (Mira's company), 3 projects
//   (one IN_REVIEW with deliverables awaiting Mira, one ACTIVE
//   mid-flight, one SHIPPED), tasks across the review states, an
//   inquiry in PM_ASSIGNED for Kai's inbox, audit log entries for Nox.
//
// Studio Mix — 4 agents, a few past runs as historical context.
//
// Run via `pnpm db:seed`. Idempotent — safe to run repeatedly.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: (process.env.DATABASE_URL ?? "").replace("?pgbouncer=true", ""),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Wiping existing data…");
  await prisma.agentRun.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.inquiryMessage.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding Lattice personas…");
  const mira = await prisma.user.create({
    data: {
      personaId: "mira-voss",
      name: "Mira Voss",
      email: "mira@voss.demo",
      role: "CLIENT",
    },
  });
  const kai = await prisma.user.create({
    data: {
      personaId: "kai-render",
      name: "Kai Render",
      email: "kai@lattice.demo",
      role: "PM",
    },
  });
  const nox = await prisma.user.create({
    data: {
      personaId: "nox-bellini",
      name: "Nox Bellini",
      email: "nox@lattice.demo",
      role: "ADMIN",
    },
  });
  const sage = await prisma.user.create({
    data: {
      personaId: "sage-holloway",
      name: "Sage Holloway",
      email: "sage@lattice.demo",
      role: "DESIGNER",
    },
  });

  console.log("Seeding Mira's client profile + projects…");
  const vossCo = await prisma.client.create({
    data: {
      userId: mira.id,
      company: "Voss & Co",
      industry: "B2B Brand",
    },
  });

  // Project 1 — IN_REVIEW with two deliverables waiting for Mira
  const brandRefresh = await prisma.project.create({
    data: {
      name: "Brand refresh — Q2",
      status: "IN_REVIEW",
      clientId: vossCo.id,
      pmId: kai.id,
      clientUserId: mira.id,
    },
  });
  const milestoneIdentity = await prisma.milestone.create({
    data: {
      name: "Identity system",
      projectId: brandRefresh.id,
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.task.createMany({
    data: [
      {
        title: "Logo direction — round 2",
        reviewState: "SUBMITTED_FOR_CLIENT",
        projectId: brandRefresh.id,
        milestoneId: milestoneIdentity.id,
        assigneeId: sage.id,
      },
      {
        title: "Color system + typography pairings",
        reviewState: "SUBMITTED_FOR_CLIENT",
        projectId: brandRefresh.id,
        milestoneId: milestoneIdentity.id,
        assigneeId: sage.id,
      },
      {
        title: "Brand guidelines draft",
        reviewState: "SUBMITTED_FOR_INTERNAL",
        projectId: brandRefresh.id,
        milestoneId: milestoneIdentity.id,
        assigneeId: sage.id,
      },
    ],
  });

  // Project 2 — ACTIVE, mid-flight reel series
  const reelSeries = await prisma.project.create({
    data: {
      name: "Reel series — May launch",
      status: "ACTIVE",
      clientId: vossCo.id,
      pmId: kai.id,
      clientUserId: mira.id,
    },
  });
  const milestoneAnimation = await prisma.milestone.create({
    data: {
      name: "Animation pass",
      projectId: reelSeries.id,
      dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.task.createMany({
    data: [
      {
        title: "Storyboard frames 1-12",
        reviewState: "CLIENT_APPROVED",
        projectId: reelSeries.id,
        milestoneId: milestoneAnimation.id,
        assigneeId: sage.id,
      },
      {
        title: "Animation pass — frames 1-6",
        reviewState: "DRAFT",
        projectId: reelSeries.id,
        milestoneId: milestoneAnimation.id,
        assigneeId: sage.id,
      },
    ],
  });

  // Project 3 — SHIPPED, completed last week
  const linkedinSprint = await prisma.project.create({
    data: {
      name: "LinkedIn sprint",
      status: "SHIPPED",
      clientId: vossCo.id,
      pmId: kai.id,
      clientUserId: mira.id,
    },
  });
  await prisma.task.create({
    data: {
      title: "6 posts shipped",
      reviewState: "CLIENT_APPROVED",
      projectId: linkedinSprint.id,
      assigneeId: sage.id,
    },
  });

  console.log("Seeding inquiry for Kai's inbox…");
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
      body:
        "We're prepping a Q3 launch and need a creative campaign + an intake form that adapts to leads from different verticals. Schedule that brings reels and the campaign site live by July 15.",
    },
  });

  console.log("Seeding audit log entries for Nox's view…");
  await prisma.auditLog.createMany({
    data: [
      {
        table: "Project",
        recordId: brandRefresh.id,
        action: "UPDATE",
        actorId: kai.id,
        note: "Status moved to IN_REVIEW",
      },
      {
        table: "Task",
        recordId: "(seeded)",
        action: "UPDATE",
        actorId: sage.id,
        note: "Logo direction round 2 → SUBMITTED_FOR_CLIENT",
      },
      {
        table: "User",
        recordId: mira.id,
        action: "CREATE",
        actorId: nox.id,
        note: "New client onboarded",
      },
    ],
  });

  console.log("Seeding Studio Mix agent runs…");
  await prisma.agentRun.createMany({
    data: [
      {
        agent: "ECHO",
        status: "success",
        input: { topic: "the case against auto-publish AI" },
        output: { tokens: 1140, draft: "Stored as draft #1" },
      },
      {
        agent: "PULSE",
        status: "success",
        input: { window: "24h" },
        output: { incidents: 0, scanned: 4127 },
      },
      {
        agent: "RIVER",
        status: "success",
        input: { sample: "Hi I'd like a portal..." },
        output: { classification: "legit", confidence: 0.92 },
      },
    ],
  });

  console.log("✓ Seed complete");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Shared wipe + reseed logic. Used by both prisma/seed.ts (CLI) and
// /api/cron/reset-demo/route.ts (Sunday 03:00 UTC). Takes a Prisma
// client so the caller decides whether to use a standalone instance
// (CLI) or the app's singleton (cron route).

import type { PrismaClient } from "@prisma/client";

export async function wipeAndReseedDemo(prisma: PrismaClient): Promise<{
  users: number;
  projects: number;
  tasks: number;
  inquiries: number;
  leaveRequests: number;
  expenses: number;
}> {
  // ---- Wipe (dependency-safe order) ---------------------------------
  await prisma.expense.deleteMany();
  await prisma.dailyStatus.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.agentRun.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.inquiryMessage.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // ---- Personas -----------------------------------------------------
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

  // ---- Mira's company + projects ------------------------------------
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

  // ---- Inquiry for Kai's inbox --------------------------------------
  const inquiry = await prisma.inquiry.create({
    data: {
      clientId: vossCo.id,
      status: "PM_ASSIGNED",
      summary:
        "Q3 product launch campaign — needs full creative + AI-assisted intake",
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

  // ---- Audit log seeds ----------------------------------------------
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

  // ---- Studio Mix agent runs ----------------------------------------
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

  // ---- People ops + finance -----------------------------------------
  const today = new Date();
  const inDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  await prisma.leaveRequest.createMany({
    data: [
      {
        userId: sage.id,
        type: "ANNUAL",
        startDate: inDays(7),
        endDate: inDays(11),
        reason: "Family trip — back the following Monday",
        status: "PENDING",
      },
      {
        userId: kai.id,
        type: "SICK",
        startDate: inDays(-7),
        endDate: inDays(-7),
        reason: "Flu",
        status: "APPROVED",
      },
      {
        userId: nox.id,
        type: "ANNUAL",
        startDate: inDays(60),
        endDate: inDays(64),
        reason: "August break",
        status: "APPROVED",
      },
      {
        userId: sage.id,
        type: "SICK",
        startDate: inDays(-14),
        endDate: inDays(-14),
        status: "APPROVED",
      },
    ],
  });

  // Daily status — last 7 days for staff
  const staff = [kai, nox, sage];
  const dayKey = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const statuses: Array<{
    userId: string;
    date: Date;
    status: "OFFICE" | "WFH" | "FIELD" | "LEAVE";
  }> = [];
  for (let offset = -6; offset <= 0; offset++) {
    for (const s of staff) {
      const day = dayKey(offset).getDay();
      if (day === 0 || day === 6) continue;
      let status: "OFFICE" | "WFH" | "FIELD" | "LEAVE" = "OFFICE";
      if (s.id === kai.id && offset === -7) status = "LEAVE";
      else if (day === 5) status = "WFH";
      else if (s.id === sage.id && offset === -2) status = "FIELD";
      else status = offset % 2 === 0 ? "OFFICE" : "WFH";
      statuses.push({ userId: s.id, date: dayKey(offset), status });
    }
  }
  if (statuses.length > 0) {
    await prisma.dailyStatus.createMany({
      data: statuses,
      skipDuplicates: true,
    });
  }

  await prisma.expense.createMany({
    data: [
      { amount: 240.0, category: "SOFTWARE", vendor: "Adobe Creative Cloud", note: "Team plan, monthly", paidAt: inDays(-3) },
      { amount: 75.0, category: "SOFTWARE", vendor: "Figma", note: "Pro seats × 3", paidAt: inDays(-3) },
      { amount: 32.0, category: "SOFTWARE", vendor: "Notion", note: "Team workspace", paidAt: inDays(-5) },
      { amount: 60.0, category: "SOFTWARE", vendor: "Vercel", note: "Pro plan", paidAt: inDays(-5) },
      { amount: 4200.0, category: "SALARY", vendor: "Kai Render", note: "May payroll", paidAt: inDays(-2) },
      { amount: 4500.0, category: "SALARY", vendor: "Nox Bellini", note: "May payroll", paidAt: inDays(-2) },
      { amount: 3800.0, category: "SALARY", vendor: "Sage Holloway", note: "May payroll", paidAt: inDays(-2) },
      { amount: 1200.0, category: "CONTRACTOR", vendor: "Aria K. (motion)", note: "Reel series — frames 7-12", paidAt: inDays(-9) },
      { amount: 2400.0, category: "OFFICE", vendor: "Studio rent", note: "May, prorated", paidAt: inDays(-12) },
      { amount: 180.0, category: "OFFICE", vendor: "Coffee + supplies", note: null, paidAt: inDays(-15) },
      { amount: 640.0, category: "TRAVEL", vendor: "Client visit — flight", note: "Mira pitch trip", paidAt: inDays(-18) },
      { amount: 110.0, category: "OTHER", vendor: "Domain renewals", note: null, paidAt: inDays(-22) },
    ],
  });

  return {
    users: 4,
    projects: 3,
    tasks: 7,
    inquiries: 1,
    leaveRequests: 4,
    expenses: 12,
  };
}

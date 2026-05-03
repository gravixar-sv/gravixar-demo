// Server-side queries for the Lattice scene. Each function takes a
// persona id (the signed-in user) and returns the data their dashboard
// needs. Designed so route handlers / RSC pages stay thin.

import { prisma } from "@/lib/db";
import type {
  AuditLog,
  DailyStatus,
  Expense,
  LeaveRequest,
  Project,
  Task,
  TaskReviewState,
  User,
} from "@prisma/client";

// ---- Mira (CLIENT) ---------------------------------------------------

export type ProjectWithReviewCount = Project & {
  pendingReviewCount: number;
  lastActivityAt: Date;
};

export async function getClientProjects(
  personaId: string,
): Promise<ProjectWithReviewCount[]> {
  const user = await prisma.user.findUnique({
    where: { personaId },
    include: {
      clientProfile: {
        include: {
          projects: {
            include: {
              tasks: {
                where: { reviewState: "SUBMITTED_FOR_CLIENT" },
                select: { id: true, updatedAt: true },
              },
              _count: { select: { tasks: true } },
            },
            orderBy: { updatedAt: "desc" },
          },
        },
      },
    },
  });

  if (!user?.clientProfile) return [];

  return user.clientProfile.projects.map((p) => ({
    ...p,
    pendingReviewCount: p.tasks.length,
    lastActivityAt: p.tasks[0]?.updatedAt ?? p.updatedAt,
  }));
}

export type PendingReviewTask = Task & {
  project: { id: string; name: string };
};

export async function getPendingReviewTasks(
  personaId: string,
): Promise<PendingReviewTask[]> {
  const user = await prisma.user.findUnique({
    where: { personaId },
    include: { clientProfile: true },
  });

  if (!user?.clientProfile) return [];

  return prisma.task.findMany({
    where: {
      project: { clientId: user.clientProfile.id },
      reviewState: "SUBMITTED_FOR_CLIENT",
    },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

// ---- Kai (PM) --------------------------------------------------------

export async function getPmInquiries(personaId: string) {
  const user = await prisma.user.findUnique({ where: { personaId } });
  if (!user) return [];
  // For demo simplicity, all inquiries go to the assigned PM (Kai).
  return prisma.inquiry.findMany({
    include: {
      client: { select: { company: true, user: { select: { name: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPmActiveProjects(personaId: string) {
  const user = await prisma.user.findUnique({ where: { personaId } });
  if (!user || user.role !== "PM") return [];
  return prisma.project.findMany({
    where: { pmId: user.id, status: { in: ["ACTIVE", "IN_REVIEW"] } },
    include: {
      client: { select: { company: true } },
      _count: { select: { tasks: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

// ---- Sage (DESIGNER) -------------------------------------------------

export type DesignerTask = Task & {
  project: { id: string; name: string };
};

export async function getDesignerTasks(personaId: string): Promise<DesignerTask[]> {
  const user = await prisma.user.findUnique({ where: { personaId } });
  if (!user) return [];
  return prisma.task.findMany({
    where: { assigneeId: user.id },
    include: { project: { select: { id: true, name: true } } },
    orderBy: [{ reviewState: "asc" }, { updatedAt: "desc" }],
  });
}

// ---- Nox (ADMIN) -----------------------------------------------------

export async function getAuditLogRecent(limit = 10): Promise<
  Array<AuditLog & { actor: { name: string } | null }>
> {
  return prisma.auditLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { actor: { select: { name: true } } },
  });
}

export async function getTeamStatusToday(): Promise<
  Array<DailyStatus & { user: { name: string; role: string } }>
> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const latest = await prisma.dailyStatus.findMany({
    where: {
      date: {
        gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { date: "desc" },
    include: { user: { select: { name: true, role: true } } },
  });

  // Take latest per user
  const seen = new Set<string>();
  const out: typeof latest = [];
  for (const row of latest) {
    if (seen.has(row.userId)) continue;
    seen.add(row.userId);
    out.push(row);
  }
  return out;
}

export async function getLeaveRequests(): Promise<
  Array<LeaveRequest & { user: { name: string } }>
> {
  return prisma.leaveRequest.findMany({
    orderBy: [{ status: "asc" }, { startDate: "desc" }],
    include: { user: { select: { name: true } } },
  });
}

export type FinanceSummary = {
  total30d: number;
  byCategory: Array<{ category: string; total: number; count: number }>;
  recent: Expense[];
};

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const expenses = await prisma.expense.findMany({
    where: { paidAt: { gte: since } },
    orderBy: { paidAt: "desc" },
  });

  const byCategoryMap = new Map<string, { total: number; count: number }>();
  let total = 0;
  for (const e of expenses) {
    const amt = Number(e.amount);
    total += amt;
    const cur = byCategoryMap.get(e.category) ?? { total: 0, count: 0 };
    byCategoryMap.set(e.category, { total: cur.total + amt, count: cur.count + 1 });
  }

  const byCategory = Array.from(byCategoryMap.entries())
    .map(([category, { total, count }]) => ({ category, total, count }))
    .sort((a, b) => b.total - a.total);

  return {
    total30d: total,
    byCategory,
    recent: expenses.slice(0, 8),
  };
}

// ---- Pure helpers ----------------------------------------------------

export function reviewStateTone(s: TaskReviewState): {
  label: string;
  tone: "active" | "muted" | "default";
} {
  switch (s) {
    case "SUBMITTED_FOR_CLIENT":
      return { label: "Awaiting your review", tone: "active" };
    case "CLIENT_APPROVED":
      return { label: "Approved", tone: "muted" };
    case "CLIENT_REVISION_REQUESTED":
      return { label: "Revision requested", tone: "active" };
    case "DRAFT":
      return { label: "Draft", tone: "default" };
    case "SUBMITTED_FOR_INTERNAL":
      return { label: "Internal review", tone: "default" };
    case "INTERNAL_APPROVED":
      return { label: "Internal approved", tone: "default" };
    default:
      return { label: s, tone: "default" };
  }
}

export function projectStatusTone(s: string): "active" | "muted" | "default" {
  switch (s) {
    case "IN_REVIEW":
      return "active";
    case "SHIPPED":
    case "ARCHIVED":
      return "muted";
    default:
      return "default";
  }
}

export function dailyStatusTone(s: string): { label: string; tone: "good" | "warn" | "muted" } {
  switch (s) {
    case "OFFICE":
      return { label: "office", tone: "good" };
    case "WFH":
      return { label: "wfh", tone: "good" };
    case "FIELD":
      return { label: "field", tone: "warn" };
    case "LEAVE":
      return { label: "on leave", tone: "muted" };
    default:
      return { label: s.toLowerCase(), tone: "muted" };
  }
}

export function leaveStatusTone(s: string): "active" | "default" | "muted" {
  switch (s) {
    case "PENDING":
      return "active";
    case "APPROVED":
      return "default";
    case "REJECTED":
      return "muted";
    default:
      return "default";
  }
}

export function formatMoney(n: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

export function shortDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
}

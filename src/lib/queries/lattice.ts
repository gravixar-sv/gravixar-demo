// Server-side queries for the Lattice scene. Each function takes a
// persona id (the signed-in user) and returns the data their dashboard
// needs. Designed so route handlers / RSC pages stay thin.

import { prisma } from "@/lib/db";
import type { Project, Task, TaskReviewState } from "@prisma/client";

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
                where: {
                  reviewState: "SUBMITTED_FOR_CLIENT",
                },
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

export async function getPendingReviewTasks(
  personaId: string,
): Promise<Task[]> {
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
    include: {
      project: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Map a TaskReviewState to a tone for UI badges. Pure helper — no DB.
 */
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
    case "SUBMITTED_FOR_INTERNAL":
    case "INTERNAL_APPROVED":
      return { label: "In progress", tone: "default" };
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

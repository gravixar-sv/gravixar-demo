// PULSE — anomaly detection over the audit log + operational data.
// Runs purely on Postgres queries — no AI required. Sweeps for:
// - Pending leave requests waiting on approval
// - Inquiries stuck in PM_ASSIGNED with no PM reply yet
// - Outstanding client reviews older than 2 days
// - Audit-log volume spike vs the prior window
// - Latest activity baseline (info-level, always present)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 30;

type Severity = "info" | "warn" | "critical";

type Finding = {
  severity: Severity;
  rule: string;
  description: string;
  count?: number;
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export async function POST() {
  const start = Date.now();
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * HOUR);
  const prior24h = new Date(now.getTime() - 48 * HOUR);
  const twoDaysAgo = new Date(now.getTime() - 2 * DAY);

  const [
    pendingLeave,
    stuckInquiries,
    overdueReviews,
    auditLast24h,
    auditPrior24h,
    totalAudit,
  ] = await Promise.all([
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    prisma.inquiry.count({
      where: {
        status: "PM_ASSIGNED",
        messages: {
          // No PM-authored message yet — for the demo, anything
          // PM_ASSIGNED counts as needing first reply.
          none: { author: { role: "PM" } },
        },
      },
    }),
    prisma.task.count({
      where: {
        reviewState: "SUBMITTED_FOR_CLIENT",
        updatedAt: { lt: twoDaysAgo },
      },
    }),
    prisma.auditLog.count({ where: { createdAt: { gte: last24h } } }),
    prisma.auditLog.count({
      where: { createdAt: { gte: prior24h, lt: last24h } },
    }),
    prisma.auditLog.count(),
  ]);

  const findings: Finding[] = [];

  if (pendingLeave > 0) {
    findings.push({
      severity: pendingLeave > 2 ? "warn" : "info",
      rule: "leave.pending",
      description: `${pendingLeave} leave request${pendingLeave === 1 ? "" : "s"} awaiting admin approval`,
      count: pendingLeave,
    });
  }

  if (stuckInquiries > 0) {
    findings.push({
      severity: "warn",
      rule: "inquiry.stuck.pm_assigned",
      description: `${stuckInquiries} inquir${stuckInquiries === 1 ? "y" : "ies"} in PM_ASSIGNED with no PM reply`,
      count: stuckInquiries,
    });
  }

  if (overdueReviews > 0) {
    findings.push({
      severity: "warn",
      rule: "review.overdue",
      description: `${overdueReviews} client review${overdueReviews === 1 ? "" : "s"} pending more than 2 days`,
      count: overdueReviews,
    });
  }

  // Spike detection — sudden burst of audit activity
  if (auditPrior24h > 0 && auditLast24h > auditPrior24h * 3) {
    findings.push({
      severity: "critical",
      rule: "audit.spike",
      description: `audit volume up ${Math.round((auditLast24h / auditPrior24h - 1) * 100)}% vs prior 24h (${auditLast24h} vs ${auditPrior24h})`,
      count: auditLast24h,
    });
  }

  // Always emit a baseline so the panel never reads empty
  findings.push({
    severity: "info",
    rule: "audit.window",
    description: `${auditLast24h} action${auditLast24h === 1 ? "" : "s"} in the last 24h (${totalAudit} all-time)`,
    count: auditLast24h,
  });

  // Log the run for the activity feed
  try {
    await prisma.agentRun.create({
      data: {
        agent: "PULSE",
        status: "success",
        input: { window: "24h" },
        output: {
          findingsCount: findings.length,
          warnings: findings.filter((f) => f.severity !== "info").length,
          scanned: {
            auditLog: totalAudit,
            leaveRequests: pendingLeave,
            stuckInquiries,
            overdueReviews,
          },
        },
      },
    });
  } catch (err) {
    console.error("[pulse] failed to log AgentRun:", err);
  }

  return NextResponse.json({
    scannedAt: now.toISOString(),
    elapsedMs: Date.now() - start,
    findings,
    scanned: {
      auditLog: totalAudit,
      pendingLeave,
      stuckInquiries,
      overdueReviews,
      auditLast24h,
      auditPrior24h,
    },
  });
}

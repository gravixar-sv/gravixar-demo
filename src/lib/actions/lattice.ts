"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { wipeAndReseedDemo } from "@/lib/demo/reset-data";

async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("not_authenticated");
  return session;
}

// ---- Demo reset ------------------------------------------------------
//
// Visitor-triggered "reset this scene" button. Re-runs the canonical
// seed so a visitor who clicked through Mira's review queue and ran out
// of things to do can try again from scratch. Intentionally global (the
// demo DB is shared); a per-session sandbox is a future refactor.

export async function resetSceneAction() {
  await wipeAndReseedDemo(prisma);
  revalidatePath("/lattice", "layout");
  revalidatePath("/", "layout");
}

// ---- Task review (Mira) ----------------------------------------------

export async function approveTaskAction(formData: FormData) {
  const taskId = formData.get("taskId");
  if (typeof taskId !== "string") throw new Error("invalid_task");

  const session = await requireSession();

  await prisma.task.update({
    where: { id: taskId },
    data: { reviewState: "CLIENT_APPROVED" },
  });
  await prisma.auditLog.create({
    data: {
      table: "Task",
      recordId: taskId,
      action: "UPDATE",
      actorId: session.user.id,
      note: "Approved by client",
    },
  });

  revalidatePath("/lattice/dashboard");
  revalidatePath("/lattice/admin");
}

export async function requestRevisionAction(formData: FormData) {
  const taskId = formData.get("taskId");
  if (typeof taskId !== "string") throw new Error("invalid_task");

  const session = await requireSession();

  await prisma.task.update({
    where: { id: taskId },
    data: { reviewState: "CLIENT_REVISION_REQUESTED" },
  });
  await prisma.auditLog.create({
    data: {
      table: "Task",
      recordId: taskId,
      action: "UPDATE",
      actorId: session.user.id,
      note: "Revision requested by client",
    },
  });

  revalidatePath("/lattice/dashboard");
  revalidatePath("/lattice/admin");
}

// ---- Sage submits draft for client review ----------------------------

export async function submitForClientAction(formData: FormData) {
  const taskId = formData.get("taskId");
  if (typeof taskId !== "string") throw new Error("invalid_task");

  const session = await requireSession();

  await prisma.task.update({
    where: { id: taskId },
    data: { reviewState: "SUBMITTED_FOR_CLIENT" },
  });
  await prisma.auditLog.create({
    data: {
      table: "Task",
      recordId: taskId,
      action: "UPDATE",
      actorId: session.user.id,
      note: `Submitted for client review by ${session.user.name}`,
    },
  });

  revalidatePath("/lattice/tasks");
  revalidatePath("/lattice/dashboard");
  revalidatePath("/lattice/admin");
}

// ---- PM inquiry triage (Kai) -----------------------------------------
//
// When an inquiry is in PM_ASSIGNED, Kai's job is to send the first
// reply and book a discovery call. We model this as a single "send
// first reply" action that advances the funnel and writes a message
// to the inquiry thread.

export async function sendFirstReplyAction(formData: FormData) {
  const inquiryId = formData.get("inquiryId");
  if (typeof inquiryId !== "string") throw new Error("invalid_inquiry");

  const session = await requireSession();

  await prisma.$transaction([
    prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: "AWAITING_CALL" },
    }),
    prisma.inquiryMessage.create({
      data: {
        inquiryId,
        authorId: session.user.id,
        body:
          "Thanks for reaching out, I've blocked time for a discovery call. " +
          "Picking the slot that works best for you and confirming next.",
      },
    }),
    prisma.auditLog.create({
      data: {
        table: "Inquiry",
        recordId: inquiryId,
        action: "UPDATE",
        actorId: session.user.id,
        note: "First reply sent, advanced to AWAITING_CALL",
      },
    }),
  ]);

  revalidatePath("/lattice/inbox");
  revalidatePath("/lattice/admin");
}

// ---- Leave management (Nox) ------------------------------------------

export async function approveLeaveAction(formData: FormData) {
  const requestId = formData.get("requestId");
  if (typeof requestId !== "string") throw new Error("invalid_request");

  const session = await requireSession();

  await prisma.leaveRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED" },
  });
  await prisma.auditLog.create({
    data: {
      table: "LeaveRequest",
      recordId: requestId,
      action: "UPDATE",
      actorId: session.user.id,
      note: "Leave approved",
    },
  });

  revalidatePath("/lattice/admin");
}

export async function rejectLeaveAction(formData: FormData) {
  const requestId = formData.get("requestId");
  if (typeof requestId !== "string") throw new Error("invalid_request");

  const session = await requireSession();

  await prisma.leaveRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED" },
  });
  await prisma.auditLog.create({
    data: {
      table: "LeaveRequest",
      recordId: requestId,
      action: "UPDATE",
      actorId: session.user.id,
      note: "Leave rejected",
    },
  });

  revalidatePath("/lattice/admin");
}

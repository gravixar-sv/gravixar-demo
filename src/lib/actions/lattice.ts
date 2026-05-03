"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("not_authenticated");
  return session;
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

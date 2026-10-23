"use server";

// Admin-only actions. Every one starts with requireAdmin(), so a normal user
// calling them directly gets redirected away before anything changes.

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/session";

function refreshAdmin() {
  revalidatePath("/admin", "layout");
}

// ---------- Health document verification ----------

export async function reviewDoc(formData: FormData) {
  const admin = await requireAdmin();
  const docId = String(formData.get("docId") ?? "");
  const decision = formData.get("decision") === "approve" ? "APPROVED" : "REJECTED";

  const doc = await prisma.healthDoc.update({
    where: { id: docId },
    data: { status: decision, reviewedById: admin.id, reviewedAt: new Date() },
    include: { dog: { select: { id: true, name: true, ownerId: true } } },
  });

  // The dog is Verified once any document is approved.
  const [approved, pending] = await Promise.all([
    prisma.healthDoc.count({ where: { dogId: doc.dogId, status: "APPROVED" } }),
    prisma.healthDoc.count({ where: { dogId: doc.dogId, status: "PENDING" } }),
  ]);
  const verificationStatus = approved > 0 ? "VERIFIED" : pending > 0 ? "PENDING" : "REJECTED";

  await prisma.$transaction([
    prisma.dog.update({ where: { id: doc.dogId }, data: { verificationStatus } }),
    prisma.notification.create({
      data: {
        userId: doc.dog.ownerId,
        type: decision === "APPROVED" ? "DOC_APPROVED" : "DOC_REJECTED",
        payload: { dogId: doc.dogId, dogName: doc.dog.name, docType: doc.type },
      },
    }),
    prisma.activityLog.create({ data: { userId: admin.id, action: "DOC_REVIEWED", meta: { docId, decision, dogId: doc.dogId } } }),
  ]);

  revalidatePath(`/dogs/${doc.dogId}`);
  refreshAdmin();
}

// ---------- Reports ----------

export async function handleReport(formData: FormData) {
  const admin = await requireAdmin();
  const reportId = String(formData.get("reportId") ?? "");
  const outcome = String(formData.get("outcome") ?? "");

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return;

  if (outcome === "pause") {
    // Hide the dog from Discover and close every open report about it.
    await prisma.$transaction([
      prisma.dog.update({ where: { id: report.dogId }, data: { isActive: false } }),
      prisma.report.updateMany({ where: { dogId: report.dogId, status: "OPEN" }, data: { status: "RESOLVED", resolvedAt: new Date() } }),
    ]);
  } else {
    await prisma.report.update({
      where: { id: reportId },
      data: { status: outcome === "dismiss" ? "DISMISSED" : "RESOLVED", resolvedAt: new Date() },
    });
  }
  await prisma.activityLog.create({ data: { userId: admin.id, action: "REPORT_HANDLED", meta: { reportId, dogId: report.dogId, outcome } } });
  revalidatePath("/discover");
  refreshAdmin();
}

// ---------- Users (Better Auth admin plugin) ----------

export async function setBan(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === admin.id) return; // never ban yourself

  if (formData.get("ban") === "true") {
    const reason = String(formData.get("reason") ?? "").trim() || "Broke Pawred's community rules";
    // banUser also signs the user out everywhere.
    await auth.api.banUser({ body: { userId, banReason: reason }, headers: await headers() });
    await prisma.activityLog.create({ data: { userId: admin.id, action: "USER_BANNED", meta: { userId, reason } } });
  } else {
    await auth.api.unbanUser({ body: { userId }, headers: await headers() });
    await prisma.activityLog.create({ data: { userId: admin.id, action: "USER_UNBANNED", meta: { userId } } });
  }
  revalidatePath("/discover");
  refreshAdmin();
}

export async function setUserRole(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const role = formData.get("role") === "admin" ? "admin" : "user";
  if (!userId || userId === admin.id) return; // don't demote yourself by accident

  await auth.api.setRole({ body: { userId, role }, headers: await headers() });
  await prisma.activityLog.create({ data: { userId: admin.id, action: "ROLE_CHANGED", meta: { userId, role } } });
  refreshAdmin();
}

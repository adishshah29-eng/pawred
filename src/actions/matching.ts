"use server";

// Likes, passes, matches, unmatching and reports.
// The browsing dog is always the signed-in user's *active* dog (see lib/dogs.ts).

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getActiveDog } from "@/lib/dogs";
import { canLike, likesTag, matchesTag, pair } from "@/lib/matching";
import { REPORT_REASONS } from "@/lib/reports";

export type LikeResult = { error?: string; matchId?: string; matchedWith?: { name: string; photo?: string } };

const likeSchema = z.object({
  toDogId: z.string().min(1),
  targetType: z.enum(["PHOTO", "PROMPT"]),
  targetId: z.string().min(1),
  comment: z
    .string()
    .trim()
    .max(140, "Keep comments under 140 characters.")
    .optional()
    .transform((v) => v || null),
});

async function activeDogOrError(userId: string) {
  const dog = await getActiveDog(userId);
  if (!dog) throw new Error("Create your dog's profile first.");
  return dog;
}

function refreshLists(...dogIds: string[]) {
  for (const id of dogIds) {
    updateTag(likesTag(id));
    updateTag(matchesTag(id));
  }
  revalidatePath("/discover");
  revalidatePath("/likes");
  revalidatePath("/matches");
}

/** Like a specific photo or prompt. Returns the match if the other dog already liked back. */
export async function sendLike(input: z.input<typeof likeSchema>): Promise<LikeResult> {
  const user = await requireUser();
  const parsed = likeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { toDogId, targetType, targetId, comment } = parsed.data;

  let me;
  try {
    me = await activeDogOrError(user.id);
  } catch (e) {
    return { error: (e as Error).message };
  }

  if (!(await canLike(me, toDogId))) return { error: "This profile isn't available any more." };

  // The liked photo / prompt must belong to that dog.
  const targetOk =
    targetType === "PHOTO"
      ? await prisma.dogPhoto.count({ where: { id: targetId, dogId: toDogId } })
      : await prisma.promptAnswer.count({ where: { id: targetId, dogId: toDogId } });
  if (!targetOk) return { error: "That photo or prompt no longer exists." };

  const target = await prisma.dog.findUniqueOrThrow({
    where: { id: toDogId },
    select: { ownerId: true, name: true, photos: { orderBy: { order: "asc" }, take: 1 } },
  });

  await prisma.like.create({ data: { fromDogId: me.id, toDogId, targetType, targetId, comment } });
  await prisma.activityLog.create({ data: { userId: user.id, action: "LIKE_SENT", meta: { fromDogId: me.id, toDogId } } });

  const likedBack = await prisma.like.findUnique({ where: { fromDogId_toDogId: { fromDogId: toDogId, toDogId: me.id } } });

  if (likedBack) {
    const match = await prisma.match.upsert({
      where: { dogAId_dogBId: pair(me.id, toDogId) },
      create: pair(me.id, toDogId),
      update: { unmatchedAt: null },
    });
    await prisma.$transaction([
      prisma.notification.create({ data: { userId: target.ownerId, type: "NEW_MATCH", payload: { matchId: match.id, withDogName: me.name } } }),
      prisma.notification.create({ data: { userId: user.id, type: "NEW_MATCH", payload: { matchId: match.id, withDogName: target.name } } }),
      prisma.activityLog.create({ data: { userId: user.id, action: "MATCH_CREATED", meta: { matchId: match.id } } }),
    ]);
    refreshLists(me.id, toDogId);
    return { matchId: match.id, matchedWith: { name: target.name, photo: target.photos[0]?.url } };
  }

  await prisma.notification.create({
    data: { userId: target.ownerId, type: "NEW_LIKE", payload: { fromDogId: me.id, fromDogName: me.name } },
  });
  refreshLists(me.id, toDogId);
  return {};
}

/** Skip a dog in Discover, or remove someone from "Likes you". */
export async function passDog(formData: FormData) {
  const user = await requireUser();
  const me = await getActiveDog(user.id);
  const toDogId = String(formData.get("toDogId") ?? "");
  if (!me || !toDogId || toDogId === me.id) return;

  await prisma.pass.upsert({
    where: { fromDogId_toDogId: { fromDogId: me.id, toDogId } },
    create: { fromDogId: me.id, toDogId },
    update: {},
  });
  await prisma.activityLog.create({ data: { userId: user.id, action: "PASS", meta: { fromDogId: me.id, toDogId } } });
  refreshLists(me.id);
}

/** Unmatch: chat becomes read-only and the dogs won't see each other again. */
export async function unmatch(formData: FormData) {
  const user = await requireUser();
  const matchId = String(formData.get("matchId") ?? "");
  const match = await prisma.match.findFirst({
    where: { id: matchId, OR: [{ dogA: { ownerId: user.id } }, { dogB: { ownerId: user.id } }] },
    include: { dogA: true, dogB: true },
  });
  if (!match) return;

  const mine = match.dogA.ownerId === user.id ? match.dogA : match.dogB;
  const theirs = mine.id === match.dogAId ? match.dogB : match.dogA;
  await prisma.$transaction([
    prisma.match.update({ where: { id: match.id }, data: { unmatchedAt: new Date() } }),
    prisma.pass.upsert({
      where: { fromDogId_toDogId: { fromDogId: mine.id, toDogId: theirs.id } },
      create: { fromDogId: mine.id, toDogId: theirs.id },
      update: {},
    }),
    prisma.activityLog.create({ data: { userId: user.id, action: "UNMATCH", meta: { matchId: match.id } } }),
  ]);
  refreshLists(match.dogAId, match.dogBId);
  redirect("/matches");
}

export type ReportState = { error?: string; done?: boolean };

export async function reportDog(_prev: ReportState, formData: FormData): Promise<ReportState> {
  const user = await requireUser();
  const dogId = String(formData.get("dogId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const details = String(formData.get("details") ?? "").trim().slice(0, 500);
  if (!(REPORT_REASONS as readonly string[]).includes(reason)) return { error: "Choose a reason." };

  const dog = await prisma.dog.findUnique({ where: { id: dogId }, select: { ownerId: true } });
  if (!dog) return { error: "That profile no longer exists." };
  if (dog.ownerId === user.id) return { error: "You can't report your own dog." };

  const recent = await prisma.report.count({
    where: { reporterId: user.id, dogId, createdAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) } },
  });
  if (recent > 0) return { done: true }; // already reported today; don't flood the queue

  await prisma.report.create({ data: { reporterId: user.id, dogId, reason: details ? `${reason}: ${details}` : reason } });
  await prisma.activityLog.create({ data: { userId: user.id, action: "REPORT_FILED", meta: { dogId, reason } } });
  revalidatePath("/admin/reports");
  return { done: true };
}

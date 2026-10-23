import "server-only";
import { prisma } from "@/lib/prisma";

export const PAGE_SIZE = 60;

const dogInclude = {
  photos: { orderBy: { order: "asc" }, take: 1 },
  owner: { select: { name: true } },
  healthDocs: { where: { status: "APPROVED" }, select: { type: true } }, // for the health chips in the chat header
} as const;

/** The match if this user owns one of its two dogs, with "me" and "other" worked out. */
export async function getMatchForUser(matchId: string, userId: string) {
  const match = await prisma.match.findFirst({
    where: { id: matchId, OR: [{ dogA: { ownerId: userId } }, { dogB: { ownerId: userId } }] },
    include: {
      dogA: { include: dogInclude },
      dogB: { include: dogInclude },
    },
  });
  if (!match) return null;
  const meIsA = match.dogA.ownerId === userId;
  return { ...match, me: meIsA ? match.dogA : match.dogB, other: meIsA ? match.dogB : match.dogA };
}

export type ChatMessage = { id: string; text: string; senderDogId: string; createdAt: string; readAt: string | null };

const toJson = (m: { id: string; text: string; senderDogId: string; createdAt: Date; readAt: Date | null }): ChatMessage => ({
  id: m.id,
  text: m.text,
  senderDogId: m.senderDogId,
  createdAt: m.createdAt.toISOString(),
  readAt: m.readAt?.toISOString() ?? null,
});

/** Latest messages, oldest first. With `after`, only newer ones (for polling). */
export async function listMessages(matchId: string, after?: Date) {
  const rows = after
    ? await prisma.message.findMany({ where: { matchId, createdAt: { gt: after } }, orderBy: { createdAt: "asc" }, take: PAGE_SIZE })
    : (await prisma.message.findMany({ where: { matchId }, orderBy: { createdAt: "desc" }, take: PAGE_SIZE })).reverse();
  return rows.map(toJson);
}

/** Time of my newest message the other owner has read (for "Read" receipts). */
export async function readUpTo(matchId: string, myDogId: string) {
  const last = await prisma.message.findFirst({
    where: { matchId, senderDogId: myDogId, readAt: { not: null } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  return last?.createdAt.toISOString() ?? null;
}

/** Mark the other dog's messages as read. */
export async function markRead(matchId: string, myDogId: string) {
  const { count } = await prisma.message.updateMany({
    where: { matchId, senderDogId: { not: myDogId }, readAt: null },
    data: { readAt: new Date() },
  });
  return count;
}

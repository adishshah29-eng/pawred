"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getMatchForUser, type ChatMessage } from "@/lib/chat";
import { matchesTag } from "@/lib/matching";

const textSchema = z.string().trim().min(1, "Write a message first.").max(1000, "Messages can be up to 1000 characters.");

export async function sendMessage(matchId: string, text: string): Promise<{ error?: string; message?: ChatMessage }> {
  const user = await requireUser();
  const parsed = textSchema.safeParse(text);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const match = await getMatchForUser(matchId, user.id);
  if (!match) return { error: "This chat no longer exists." };
  if (match.unmatchedAt) return { error: "You're no longer matched, so this chat is closed." };

  const msg = await prisma.message.create({ data: { matchId, senderDogId: match.me.id, text: parsed.data } });

  // Tell the other owner, but only once per unread streak.
  const unreadBefore = await prisma.message.count({
    where: { matchId, senderDogId: match.me.id, readAt: null, id: { not: msg.id } },
  });
  if (unreadBefore === 0) {
    await prisma.notification.create({
      data: { userId: match.other.ownerId, type: "NEW_MESSAGE", payload: { matchId, fromDogName: match.me.name } },
    });
  }

  updateTag(matchesTag(match.me.id));
  updateTag(matchesTag(match.other.id));

  return {
    message: { id: msg.id, text: msg.text, senderDogId: msg.senderDogId, createdAt: msg.createdAt.toISOString(), readAt: null },
  };
}

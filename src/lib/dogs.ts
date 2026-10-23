import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Dog data access. Every function takes the signed-in user's id and checks ownership.

export const ACTIVE_DOG_COOKIE = "pawred_dog";

const profileInclude = {
  photos: { orderBy: { order: "asc" } },
  prompts: { orderBy: { order: "asc" } },
  healthDocs: { orderBy: { createdAt: "desc" } },
} as const;

export async function listMyDogs(userId: string) {
  return prisma.dog.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
    include: { photos: { orderBy: { order: "asc" }, take: 1 }, _count: { select: { prompts: true, photos: true } } },
  });
}

/** The dog, if this user owns it; otherwise null. */
export async function getOwnedDog(dogId: string, userId: string) {
  return prisma.dog.findFirst({ where: { id: dogId, ownerId: userId }, include: profileInclude });
}

/** A profile the viewer may see: their own dog, or any active dog. */
export async function getVisibleDog(dogId: string, viewerId: string) {
  const dog = await prisma.dog.findUnique({ where: { id: dogId }, include: { ...profileInclude, owner: { select: { name: true } } } });
  if (!dog) return null;
  if (dog.ownerId !== viewerId && !dog.isActive) return null;
  return dog;
}

const withMainPhoto = { photos: { orderBy: { order: "asc" }, take: 1 } } as const;

/**
 * Which of the user's dogs they're browsing as. Falls back to their first dog.
 * Includes the main photo for the app shell. Runs once per request (React cache),
 * however many components ask for it.
 */
export const getActiveDog = cache(async (userId: string) => {
  const chosen = (await cookies()).get(ACTIVE_DOG_COOKIE)?.value;
  if (chosen) {
    const dog = await prisma.dog.findFirst({ where: { id: chosen, ownerId: userId }, include: withMainPhoto });
    if (dog) return dog;
  }
  return prisma.dog.findFirst({ where: { ownerId: userId }, orderBy: { createdAt: "asc" }, include: withMainPhoto });
});

/** What's still missing before a profile is complete. */
export function missingSteps(dog: { photos: unknown[]; prompts: unknown[] }) {
  const missing: { step: number; label: string }[] = [];
  if (dog.photos.length === 0) missing.push({ step: 2, label: "Add at least one photo" });
  if (dog.prompts.length < 3) missing.push({ step: 3, label: "Answer three prompts" });
  return missing;
}

export function ageLabel(dateOfBirth: Date) {
  const now = new Date();
  let months = (now.getFullYear() - dateOfBirth.getFullYear()) * 12 + (now.getMonth() - dateOfBirth.getMonth());
  if (now.getDate() < dateOfBirth.getDate()) months -= 1;
  const years = Math.floor(months / 12);
  return years >= 2 ? `${years} yrs` : `${months} months`;
}

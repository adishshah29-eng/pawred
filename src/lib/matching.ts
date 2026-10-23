import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { MIN_AGE_MONTHS } from "@/lib/validators";

// Matching rules for breeding (see IMPLEMENTATION_PLAN.md §1):
//  • opposite sex only
//  • same breed, unless BOTH owners are open to other breeds
//  • at least 18 months old
//  • profile active and complete (≥1 photo, 3 prompts)
//  • not the viewer's own dog, not already liked / passed / matched

type Seeker = { id: string; ownerId: string; sex: "MALE" | "FEMALE"; breed: string; openToMixed: boolean };

export type DiscoverFilters = { verifiedOnly?: boolean; city?: string };

export const likesTag = (dogId: string) => `likes:${dogId}`;
export const matchesTag = (dogId: string) => `matches:${dogId}`;

function oldestAllowedBirthday() {
  const d = new Date();
  d.setMonth(d.getMonth() - MIN_AGE_MONTHS);
  return d;
}

/** Prisma filter for dogs this seeker is allowed to see in Discover. */
export function compatibleWhere(seeker: Seeker, filters: DiscoverFilters = {}): Prisma.DogWhereInput {
  return {
    id: { not: seeker.id },
    ownerId: { not: seeker.ownerId },
    owner: { OR: [{ banned: false }, { banned: null }] },
    isActive: true,
    sex: seeker.sex === "MALE" ? "FEMALE" : "MALE",
    dateOfBirth: { lte: oldestAllowedBirthday() },
    photos: { some: {} },
    prompts: { some: {} },
    OR: seeker.openToMixed ? [{ breed: seeker.breed }, { openToMixed: true }] : [{ breed: seeker.breed }],
    ...(filters.verifiedOnly && { verificationStatus: "VERIFIED" }),
    ...(filters.city && { city: { equals: filters.city, mode: "insensitive" } }),
    // Not already acted on by the seeker, and not already matched.
    likesReceived: { none: { fromDogId: seeker.id } },
    passesGot: { none: { fromDogId: seeker.id } },
    matchesAsA: { none: { dogBId: seeker.id } },
    matchesAsB: { none: { dogAId: seeker.id } },
  };
}

const profileInclude = {
  photos: { orderBy: { order: "asc" } },
  prompts: { orderBy: { order: "asc" } },
  healthDocs: { select: { type: true, status: true } },
} as const;

/** Next profile to show in Discover, plus how many are left. */
export async function nextInQueue(seeker: Seeker, filters: DiscoverFilters) {
  const where = compatibleWhere(seeker, filters);
  // One round of parallel queries. A dog who already liked you goes first, so a match is one tap away.
  const [admirer, newest, remaining] = await Promise.all([
    prisma.dog.findFirst({
      where: { ...where, likesSent: { some: { toDogId: seeker.id } } },
      include: profileInclude,
      orderBy: { createdAt: "desc" },
    }),
    prisma.dog.findFirst({ where, include: profileInclude, orderBy: { createdAt: "desc" } }),
    prisma.dog.count({ where }),
  ]);
  return { dog: admirer ?? newest, remaining };
}

/**
 * Several compatible dogs at once, for the feed and the grid.
 * Dogs who already liked the seeker come first, then the newest profiles.
 */
export async function listDiscover(seeker: Seeker, filters: DiscoverFilters, limit: number) {
  const where = compatibleWhere(seeker, filters);
  const [admirers, newest, total] = await Promise.all([
    prisma.dog.findMany({
      where: { ...where, likesSent: { some: { toDogId: seeker.id } } },
      include: profileInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.dog.findMany({ where, include: profileInclude, orderBy: { createdAt: "desc" }, take: limit }),
    prisma.dog.count({ where }),
  ]);
  const admirerIds = new Set(admirers.map((d) => d.id));
  const dogs = [...admirers, ...newest.filter((d) => !admirerIds.has(d.id))].slice(0, limit);
  return { dogs, total, admirerIds };
}

/** Is `target` a dog the seeker is allowed to like right now? */
export async function canLike(seeker: Seeker, targetId: string) {
  const dog = await prisma.dog.findFirst({ where: { ...compatibleWhere(seeker), id: targetId }, select: { id: true } });
  return Boolean(dog);
}

/** Likes the dog has received and not yet answered. Cached per dog; actions call updateTag(likesTag(id)). */
export async function getPendingLikes(dogId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(likesTag(dogId));

  return prisma.like.findMany({
    where: {
      toDogId: dogId,
      fromDog: {
        isActive: true,
        owner: { OR: [{ banned: false }, { banned: null }] },
        passesGot: { none: { fromDogId: dogId } },
        likesReceived: { none: { fromDogId: dogId } }, // not liked back yet
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      fromDog: {
        include: {
          photos: { orderBy: { order: "asc" } },
          prompts: { orderBy: { order: "asc" } },
        },
      },
    },
  });
}

/** Active matches for a dog, newest activity first. Cached; actions call updateTag(matchesTag(id)). */
export async function getMatches(dogId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(matchesTag(dogId));

  const matches = await prisma.match.findMany({
    where: { unmatchedAt: null, OR: [{ dogAId: dogId }, { dogBId: dogId }] },
    include: {
      dogA: { include: { photos: { orderBy: { order: "asc" }, take: 1 } } },
      dogB: { include: { photos: { orderBy: { order: "asc" }, take: 1 } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: { where: { readAt: null, senderDogId: { not: dogId } } } } },
    },
  });

  return matches
    .map((m) => ({
      id: m.id,
      createdAt: m.createdAt,
      other: m.dogAId === dogId ? m.dogB : m.dogA,
      last: m.messages[0] ?? null,
      unread: m._count.messages,
    }))
    .sort((a, b) => +(b.last?.createdAt ?? b.createdAt) - +(a.last?.createdAt ?? a.createdAt));
}

type Fit = { breed: string; city: string; name: string; verificationStatus: string; dateOfBirth: Date; openToMixed: boolean };

/** A few plain-language reasons this dog suits the seeker, shown on Discover. */
export function fitNotes(me: Fit, dog: Fit) {
  const notes: { ok: boolean; text: string }[] = [];
  notes.push({ ok: true, text: me.breed === dog.breed ? "Same breed" : "Both open to other breeds" });
  if (me.city.trim().toLowerCase() === dog.city.trim().toLowerCase()) notes.push({ ok: true, text: `Both in ${dog.city}` });

  const bothVerified = me.verificationStatus === "VERIFIED" && dog.verificationStatus === "VERIFIED";
  if (bothVerified) notes.push({ ok: true, text: "Both health-verified" });
  else if (dog.verificationStatus === "VERIFIED") notes.push({ ok: true, text: `${dog.name} is health-verified` });
  else notes.push({ ok: false, text: "Documents not verified yet" });

  const yearsApart = Math.abs(+me.dateOfBirth - +dog.dateOfBirth) / (365.25 * 24 * 3600 * 1000);
  if (yearsApart <= 3) notes.push({ ok: true, text: "Close in age" });
  return notes;
}

/** Order a pair the way Match stores it (smaller id first). */
export function pair(a: string, b: string) {
  return a < b ? { dogAId: a, dogBId: b } : { dogAId: b, dogBId: a };
}

import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export const DOGS_TAG = "dogs";

/** Public numbers for breed pages. Cached for an hour; dog edits call updateTag("dogs"). */
export async function breedStats(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(DOGS_TAG);

  const where = { breed: slug, isActive: true, photos: { some: {} } };
  const [total, verified, cities] = await Promise.all([
    prisma.dog.count({ where }),
    prisma.dog.count({ where: { ...where, verificationStatus: "VERIFIED" } }),
    prisma.dog.groupBy({ by: ["city"], where, _count: { _all: true }, orderBy: { _count: { city: "desc" } }, take: 5 }),
  ]);
  return { total, verified, cities: cities.map((c) => c.city) };
}

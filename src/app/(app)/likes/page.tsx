import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ageLabel, getActiveDog } from "@/lib/dogs";
import { breedName } from "@/lib/breeds";
import { getPendingLikes } from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import { LikeBackButton, RemoveLikeButton } from "@/components/match/MatchButtons";
import { EmptyState } from "@/components/match/EmptyState";

export const metadata: Metadata = { title: "Likes you" };

// Depends on the signed-in user, so it renders per request.
export const instant = false;

export default async function LikesPage() {
  const user = await requireUser("/likes");
  const me = await getActiveDog(user.id);
  if (!me) {
    return <EmptyState title="No dog yet" body="Create your dog's profile so other owners can like it." action={{ href: "/onboarding", label: "Create a profile" }} />;
  }

  // getPendingLikes is cached per dog (use cache + cacheTag); likes/passes call updateTag.
  const [likes, mine] = await Promise.all([
    getPendingLikes(me.id),
    prisma.dog.findUniqueOrThrow({ where: { id: me.id }, include: { photos: true, prompts: true } }),
  ]);

  if (likes.length === 0) {
    return (
      <EmptyState
        title="No likes yet"
        body={`When an owner likes something on ${me.name}'s profile, it shows up here with their comment.`}
        action={{ href: "/discover", label: "Keep browsing" }}
      />
    );
  }

  const breeds = await Promise.all(likes.map((l) => breedName(l.fromDog.breed)));

  return (
    <div className="mx-auto w-full max-w-[640px] px-5 py-8 sm:px-8 md:py-12">
      <h1 className="font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05]">Likes you</h1>
      <p className="mt-2 text-lg text-ink-soft">
        {likes.length} {likes.length === 1 ? "owner likes" : "owners like"} {me.name}. Like back to match and start chatting.
      </p>

      <ul className="mt-10 grid gap-5">
        {likes.map((like, i) => {
          const dog = like.fromDog;
          const likedPhoto = like.targetType === "PHOTO" ? mine.photos.find((p) => p.id === like.targetId) : null;
          const likedPrompt = like.targetType === "PROMPT" ? mine.prompts.find((p) => p.id === like.targetId) : null;
          return (
            <li key={like.id} className="overflow-hidden rounded-[28px] border border-line bg-card">
              {/* What they liked on your profile, and what they said */}
              <div className="flex gap-4 border-b border-line bg-paper/60 px-5 py-4">
                {likedPhoto ? (
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-[14px]">
                    <Image src={likedPhoto.url} alt={`${me.name}'s photo they liked`} fill sizes="56px" className="object-cover" />
                  </div>
                ) : (
                  <Heart size={22} className="mt-1 shrink-0 text-marigold-deep" fill="currentColor" aria-hidden="true" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-marigold-deep">
                    Liked {likedPhoto ? `${me.name}'s photo` : likedPrompt ? `“${likedPrompt.prompt}”` : "your profile"}
                  </p>
                  {like.comment ? (
                    <p className="mt-1 font-display text-[20px] leading-snug">&ldquo;{like.comment}&rdquo;</p>
                  ) : (
                    <p className="mt-1 text-ink-soft">No comment, just a like.</p>
                  )}
                </div>
              </div>

              {/* Who sent it */}
              <div className="flex flex-wrap items-center gap-4 p-4">
                <Link href={`/dogs/${dog.id}`} className="relative size-20 shrink-0 overflow-hidden rounded-[18px] bg-paper-deep">
                  {dog.photos[0] && <Image src={dog.photos[0].url} alt={`${dog.name}`} fill sizes="80px" className="object-cover" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/dogs/${dog.id}`} className="font-display text-[26px] leading-none hover:underline">
                    {dog.name}
                  </Link>
                  <p className="mt-1 text-sm text-ink-soft">
                    {breeds[i]} · {dog.sex === "MALE" ? "Male" : "Female"} · {ageLabel(dog.dateOfBirth)} · {dog.city}
                    {dog.verificationStatus === "VERIFIED" && <span className="font-semibold text-verified"> · Verified</span>}
                  </p>
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                  {dog.photos[0] && <LikeBackButton toDogId={dog.id} photoId={dog.photos[0].id} />}
                  <RemoveLikeButton toDogId={dog.id} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

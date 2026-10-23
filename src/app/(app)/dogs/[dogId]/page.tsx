import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleAlert, Heart, MessageCircle, Pencil, PartyPopper } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ageLabel, getActiveDog, getVisibleDog, missingSteps } from "@/lib/dogs";
import { breedName } from "@/lib/breeds";
import { canLike, fitNotes, pair } from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import { DogProfile } from "@/components/dogs/DogProfile";
import { FitNotes } from "@/components/discover/FitNotes";
import { LikeButton, LikeProvider } from "@/components/match/LikeControls";
import { PassButton, ReportDog } from "@/components/match/MatchButtons";

export const metadata: Metadata = { title: "Dog profile" };

// Depends on the signed-in user, so it renders per request.
export const instant = false;

export default async function DogPage({ params, searchParams }: PageProps<"/dogs/[dogId]">) {
  const { dogId } = await params;
  const sp = await searchParams;
  const user = await requireUser(`/dogs/${dogId}`);
  const dog = await getVisibleDog(dogId, user.id);
  if (!dog) notFound();

  const isOwner = dog.ownerId === user.id;
  const missing = isOwner ? missingSteps(dog) : [];

  // Someone else's dog: can the viewer like it, or what happened already?
  const me = isOwner ? null : await getActiveDog(user.id);
  const [likeable, match, liked] = me
    ? await Promise.all([
        canLike(me, dog.id),
        prisma.match.findFirst({ where: { ...pair(me.id, dog.id), unmatchedAt: null }, select: { id: true } }),
        prisma.like.findUnique({ where: { fromDogId_toDogId: { fromDogId: me.id, toDogId: dog.id } }, select: { id: true } }),
      ])
    : [false, null, null];

  return (
    <div className="mx-auto w-full max-w-[640px] px-5 py-8 sm:px-8 md:py-12">
      {isOwner && (
        <div className="mb-8 grid gap-3">
          {sp.welcome === "1" && missing.length === 0 && (
            <p role="status" className="flex items-start gap-3 rounded-[20px] bg-felt px-5 py-4 text-on-felt">
              <PartyPopper size={20} className="mt-0.5 shrink-0 text-marigold" aria-hidden="true" />
              <span>
                <strong className="font-semibold">{dog.name}&apos;s profile is live.</strong>{" "}
                <span className="text-on-felt-soft">This is exactly what other owners will see.</span>
              </span>
            </p>
          )}

          {missing.length > 0 && (
            <div role="status" className="rounded-[20px] border border-marigold-deep/40 bg-marigold/15 px-5 py-4">
              <p className="flex items-center gap-2 font-semibold">
                <CircleAlert size={18} aria-hidden="true" /> {dog.name}&apos;s profile isn&apos;t finished
              </p>
              <ul className="mt-2 grid gap-1">
                {missing.map((m) => (
                  <li key={m.step}>
                    <Link href={`/onboarding?dog=${dog.id}&step=${m.step}`} className="underline underline-offset-4">
                      {m.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-card px-5 py-3">
            <p className="text-sm text-ink-soft">
              {dog.isActive ? "Your dog · visible to other owners" : "Your dog · paused, hidden from Discover"}
              {dog.verificationStatus === "PENDING" && " · documents waiting for review"}
            </p>
            <Link
              href={`/dogs/${dog.id}/edit`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-semibold text-paper transition-colors hover:bg-felt"
            >
              <Pencil size={16} aria-hidden="true" /> Edit profile
            </Link>
          </div>
        </div>
      )}

      {!isOwner && (
        <Link href="/discover" className="mb-6 inline-flex h-11 items-center gap-2 font-semibold text-ink-soft hover:text-ink">
          <ArrowLeft size={18} aria-hidden="true" /> Back to Discover
        </Link>
      )}

      {!isOwner && match && (
        <Link href={`/matches/${match.id}`} className="mb-6 flex items-center gap-3 rounded-[20px] bg-felt px-5 py-4 text-on-felt">
          <MessageCircle size={20} className="shrink-0 text-marigold" aria-hidden="true" />
          <span>
            You matched with {dog.name}. <span className="font-semibold underline underline-offset-4">Open the chat</span>
          </span>
        </Link>
      )}
      {!isOwner && !match && liked && (
        <p role="status" className="mb-6 flex items-center gap-3 rounded-[20px] bg-card px-5 py-4">
          <Heart size={20} className="shrink-0 text-marigold-deep" fill="currentColor" aria-hidden="true" />
          You liked {dog.name}. If their owner likes {me?.name} back, you&apos;ll match.
        </p>
      )}

      {dog.photos.length === 0 && dog.prompts.length === 0 ? (
        <p className="rounded-[28px] bg-card px-6 py-10 text-center text-ink-soft">No photos or prompts yet.</p>
      ) : null}

      {me && likeable ? (
        <>
          <LikeProvider toDogId={dog.id} dogName={dog.name}>
            <DogProfile
              dog={dog}
              breed={await breedName(dog.breed)}
              age={ageLabel(dog.dateOfBirth)}
              photoAction={(id) => <LikeButton type="PHOTO" id={id} label={`${dog.name}'s photo`} />}
              promptAction={(id) => {
                const p = dog.prompts.find((x) => x.id === id);
                return <LikeButton type="PROMPT" id={id} label={p ? `${p.prompt} ${p.answer}` : "Prompt"} />;
              }}
              intro={<FitNotes notes={fitNotes(me, dog)} meName={me.name} dogName={dog.name} />}
            />
          </LikeProvider>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <PassButton toDogId={dog.id} dogName={dog.name} compact />
            <ReportDog dogId={dog.id} dogName={dog.name} />
          </div>
        </>
      ) : (
        <>
          <DogProfile dog={dog} breed={await breedName(dog.breed)} age={ageLabel(dog.dateOfBirth)} />
          {!isOwner && (
            <div className="mt-6">
              <ReportDog dogId={dog.id} dogName={dog.name} />
            </div>
          )}
        </>
      )}
    </div>
  );
}


import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Syringe } from "lucide-react";
import { Rosette } from "@/components/site/Wordmark";
import { DOC_LABELS } from "@/lib/health";
import { LikeButton, LikeProvider, LikeSurface } from "@/components/match/LikeControls";
import { PassButton } from "@/components/match/MatchButtons";
import { PhotoCarousel } from "./PhotoCarousel";

// One dog as a post in the Discover feed, in the spirit of an Instagram card:
// header, swipeable photos (double-tap to like), caption, then actions.

export type FeedDog = {
  id: string;
  name: string;
  city: string;
  vaccinated: boolean;
  verificationStatus: "NONE" | "PENDING" | "VERIFIED" | "REJECTED";
  photos: { id: string; url: string; alt: string | null }[];
  prompts: { id: string; prompt: string; answer: string }[];
  healthDocs: { type: string; status: "PENDING" | "APPROVED" | "REJECTED" }[];
};

export function FeedCard({
  dog,
  breed,
  age,
  fit,
  priority,
  admirer,
}: {
  dog: FeedDog;
  breed: string;
  age: string;
  /** Short reasons this dog suits the viewer, e.g. "Same breed". */
  fit: string[];
  priority?: boolean;
  /** This dog already liked the viewer. */
  admirer?: boolean;
}) {
  const caption = dog.prompts[0];
  const checked = dog.healthDocs.filter((d) => d.status === "APPROVED");

  return (
    <article aria-label={`${dog.name}, ${breed}`} className="overflow-hidden rounded-[28px] border border-line bg-card">
      <LikeProvider toDogId={dog.id} dogName={dog.name}>
        <header className="flex items-center gap-3 px-4 py-3">
          <Link href={`/dogs/${dog.id}`} className="relative size-11 shrink-0 overflow-hidden rounded-full bg-paper-deep ring-2 ring-marigold/70 ring-offset-2 ring-offset-card">
            {dog.photos[0] && <Image src={dog.photos[0].url} alt="" fill sizes="44px" className="object-cover" />}
          </Link>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 font-semibold leading-tight">
              <Link href={`/dogs/${dog.id}`} className="truncate hover:underline">
                {dog.name}
              </Link>
              {dog.verificationStatus === "VERIFIED" && (
                <span className="shrink-0" title="Health-verified">
                  <Rosette className="size-4" />
                  <span className="sr-only">Verified</span>
                </span>
              )}
            </p>
            <p className="truncate text-sm text-ink-soft">
              {breed} · {dog.city} · {age}
            </p>
          </div>
          {admirer && <span className="shrink-0 rounded-full bg-marigold/25 px-2.5 py-1 text-xs font-semibold">Liked you</span>}
        </header>

        <PhotoCarousel
          label={`${dog.name}'s photos`}
          slides={dog.photos.map((p, i) => (
            <LikeSurface key={p.id} type="PHOTO" id={p.id} label={`${dog.name}'s photo`} className="absolute inset-0">
              <Image
                src={p.url}
                alt={p.alt ?? `${dog.name}, photo ${i + 1}`}
                fill
                priority={priority && i === 0}
                sizes="(min-width: 768px) 560px, 100vw"
                className="object-cover"
              />
              <div className="absolute bottom-3 right-3">
                <LikeButton type="PHOTO" id={p.id} label={`${dog.name}'s photo`} />
              </div>
            </LikeSurface>
          ))}
        />

        <div className="px-4 pb-4 pt-3.5">
          <ul className="flex flex-wrap gap-1.5 text-[13px]" aria-label="Health">
            <li className="inline-flex h-7 items-center gap-1.5 rounded-full bg-paper px-2.5">
              <Syringe size={13} className={dog.vaccinated ? "text-verified" : "text-ink-soft"} aria-hidden="true" />
              {dog.vaccinated ? "Vaccinated" : "Not confirmed"}
            </li>
            {checked.map((d) => (
              <li key={d.type} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-paper px-2.5">
                <ShieldCheck size={13} className="text-verified" aria-hidden="true" />
                {DOC_LABELS[d.type] ?? d.type}
              </li>
            ))}
          </ul>

          {caption && (
            <div className="mt-3 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink-soft">
                  <span className="font-semibold text-ink">{dog.name}</span> · {caption.prompt}
                </p>
                <p className="mt-1 font-display text-[22px] leading-[1.25]">{caption.answer}</p>
              </div>
              <LikeButton type="PROMPT" id={caption.id} label={`${caption.prompt} ${caption.answer}`} size="sm" />
            </div>
          )}

          {fit.length > 0 && <p className="mt-3 text-sm text-ink-soft">{fit.join(" · ")}</p>}

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
            <PassButton toDogId={dog.id} dogName={dog.name} compact />
            <Link href={`/dogs/${dog.id}`} className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 font-semibold hover:bg-paper-deep">
              See full profile <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </LikeProvider>
    </article>
  );
}

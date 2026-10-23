import Image from "next/image";
import Link from "next/link";
import { Rosette } from "@/components/site/Wordmark";
import { LikeButton, LikeProvider } from "@/components/match/LikeControls";
import type { FeedDog } from "./FeedCard";

// One dog as a pin in the Discover grid (masonry layout, like Pinterest).
// Tiles get different heights so the columns look natural. The ratio comes from the
// dog's id, so a tile keeps its shape between visits and the layout never jumps.

const RATIOS = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[5/6]", "aspect-[4/3]", "aspect-[2/3]"];

function ratioFor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return RATIOS[h % RATIOS.length];
}

export function GridTile({ dog, breed, age }: { dog: FeedDog; breed: string; age: string }) {
  const photo = dog.photos[0];
  if (!photo) return null;

  return (
    <li className="mb-4 break-inside-avoid">
      <div className="group relative">
        <Link href={`/dogs/${dog.id}`} className="block rounded-[20px]">
          <span className={`relative block overflow-hidden rounded-[20px] bg-paper-deep ${ratioFor(dog.id)}`}>
            <Image
              src={photo.url}
              alt={photo.alt ?? `${dog.name}, ${breed}`}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
            {dog.verificationStatus === "VERIFIED" && (
              <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-card/95 px-2 py-1 text-xs font-semibold text-verified">
                <Rosette className="size-3.5" /> Verified
              </span>
            )}
          </span>
          <span className="mt-2 block px-1">
            <span className="block font-semibold leading-tight">{dog.name}</span>
            <span className="block truncate text-sm text-ink-soft">{breed}</span>
            <span className="block truncate text-sm text-ink-soft">
              {age} · {dog.city}
            </span>
          </span>
        </Link>

        {/* Like straight from the grid. Always visible on touch, shown on hover or focus with a mouse. */}
        <div className="absolute right-2.5 top-2.5 transition-opacity md:opacity-0 md:focus-within:opacity-100 md:group-hover:opacity-100">
          <LikeProvider toDogId={dog.id} dogName={dog.name}>
            <LikeButton type="PHOTO" id={photo.id} label={`${dog.name}'s photo`} size="sm" />
          </LikeProvider>
        </div>
      </div>
    </li>
  );
}

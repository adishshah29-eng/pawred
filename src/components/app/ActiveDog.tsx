import Image from "next/image";
import Link from "next/link";
import { Dog, Plus } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getActiveDog } from "@/lib/dogs";
import { breedName } from "@/lib/breeds";

// Which dog the owner is using the app as. Shown in the sidebar and (as an avatar) on phones.
// Reads the session, so render it inside <Suspense>.

export async function ActiveDogCard() {
  const user = await requireUser();
  const dog = await getActiveDog(user.id);

  if (!dog) {
    return (
      <Link
        href="/onboarding"
        className="mt-8 flex items-center gap-3 rounded-2xl border border-dashed border-line p-3 text-ink-soft transition-colors hover:border-ink-soft hover:text-ink"
      >
        <span className="grid size-12 place-items-center rounded-full bg-paper-deep">
          <Plus size={20} aria-hidden="true" />
        </span>
        <span className="font-semibold">Add your dog</span>
      </Link>
    );
  }

  const breed = await breedName(dog.breed);
  return (
    <Link
      href={`/dogs/${dog.id}`}
      className="mt-8 flex items-center gap-3 rounded-2xl border border-line bg-card p-2.5 pr-3 transition-colors hover:border-ink-soft"
    >
      <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-paper-deep">
        {dog.photos[0] ? (
          <Image src={dog.photos[0].url} alt="" fill sizes="48px" className="object-cover" />
        ) : (
          <Dog size={22} className="absolute inset-0 m-auto text-ink-soft" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-ink-soft">Browsing as</span>
        <span className="block truncate font-semibold leading-tight">{dog.name}</span>
        <span className="block truncate text-xs text-ink-soft">
          {breed} · {dog.city}
        </span>
      </span>
    </Link>
  );
}

export async function ActiveDogAvatar() {
  const user = await requireUser();
  const dog = await getActiveDog(user.id);
  return (
    <Link
      href="/settings"
      aria-label={dog ? `Browsing as ${dog.name}. Open settings` : "Open settings"}
      className="relative grid size-10 place-items-center overflow-hidden rounded-full border border-line bg-paper-deep"
    >
      {dog?.photos[0] ? (
        <Image src={dog.photos[0].url} alt="" fill sizes="40px" className="object-cover" />
      ) : (
        <Dog size={18} className="text-ink-soft" aria-hidden="true" />
      )}
    </Link>
  );
}

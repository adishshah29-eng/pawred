import Image from "next/image";
import { MapPin, ShieldCheck, Syringe, Weight, Shuffle } from "lucide-react";
import { Rosette } from "@/components/site/Wordmark";
import { DOC_LABELS } from "@/lib/health";

// Read-only Hinge-style profile: key facts first, then photos interleaved with prompt answers.
// Discover reuses this and passes like buttons through the action props.

type Profile = {
  id: string;
  name: string;
  sex: "MALE" | "FEMALE";
  city: string;
  bio: string | null;
  weightKg: number | null;
  vaccinated: boolean;
  openToMixed: boolean;
  verificationStatus: "NONE" | "PENDING" | "VERIFIED" | "REJECTED";
  photos: { id: string; url: string; alt: string | null }[];
  prompts: { id: string; prompt: string; answer: string }[];
  healthDocs: { type: string; status: "PENDING" | "APPROVED" | "REJECTED" }[];
};

type Props = {
  dog: Profile;
  breed: string;
  age: string;
  /** Shown right under the key facts (Discover puts "why this fits" here). */
  intro?: React.ReactNode;
  photoAction?: (photoId: string) => React.ReactNode;
  promptAction?: (promptId: string) => React.ReactNode;
};

const chip = "inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-card px-3 text-sm";

export function DogProfile({ dog, breed, age, intro, photoAction, promptAction }: Props) {
  // Photo, prompt, photo, prompt… then any leftover photos.
  const items: ({ kind: "photo"; photo: Profile["photos"][number]; index: number } | { kind: "prompt"; prompt: Profile["prompts"][number] })[] = [];
  const max = Math.max(dog.photos.length, dog.prompts.length);
  for (let i = 0; i < max; i++) {
    if (dog.photos[i]) items.push({ kind: "photo", photo: dog.photos[i], index: i });
    if (dog.prompts[i]) items.push({ kind: "prompt", prompt: dog.prompts[i] });
  }
  const checked = dog.healthDocs.filter((d) => d.status === "APPROVED");

  return (
    <article aria-label={`${dog.name}'s profile`} className="grid gap-4">
      <header>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[clamp(2.5rem,6vw,3.5rem)] leading-none">{dog.name}</h1>
            <p className="mt-2 text-ink-soft">
              {breed} · {dog.sex === "MALE" ? "Male" : "Female"} · {age}
            </p>
          </div>
          {dog.verificationStatus === "VERIFIED" && (
            <span className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-semibold text-verified">
              <Rosette className="size-5" /> Verified
            </span>
          )}
        </div>

        {/* Key facts up front: health is the point of Pawred, so it isn't left to the bottom. */}
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Key facts">
          <li className={`${chip} ${dog.vaccinated ? "text-ink" : "text-ink-soft"}`}>
            <Syringe size={15} className={dog.vaccinated ? "text-verified" : ""} aria-hidden="true" />
            {dog.vaccinated ? "Vaccinated" : "Vaccination not confirmed"}
          </li>
          {checked.map((d) => (
            <li key={d.type} className={chip}>
              <ShieldCheck size={15} className="text-verified" aria-hidden="true" />
              {DOC_LABELS[d.type] ?? d.type} checked
            </li>
          ))}
          {dog.weightKg && (
            <li className={chip}>
              <Weight size={15} className="text-ink-soft" aria-hidden="true" />
              {dog.weightKg} kg
            </li>
          )}
          {dog.openToMixed && (
            <li className={chip}>
              <Shuffle size={15} className="text-ink-soft" aria-hidden="true" />
              Open to other breeds
            </li>
          )}
        </ul>
        {intro}
      </header>

      {items.map((item, i) =>
        item.kind === "photo" ? (
          <div key={item.photo.id} className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-paper-deep sm:aspect-[5/6]">
            <Image
              src={item.photo.url}
              alt={item.photo.alt ?? `${dog.name}, photo ${item.index + 1}`}
              fill
              priority={i === 0}
              sizes="(min-width: 768px) 600px, 100vw"
              className="object-cover"
            />
            {item.index === 0 && (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/90 px-3 py-1 text-sm font-medium">
                <MapPin size={14} aria-hidden="true" /> {dog.city}
              </span>
            )}
            {photoAction && <div className="absolute bottom-3 right-3">{photoAction(item.photo.id)}</div>}
          </div>
        ) : (
          <div key={item.prompt.id} className="relative rounded-[28px] bg-card px-6 pb-7 pt-6">
            <p className="text-sm font-semibold text-ink-soft">{item.prompt.prompt}</p>
            <p className={`mt-2 font-display text-[clamp(1.5rem,3.4vw,2rem)] leading-[1.2] ${promptAction ? "pr-14" : ""}`}>{item.prompt.answer}</p>
            {promptAction && <div className="absolute bottom-4 right-4">{promptAction(item.prompt.id)}</div>}
          </div>
        ),
      )}

      {dog.bio && (
        <div className="rounded-[28px] bg-card px-6 py-6">
          <p className="text-sm font-semibold text-ink-soft">About {dog.name}</p>
          <p className="mt-2 text-lg">{dog.bio}</p>
        </div>
      )}
    </article>
  );
}

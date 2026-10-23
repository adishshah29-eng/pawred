import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleCheck } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getOwnedDog } from "@/lib/dogs";
import { getBreeds } from "@/lib/breeds";
import { BasicsForm } from "@/components/dogs/BasicsForm";
import { PhotoManager } from "@/components/dogs/PhotoManager";
import { PromptsForm } from "@/components/dogs/PromptsForm";
import { HealthDocs, HealthForm } from "@/components/dogs/HealthForm";
import { DeleteDogForm, VisibilityForm } from "@/components/dogs/DangerZone";

export const metadata: Metadata = { title: "Edit profile" };

// Depends on the signed-in user, so it renders per request.
export const instant = false;

const SAVED: Record<string, string> = {
  basics: "Basics saved.",
  prompts: "Prompts saved.",
  health: "Health details saved.",
};

export default async function EditDogPage({ params, searchParams }: PageProps<"/dogs/[dogId]/edit">) {
  const { dogId } = await params;
  const sp = await searchParams;
  const user = await requireUser(`/dogs/${dogId}/edit`);
  const dog = await getOwnedDog(dogId, user.id);
  if (!dog) notFound();

  const here = (section: string) => `/dogs/${dog.id}/edit?saved=${section}#${section}`;
  const saved = typeof sp.saved === "string" ? SAVED[sp.saved] : undefined;

  return (
    <div className="mx-auto w-full max-w-[640px] px-5 py-8 sm:px-8 md:py-12">
      <Link href={`/dogs/${dog.id}`} className="inline-flex h-11 items-center gap-2 font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft size={18} aria-hidden="true" /> Back to {dog.name}&apos;s profile
      </Link>
      <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05]">Edit {dog.name}</h1>

      {saved && (
        <p role="status" className="mt-6 flex items-center gap-2 rounded-2xl bg-verified/10 px-4 py-3 text-verified">
          <CircleCheck size={18} aria-hidden="true" /> {saved}
        </p>
      )}

      <nav aria-label="Sections" className="mt-8 flex flex-wrap gap-2 text-sm">
        {[
          ["basics", "Basics"],
          ["photos", "Photos"],
          ["prompts", "Prompts"],
          ["health", "Health"],
          ["visibility", "Visibility"],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-full border border-line px-4 py-2 hover:bg-paper-deep">
            {label}
          </a>
        ))}
      </nav>

      <Section id="basics" title="Basics">
        <BasicsForm dog={dog} breeds={await getBreeds()} next={here("basics")} submitLabel="Save basics" />
      </Section>

      <Section id="photos" title="Photos">
        <PhotoManager dogId={dog.id} dogName={dog.name} photos={dog.photos} />
      </Section>

      <Section id="prompts" title="Prompts">
        <PromptsForm dogId={dog.id} dogName={dog.name} existing={dog.prompts} next={here("prompts")} submitLabel="Save prompts" />
      </Section>

      <Section id="health" title="Health">
        <div className="grid gap-8">
          <HealthForm dogId={dog.id} vaccinated={dog.vaccinated} next={here("health")} submitLabel="Save" />
          <HealthDocs dogId={dog.id} docs={dog.healthDocs} />
        </div>
      </Section>

      <Section id="visibility" title="Visibility">
        <div className="grid gap-6">
          <VisibilityForm dogId={dog.id} dogName={dog.name} isActive={dog.isActive} />
          <DeleteDogForm dogId={dog.id} dogName={dog.name} />
        </div>
      </Section>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 border-t border-line pt-10 mt-12">
      <h2 id={`${id}-title`} className="mb-6 font-display text-[28px] leading-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

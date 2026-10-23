import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getOwnedDog } from "@/lib/dogs";
import { getBreeds } from "@/lib/breeds";
import { BasicsForm } from "@/components/dogs/BasicsForm";
import { PhotoManager } from "@/components/dogs/PhotoManager";
import { PromptsForm } from "@/components/dogs/PromptsForm";
import { HealthDocs, HealthForm } from "@/components/dogs/HealthForm";

export const metadata: Metadata = { title: "Create your dog's profile" };

// Depends on the signed-in user, so it renders per request.
export const instant = false;

const STEPS = [
  { title: "The basics", lead: "Owners filter by breed, sex and age, so these matter most." },
  { title: "Photos", lead: "Add up to six. The first one is what owners see first." },
  { title: "Prompts", lead: "Three short answers that show your dog's personality and health." },
  { title: "Health", lead: "Owners look for vaccinations and health checks before they like." },
];

// URL state: /onboarding                → step 1, new dog
//            /onboarding?dog=ID&step=N  → continue that dog's profile
export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const user = await requireUser("/onboarding");
  const sp = await searchParams;
  const dogId = typeof sp.dog === "string" ? sp.dog : undefined;
  const dog = dogId ? await getOwnedDog(dogId, user.id) : null;
  if (dogId && !dog) notFound();

  const requested = Math.min(4, Math.max(1, Number(sp.step) || 1));
  const step = dog ? requested : 1;
  const { title, lead } = STEPS[step - 1];
  const stepUrl = (n: number) => `/onboarding?dog=${dog?.id}&step=${n}`;

  return (
    <div className="mx-auto w-full max-w-[640px] px-5 py-8 sm:px-8 md:py-12">
      <nav aria-label="Profile steps">
        <p className="text-sm font-medium text-ink-soft">
          Step {step} of {STEPS.length}
          {dog && <> · {dog.name}</>}
        </p>
        <ol className="mt-3 grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const state = n < step ? "done" : n === step ? "current" : "todo";
            const bar = (
              <span
                className={`block h-1.5 rounded-full ${state === "todo" ? "bg-line" : state === "current" ? "bg-marigold" : "bg-ink"}`}
              />
            );
            return (
              <li key={s.title}>
                {dog && n !== step ? (
                  <Link href={stepUrl(n)} className="group block rounded-md" aria-label={`Go to step ${n}: ${s.title}`}>
                    {bar}
                    <span className="mt-2 hidden text-sm text-ink-soft group-hover:text-ink sm:block">{s.title}</span>
                  </Link>
                ) : (
                  <span aria-current={state === "current" ? "step" : undefined}>
                    {bar}
                    <span className={`mt-2 hidden text-sm sm:block ${state === "current" ? "font-semibold text-ink" : "text-ink-soft"}`}>
                      {s.title}
                    </span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <header className="mt-10">
        <h1 className="font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05]">
          {step === 1 && !dog ? "Let's meet your dog" : title}
        </h1>
        <p className="mt-3 text-lg text-ink-soft">{lead}</p>
      </header>

      <div className="mt-10">
        {step === 1 && <BasicsForm dog={dog} breeds={await getBreeds()} />}

        {step === 2 && dog && (
          <>
            <PhotoManager dogId={dog.id} dogName={dog.name} photos={dog.photos} />
            <StepNav
              back={stepUrl(1)}
              next={dog.photos.length > 0 ? stepUrl(3) : undefined}
              nextHint="Add at least one photo to continue."
            />
          </>
        )}

        {step === 3 && dog && (
          <>
            <PromptsForm dogId={dog.id} dogName={dog.name} existing={dog.prompts} />
            <StepNav back={stepUrl(2)} />
          </>
        )}

        {step === 4 && dog && (
          <div className="grid gap-10">
            <HealthDocs dogId={dog.id} docs={dog.healthDocs} />
            <HealthForm dogId={dog.id} vaccinated={dog.vaccinated} submitLabel={`See ${dog.name}'s profile`} />
            <StepNav back={stepUrl(3)} />
          </div>
        )}
      </div>
    </div>
  );
}

function StepNav({ back, next, nextHint }: { back: string; next?: string; nextHint?: string }) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
      <Link href={back} className="inline-flex h-12 items-center gap-2 rounded-full px-2 font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft size={18} aria-hidden="true" /> Back
      </Link>
      {next !== undefined || nextHint ? (
        next ? (
          <Link
            href={next}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-paper transition-colors duration-200 hover:bg-felt"
          >
            Continue <ArrowRight size={18} aria-hidden="true" />
          </Link>
        ) : (
          <p className="text-sm text-ink-soft">{nextHint}</p>
        )
      ) : null}
    </div>
  );
}

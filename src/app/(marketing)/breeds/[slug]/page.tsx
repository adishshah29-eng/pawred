import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { BREED_CHECKS, GENERAL_CHECKS, findBreed, getBreedPhoto, getBreeds } from "@/lib/breeds";
import { breedStats } from "@/lib/public-stats";
import { breeds as featured } from "@/lib/sample-data";

/** "a Pug", "an Indian Pariah". */
function an(name: string, capital = false) {
  const article = /^[aeiou]/i.test(name) ? "an" : "a";
  return `${capital ? article[0].toUpperCase() + article.slice(1) : article} ${name}`;
}

// Popular breeds are prebuilt at build time; any other breed renders on first visit.
export function generateStaticParams() {
  return featured.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/breeds/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const breed = await findBreed(slug);
  if (!breed || slug === "mixed") return {};
  const title = `${breed.name} matchmaking`;
  const description = `Find a healthy ${breed.name} mate for your dog. Health checks to ask about, verified profiles, and owners near you on Pawred.`;
  return {
    title,
    description,
    alternates: { canonical: `/breeds/${slug}` },
    openGraph: { title: `${title} · Pawred`, description, type: "article" },
  };
}

export default async function BreedPage({ params }: PageProps<"/breeds/[slug]">) {
  const { slug } = await params;
  const breed = await findBreed(slug);
  if (!breed || slug === "mixed") notFound();

  const local = featured.find((b) => b.slug === slug);
  const [photo, stats, all] = await Promise.all([
    local ? Promise.resolve(`${local.photo}?w=1400&q=75`) : breed.path ? getBreedPhoto(breed.path) : Promise.resolve(null),
    breedStats(slug),
    getBreeds(),
  ]);
  const checks = BREED_CHECKS[slug] ?? GENERAL_CHECKS;
  const related = featured.filter((b) => b.slug !== slug).slice(0, 4);

  return (
    <article>
      <header className="mx-auto grid max-w-[1240px] items-center gap-10 px-5 pb-16 pt-6 sm:px-8 md:grid-cols-[1fr_1fr] md:pb-24 md:pt-10">
        <div>
          <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
            <Link href="/#breeds" className="hover:text-ink">
              Breeds
            </Link>{" "}
            / {breed.name}
          </nav>
          <h1 className="mt-4 font-display text-[clamp(2.75rem,6vw,5rem)] leading-[0.98] tracking-[-0.02em]">{breed.name} matchmaking</h1>
          <p className="mt-6 max-w-[46ch] text-lg text-ink-soft">
            {local?.blurb ?? `Looking for ${an(breed.name)} mate? Start with health, then personality. Here's what to ask for.`}
          </p>
          <p className="mt-6 text-[15px]">
            {stats.total > 0 ? (
              <>
                <span className="font-semibold">
                  {stats.total} {breed.name} {stats.total === 1 ? "profile" : "profiles"}
                </span>{" "}
                on Pawred{stats.verified > 0 && <>, {stats.verified} verified</>}
                {stats.cities.length > 0 && <> · {stats.cities.join(", ")}</>}
              </>
            ) : (
              <>No {breed.name} profiles yet. Be the first.</>
            )}
          </p>
          <Link
            href="/sign-up"
            className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-marigold px-7 text-[17px] font-semibold text-ink transition-colors hover:bg-marigold-deep"
          >
            Create your dog&apos;s profile <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        {photo && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-paper-deep">
            <Image src={photo} alt={`${an(breed.name, true)}`} fill priority sizes="(min-width: 768px) 600px, 100vw" className="object-cover" />
          </div>
        )}
      </header>

      <section aria-labelledby="checks" className="bg-felt text-on-felt">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-20 sm:px-8 md:grid-cols-2">
          <h2 id="checks" className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]">
            Health checks to ask {an(breed.name)} owner about
          </h2>
          <div>
            <ul className="grid gap-4">
              {checks.map((c) => (
                <li key={c} className="flex gap-3 text-lg">
                  <Check size={22} className="mt-1 shrink-0 text-marigold" aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-on-felt-soft">
              This is a starting list, not veterinary advice. Your vet knows your dog and can tell you which tests matter most.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="more" className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8">
        <h2 id="more" className="font-display text-[clamp(1.75rem,3vw,2.5rem)]">
          Other breeds
        </h2>
        <ul className="mt-6 flex flex-wrap gap-2">
          {related.map((b) => (
            <li key={b.slug}>
              <Link href={`/breeds/${b.slug}`} className="inline-flex h-11 items-center rounded-full border border-line bg-card px-5 hover:bg-paper-deep">
                {b.name}
              </Link>
            </li>
          ))}
          <li className="inline-flex h-11 items-center px-2 text-ink-soft">and {all.length - 1 - related.length} more</li>
        </ul>
      </section>
    </article>
  );
}

import { cacheLife, cacheTag } from "next/cache";

// Breed list from the free Dog CEO API (https://dog.ceo/dog-api/),
// cached on the server for a week. Syllabus Unit 3: caching with tags.

/** `path` is Dog CEO's own id ("retriever/golden"), used to fetch breed photos. */
export type BreedOption = { slug: string; name: string; path?: string };

export const MIXED: BreedOption = { slug: "mixed", name: "Mixed breed" };

// Names Dog CEO spells in a way people wouldn't.
const NAME_FIXES: Record<string, string> = {
  shihtzu: "Shih Tzu",
  stbernard: "St. Bernard",
  bullterrier: "Bull Terrier",
  cattledog: "Cattle Dog",
  cotondetulear: "Coton de Tulear",
  mexicanhairless: "Mexican Hairless",
  danishswedish: "Danish-Swedish",
  germanlonghair: "German Longhaired",
  pembroke: "Corgi (Pembroke)",
  frise: "Frise",
  lhasa: "Lhasa Apso",
  dane: "Dane",
  chow: "Chow Chow",
};

// Slugs kept stable so seed data and breed pages line up.
const SLUG_FIXES: Record<string, string> = {
  pembroke: "corgi",
  shihtzu: "shih-tzu",
};

// For these, the main word comes first ("German Shepherd", not "Shepherd German").
const MAIN_FIRST = new Set(["african", "australian", "german", "finnish", "danishswedish"]);

const word = (w: string) => NAME_FIXES[w] ?? w.charAt(0).toUpperCase() + w.slice(1);

// Used if the API is down, so the form still works.
const FALLBACK: BreedOption[] = [
  { slug: "beagle", name: "Beagle" },
  { slug: "border-collie", name: "Border Collie" },
  { slug: "corgi", name: "Corgi (Pembroke)" },
  { slug: "german-shepherd", name: "German Shepherd" },
  { slug: "golden-retriever", name: "Golden Retriever" },
  { slug: "husky", name: "Husky" },
  { slug: "labrador", name: "Labrador" },
  { slug: "pug", name: "Pug" },
  { slug: "shih-tzu", name: "Shih Tzu" },
  { slug: "weimaraner", name: "Weimaraner" },
];

function toOptions(data: Record<string, string[]>): BreedOption[] {
  const out: BreedOption[] = [];
  for (const [main, subs] of Object.entries(data)) {
    if (main === "mix") continue; // we offer our own "Mixed breed"
    if (subs.length === 0) {
      out.push({ slug: SLUG_FIXES[main] ?? main, name: word(main), path: main });
      continue;
    }
    for (const sub of subs) {
      const mainFirst = MAIN_FIRST.has(main);
      out.push({
        slug: mainFirst ? `${main}-${sub}` : `${sub}-${main}`,
        name: mainFirst ? `${word(main)} ${word(sub)}` : `${word(sub)} ${word(main)}`,
        path: `${main}/${sub}`,
      });
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getBreeds(): Promise<BreedOption[]> {
  "use cache";
  cacheLife("weeks");
  cacheTag("breeds");

  try {
    const res = await fetch("https://dog.ceo/api/breeds/list/all");
    if (!res.ok) throw new Error(`Dog CEO API returned ${res.status}`);
    const json = (await res.json()) as { message: Record<string, string[]> };
    return [...toOptions(json.message), MIXED];
  } catch {
    return [...FALLBACK, MIXED];
  }
}

export async function breedName(slug: string) {
  const breeds = await getBreeds();
  return breeds.find((b) => b.slug === slug)?.name ?? slug.replace(/-/g, " ");
}

export async function findBreed(slug: string) {
  return (await getBreeds()).find((b) => b.slug === slug) ?? null;
}

/** A photo of the breed from Dog CEO. Cached for a day, so it changes daily. */
export async function getBreedPhoto(path: string): Promise<string | null> {
  "use cache";
  cacheLife("days");
  cacheTag(`breed-photo:${path}`);
  try {
    const res = await fetch(`https://dog.ceo/api/breed/${path}/images/random`);
    if (!res.ok) return null;
    const json = (await res.json()) as { message: string; status: string };
    return json.status === "success" ? json.message : null;
  } catch {
    return null;
  }
}

// Health checks worth asking about, for breeds people commonly ask about.
// Everything else gets the general advice.
export const BREED_CHECKS: Record<string, string[]> = {
  "golden-retriever": ["Hip and elbow scores", "Eye exam (PRA, cataracts)", "Heart check"],
  labrador: ["Hip and elbow scores", "Eye exam (PRA)", "EIC genetic test"],
  "german-shepherd": ["Hip and elbow scores", "Degenerative myelopathy (DM) test"],
  pug: ["Airway (BOAS) check", "Eye exam", "Spine check"],
  "french-bulldog": ["Airway (BOAS) check", "Spine check", "Eye exam"],
  "border-collie": ["CEA eye test", "Hip score", "TNS and CL genetic tests"],
  "shih-tzu": ["Eye exam", "Knee (patella) check", "Kidney check"],
  beagle: ["Eye exam", "Hip score", "MLS genetic test"],
  husky: ["Eye exam", "Hip score"],
  corgi: ["Spine and back check", "Hip score", "DM genetic test"],
  weimaraner: ["Hip score", "Eye exam", "Bloat history"],
  "indian-pariah": ["General vet check", "Tick fever screening"],
  rottweiler: ["Hip and elbow scores", "Heart check"],
  dachshund: ["Spine (IVDD) check", "Eye exam"],
};

export const GENERAL_CHECKS = ["Up-to-date vaccinations", "General vet check", "Any screening your vet recommends for the breed"];

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, FileCheck2, Flag, Heart } from "lucide-react";
import { breeds, photos, sampleDogs } from "@/lib/sample-data";
import { Rosette } from "@/components/site/Wordmark";
import { Reveal } from "./Reveal";
import styles from "./PromptRail.module.css";

const wrap = "mx-auto max-w-[1240px] px-5 sm:px-8";

/* ---------- Not a swipe ---------- */

const likes = [
  {
    kind: "Liked Bruno's photo",
    comment: "That grin! Maya makes the same face at the beach.",
  },
  {
    kind: "Liked Bruno's prompt",
    comment: "Maya swims every Sunday. She'd share the tennis ball. Probably.",
  },
];

export function NotASwipe() {
  return (
    <section aria-labelledby="not-a-swipe" className="bg-felt text-on-felt">
      <div className={`${wrap} grid items-center gap-14 py-24 md:grid-cols-2 md:py-32`}>
        <div>
          <h2 id="not-a-swipe" className="font-display text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.02]">
            Not a swipe.
            <br />A reason.
          </h2>
          <p className="mt-6 max-w-[46ch] text-lg text-on-felt-soft">
            On Pawred you like one specific thing: a photo, or an answer to a prompt. Add a line about
            why. The other owner sees exactly what caught your eye, so every conversation starts
            somewhere real.
          </p>
        </div>

        {/* Animmaster slot: Scroll Animation for these like slips. */}
        <ul className="relative flex flex-col gap-5">
          {likes.map((l, i) => (
            <Reveal key={l.kind} delay={i * 0.12} as="li">
              <div
                className={`flex gap-4 rounded-[24px] bg-card p-5 text-ink shadow-[0_24px_50px_-28px_rgba(0,0,0,0.6)] ${
                  i === 1 ? "md:ml-14" : "md:mr-14"
                }`}
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={`${photos.goldenPair}?w=200&q=70`}
                    alt="Maya, a golden retriever"
                    fill
                    sizes="56px"
                    className="object-cover object-[70%_50%]"
                  />
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-marigold-deep">
                    <Heart size={15} fill="currentColor" aria-hidden="true" /> Maya · {l.kind}
                  </p>
                  <p className="mt-1.5 font-display text-[22px] leading-snug">&ldquo;{l.comment}&rdquo;</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */

const steps = [
  {
    title: "Make a profile worth reading",
    body: "Three to six photos, three prompts in your dog's voice, and the health details owners actually ask about.",
  },
  {
    title: "Like what wins you over",
    body: "Opposite sex, same breed by default, 18 months and older. Like a photo or an answer and say why.",
  },
  {
    title: "Match, talk, then meet",
    body: "Chat opens when the like is returned. Share papers, ask your vet, and meet when both of you are ready.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-8">
      <div className={`${wrap} grid gap-14 py-24 md:grid-cols-[5fr_7fr] md:py-32`}>
        <div className="relative hidden overflow-hidden rounded-[28px] md:block">
          <Image
            src={`${photos.rugPair}?w=1000&q=75`}
            alt="A cream doodle and a black labrador sitting together on a patterned rug"
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <h2 id="how-heading" className="font-display text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[1.05]">
            Three steps. No guesswork.
          </h2>
          <ol className="mt-12">
            {steps.map((s, i) => (
              <Reveal key={s.title} as="li" delay={i * 0.08}>
                <div className="grid grid-cols-[3.5rem_1fr] gap-4 border-t border-line py-8">
                  <span className="font-display text-[40px] leading-none text-marigold-deep">{i + 1}</span>
                  <div>
                    <h3 className="text-xl font-semibold">{s.title}</h3>
                    <p className="mt-2 max-w-[52ch] text-ink-soft">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
          <Link
            href="/how-it-works"
            className="mt-2 inline-flex items-center gap-2 font-semibold underline decoration-line underline-offset-4 hover:decoration-ink"
          >
            Read the full guide <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- Health & safety ---------- */

const rules = [
  "Only opposite-sex dogs appear in Discover.",
  "Same breed by default. Mixed only when both owners opt in.",
  "Dogs must be at least 18 months old to be listed.",
  "Report or block any profile in two taps; an admin reviews every report.",
];

const docs = [
  { name: "Vaccination card", detail: "Rabies, DHPPi · updated Mar 2026" },
  { name: "Hip & elbow score", detail: "Both hips A · scored by vet" },
  { name: "Pedigree certificate", detail: "Registered with kennel club" },
];

export function Safety() {
  return (
    <section aria-labelledby="safety-heading" className="bg-paper-deep">
      <div className={`${wrap} grid items-center gap-14 py-24 md:grid-cols-2 md:py-32`}>
        <div>
          <h2 id="safety-heading" className="font-display text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[1.05]">
            The paperwork comes before the playdate.
          </h2>
          <ul className="mt-10 space-y-5">
            {rules.map((r) => (
              <li key={r} className="flex gap-3 text-lg">
                <Check size={22} className="mt-1 shrink-0 text-verified" aria-hidden="true" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <Reveal>
          <div className="rounded-[28px] border border-line bg-card p-6 shadow-[0_30px_60px_-34px_rgba(30,26,22,0.4)] sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
              <div>
                <p className="text-sm text-ink-soft">Health file</p>
                <p className="font-display text-[28px] leading-tight">Bruno, Golden Retriever</p>
              </div>
              <Rosette className="size-12 shrink-0" />
            </div>
            <ul>
              {docs.map((d) => (
                <li key={d.name} className="flex items-center gap-4 border-b border-line py-4 last:border-b-0">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-paper text-verified">
                    <FileCheck2 size={20} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-sm text-ink-soft">{d.detail}</p>
                  </div>
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-verified">
                    Verified
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 flex items-center gap-2 text-sm text-ink-soft">
              <Flag size={15} aria-hidden="true" /> Documents are checked by a Pawred admin before the badge
              appears.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Prompt rail ---------- */

export function PromptRail() {
  return (
    <section aria-labelledby="prompts-heading" className="py-24 md:py-32">
      <div className={`${wrap} flex flex-wrap items-end justify-between gap-6`}>
        <h2 id="prompts-heading" className="max-w-[18ch] font-display text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[1.05]">
          Every dog gets to speak for itself.
        </h2>
        <p className="max-w-[38ch] text-ink-soft">
          Sample profiles. Prompts tell you the things a photo can&apos;t: temperament, habits, health.
        </p>
      </div>

      {/* Animmaster slot: Slider component can replace this scroll-snap rail. */}
      <ul className={`${styles.rail} mt-12`} aria-label="Sample dog profiles">
        {sampleDogs.map((d) => (
          <li key={d.name} className={styles.item}>
            <article className="flex h-full flex-col rounded-[24px] border border-line bg-card p-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-paper-deep">
                <Image
                  src={`${d.photo}?w=700&q=72`}
                  alt={d.photoAlt}
                  fill
                  sizes="(min-width: 768px) 340px, 78vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                <h3 className="font-display text-[26px] leading-none">{d.name}</h3>
                <p className="mt-1 text-sm text-ink-soft">
                  {d.breed} · {d.sex} · {d.age} · {d.city}
                </p>
                <div className="mt-4 rounded-[16px] bg-paper p-4">
                  <p className="text-sm font-semibold text-ink-soft">{d.prompt}</p>
                  <p className="mt-1 text-[17px] leading-snug">{d.answer}</p>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Breeds ---------- */

export function Breeds() {
  return (
    <section id="breeds" aria-labelledby="breeds-heading" className="scroll-mt-8 pb-24 md:pb-32">
      <div className={wrap}>
        <h2 id="breeds-heading" className="font-display text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[1.05]">
          Start with your breed.
        </h2>
        <p className="mt-4 max-w-[52ch] text-ink-soft">
          Each breed has its own checks worth asking about. Our breed guides list them.
        </p>

        {/* Animmaster slot: Grid Animation for these tiles. */}
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:grid-rows-2">
          {breeds.slice(0, 5).map((b, i) => (
            <li key={b.slug} className={i === 0 ? "col-span-2 md:row-span-2" : ""}>
              <Link
                href={`/breeds/${b.slug}`}
                className="group relative block h-full min-h-[220px] overflow-hidden rounded-[24px] bg-paper-deep md:min-h-[260px]"
              >
                <Image
                  src={`${b.photo}?w=${i === 0 ? 1100 : 600}&q=72`}
                  alt={b.photoAlt}
                  fill
                  sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-4 pt-16 text-white sm:p-5">
                  <p className={`font-display leading-none ${i === 0 ? "text-[34px]" : "text-[22px]"}`}>{b.name}</p>
                  {i === 0 && <p className="mt-2 max-w-[40ch] text-sm text-white/85">{b.blurb}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Closing CTA ---------- */

export function ClosingCta() {
  return (
    <section aria-labelledby="cta-heading" className="px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="relative overflow-hidden rounded-[32px] bg-marigold">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-6 py-16 sm:px-10 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            <h2 id="cta-heading" className="font-display text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[1.0] text-ink">
              Your dog has a type. Let&apos;s find it.
            </h2>
            <p className="mt-5 max-w-[44ch] text-lg text-ink/80">
              A good profile takes about ten minutes. Have three photos and the vaccination card handy.
            </p>
            <Link
              href="/sign-up"
              className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-ink px-7 text-[17px] font-semibold text-paper transition-colors duration-200 hover:bg-felt"
            >
              Create your dog&apos;s profile <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[380px] overflow-hidden rounded-full border-[10px] border-ink/10">
            <Image
              src={`${photos.corgis}?w=800&q=72`}
              alt="Two corgis sitting together on a stone wall"
              fill
              sizes="380px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

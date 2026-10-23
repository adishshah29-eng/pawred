import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroProfile } from "@/components/landing/HeroProfile";
import {
  Breeds,
  ClosingCta,
  HowItWorks,
  NotASwipe,
  PromptRail,
  Safety,
} from "@/components/landing/Sections";

export default function LandingPage() {
  return (
    <>
      <section aria-labelledby="hero-heading" className="overflow-hidden">
        <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 pb-20 pt-6 sm:px-8 md:grid-cols-[5fr_6fr] md:gap-10 md:pb-28 md:pt-10">
          <div>
            <h1
              id="hero-heading"
              className="font-display text-[clamp(3rem,5.6vw,5rem)] leading-[0.98] tracking-[-0.02em]"
            >
              Find a match your dog would choose.
            </h1>
            <p className="mt-6 max-w-[42ch] text-lg text-ink-soft">
              Careful matchmaking for dog owners. Every profile shows breed, health checks and
              vaccination status, and you like the one detail that won you over.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link
                href="/sign-up"
                className="inline-flex h-14 items-center gap-2 rounded-full bg-marigold px-7 text-[17px] font-semibold text-ink shadow-[0_10px_24px_-12px_rgba(201,131,31,0.9)] transition-colors duration-200 hover:bg-marigold-deep"
              >
                Create your dog&apos;s profile <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="#how-it-works"
                className="font-semibold underline decoration-line underline-offset-4 hover:decoration-ink"
              >
                See how it works
              </Link>
            </div>
            <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-6 text-sm text-ink-soft">
              <li>Opposite sex only</li>
              <li>Same breed by default</li>
              <li>18 months and older</li>
            </ul>
          </div>
          <HeroProfile />
        </div>
      </section>

      <NotASwipe />
      <HowItWorks />
      <Safety />
      <PromptRail />
      <Breeds />
      <ClosingCta />
    </>
  );
}

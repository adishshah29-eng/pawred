import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Shared layout for the long-form marketing pages (How it works, Safety).

export function PageIntro({ title, lead }: { title: string; lead: string }) {
  return (
    <header className="mx-auto max-w-[1240px] px-5 pb-14 pt-8 sm:px-8 md:pb-20 md:pt-14">
      <h1 className="max-w-[16ch] font-display text-[clamp(2.75rem,6vw,5rem)] leading-[0.98] tracking-[-0.02em]">{title}</h1>
      <p className="mt-6 max-w-[52ch] text-xl text-ink-soft">{lead}</p>
    </header>
  );
}

export function Block({
  title,
  children,
  tone = "paper",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "paper" | "deep" | "felt";
}) {
  const bg = tone === "felt" ? "bg-felt text-on-felt" : tone === "deep" ? "bg-paper-deep" : "";
  return (
    <section className={bg}>
      <div className="mx-auto grid max-w-[1240px] gap-8 px-5 py-16 sm:px-8 md:grid-cols-[5fr_7fr] md:gap-14 md:py-24">
        <h2 className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.05]">{title}</h2>
        <div className={`grid gap-5 text-lg ${tone === "felt" ? "text-on-felt-soft" : "text-ink-soft"} [&_strong]:font-semibold ${tone === "felt" ? "[&_strong]:text-on-felt" : "[&_strong]:text-ink"}`}>
          {children}
        </div>
      </div>
    </section>
  );
}

export function ClosingLink({ title, href, label }: { title: string; href: string; label: string }) {
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-20 text-center sm:px-8">
      <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-tight">{title}</h2>
      <Link
        href={href}
        className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-marigold px-7 text-[17px] font-semibold text-ink transition-colors hover:bg-marigold-deep"
      >
        {label} <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </section>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col justify-center px-5 py-24">
      <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] leading-[1.02]">This trail went cold.</h1>
      <p className="mt-4 text-lg text-ink-soft">We couldn&apos;t find that page. It may have moved, or the link is wrong.</p>
      <Link href="/" className="mt-8 inline-flex h-12 w-fit items-center rounded-full bg-ink px-6 font-semibold text-paper">
        Go to the home page
      </Link>
    </main>
  );
}

import Link from "next/link";

// Temporary page body for routes built in later phases.
export function Placeholder({
  title,
  phase,
  children,
}: {
  title: string;
  phase: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[760px] px-5 py-24 sm:px-8">
      <h1 className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.05]">{title}</h1>
      <p className="mt-4 text-lg text-ink-soft">This page is built in {phase} of the implementation plan.</p>
      {children}
      <Link href="/" className="mt-10 inline-block font-semibold underline underline-offset-4">
        Back to the home page
      </Link>
    </div>
  );
}

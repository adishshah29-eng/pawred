"use client";

import Link from "next/link";
import { useEffect } from "react";

// Shown when a page throws an unexpected error.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col justify-center px-5 py-24">
      <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] leading-[1.02]">Something went wrong.</h1>
      <p className="mt-4 text-lg text-ink-soft">
        That&apos;s on us, not you. Try again, and if it keeps happening, come back in a few minutes.
        {error.digest && <span className="mt-2 block text-sm">Error reference: {error.digest}</span>}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-paper hover:bg-felt">
          Try again
        </button>
        <Link href="/" className="inline-flex h-12 items-center rounded-full border border-line px-6 font-semibold hover:bg-paper-deep">
          Go to the home page
        </Link>
      </div>
    </main>
  );
}

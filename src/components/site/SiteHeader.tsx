"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Wordmark } from "./Wordmark";
import { useSession } from "@/lib/auth-client";

const links = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/safety", label: "Safety" },
  { href: "/#breeds", label: "Breeds" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="relative z-30">
      <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="Pawred home" className="rounded-md">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[15px] text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <Link
              href="/discover"
              className="rounded-full bg-ink px-5 py-2.5 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-felt"
            >
              Open Pawred
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-full px-4 py-2.5 text-[15px] font-medium text-ink transition-colors duration-200 hover:bg-paper-deep"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-ink px-5 py-2.5 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-felt"
              >
                Create a profile
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-full text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-20 border-y border-line bg-card px-5 pb-6 pt-2 shadow-[0_12px_30px_-12px_rgba(30,26,22,0.25)] md:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-4 text-lg"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          {session ? (
            <Link
              href="/discover"
              className="mt-5 block rounded-full bg-ink py-3 text-center font-semibold text-paper"
            >
              Open Pawred
            </Link>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Link
                href="/sign-in"
                className="rounded-full border border-line py-3 text-center font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-ink py-3 text-center font-semibold text-paper"
              >
                Create a profile
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

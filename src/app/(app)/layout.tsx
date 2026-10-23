import Link from "next/link";
import { Suspense } from "react";
import { Heart, MessageCircle, Search, Settings } from "lucide-react";
import { Wordmark } from "@/components/site/Wordmark";
import { AccountSummary, UserGate } from "@/components/auth/Gates";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { NavBadge } from "@/components/auth/NavBadge";
import { NavLink } from "@/components/app/NavLink";
import { ActiveDogAvatar, ActiveDogCard } from "@/components/app/ActiveDog";
import { ToastHost } from "@/components/app/Toast";

// App shell for signed-in users.
// Guards: proxy.ts bounces visitors with no session cookie; UserGate then
// verifies the session on the server before any page content renders.
// Every page here depends on who is signed in, so these routes render per
// request instead of being validated for instant (prebuilt) navigation.
export const instant = false;

const nav = [
  { href: "/discover", label: "Discover", icon: <Search size={19} aria-hidden="true" /> },
  { href: "/likes", label: "Likes you", icon: <Heart size={19} aria-hidden="true" />, badge: "likes" as const },
  { href: "/matches", label: "Matches", icon: <MessageCircle size={19} aria-hidden="true" />, badge: "matches" as const },
  { href: "/settings", label: "Settings", icon: <Settings size={19} aria-hidden="true" /> },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line px-4 py-7 md:flex">
        <Link href="/discover" aria-label="Pawred discover" className="px-2">
          <Wordmark />
        </Link>

        <Suspense fallback={<div className="mt-8 h-[68px] animate-pulse rounded-2xl bg-paper-deep" />}>
          <ActiveDogCard />
        </Suspense>

        <nav aria-label="App" className="mt-6 flex flex-col gap-1">
          {nav.map(({ href, label, icon, badge }) => (
            <NavLink
              key={href}
              href={href}
              label={label}
              icon={icon}
              badge={
                badge && (
                  <Suspense fallback={null}>
                    <span className="ml-auto">
                      <NavBadge kind={badge} />
                    </span>
                  </Suspense>
                )
              }
            />
          ))}
        </nav>

        <div className="mt-auto border-t border-line px-2 pt-5">
          <Suspense fallback={<div className="h-11 animate-pulse rounded-xl bg-paper-deep" />}>
            <AccountSummary />
          </Suspense>
          <SignOutButton className="-mx-1 mt-3 flex h-11 w-full items-center gap-3 rounded-xl px-1 text-ink-soft transition-colors duration-200 hover:text-ink" />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Phones: brand and the active dog stay visible at the top. */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper px-4 md:hidden">
          <Link href="/discover" aria-label="Pawred discover">
            <Wordmark />
          </Link>
          <Suspense fallback={<div className="size-10 animate-pulse rounded-full bg-paper-deep" />}>
            <ActiveDogAvatar />
          </Suspense>
        </header>

        <main className="pb-20 md:pb-0">
          <Suspense fallback={<PageSkeleton />}>
            <UserGate>{children}</UserGate>
          </Suspense>
        </main>
      </div>

      <ToastHost />

      <nav aria-label="App" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-card md:hidden">
        {nav.map(({ href, label, icon, badge }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            variant="tab"
            badge={
              badge && (
                <Suspense fallback={null}>
                  <NavBadge kind={badge} />
                </Suspense>
              )
            }
          />
        ))}
      </nav>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[640px] px-5 py-12 sm:px-8" aria-busy="true" aria-label="Loading">
      <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-paper-deep" />
      <div className="mt-5 h-5 w-1/2 animate-pulse rounded-full bg-paper-deep" />
      <div className="mt-10 h-64 animate-pulse rounded-[28px] bg-paper-deep" />
    </div>
  );
}

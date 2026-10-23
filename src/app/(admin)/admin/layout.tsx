import Link from "next/link";
import { Suspense } from "react";
import { Wordmark } from "@/components/site/Wordmark";
import { AdminGate } from "@/components/auth/Gates";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { AdminNav, AdminNavFallback } from "@/components/app/AdminNav";

// Admin shell. proxy.ts requires a session cookie; AdminGate then checks
// on the server that the user really has the "admin" role.
// Admin pages depend on who is signed in, so they render per request.
export const instant = false;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <Wordmark />
            <span className="rounded-full bg-felt px-2.5 py-0.5 text-xs font-semibold text-on-felt">Admin</span>
          </Link>

          <div className="order-last w-full md:order-none md:w-auto md:flex-1">
            <Suspense fallback={<AdminNavFallback />}>
              <AdminNav />
            </Suspense>
          </div>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link href="/discover" className="inline-flex h-10 items-center rounded-full px-4 text-[15px] text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink">
              Open the app
            </Link>
            <SignOutButton className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[15px] text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink" />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Suspense fallback={<p className="mx-auto max-w-[1240px] px-5 py-24 text-ink-soft sm:px-8">Checking access…</p>}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </main>
    </div>
  );
}

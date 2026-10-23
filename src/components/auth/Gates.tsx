import Link from "next/link";
import { requireAdmin, requireUser } from "@/lib/session";

// Server-side guards. Each one reads the session, so place it inside <Suspense>.

export async function UserGate({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <>{children}</>;
}

export async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

/** Signed-in owner's name and email, for the bottom of the app sidebar. */
export async function AccountSummary() {
  const user = await requireUser();
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold">{user.name}</p>
      <p className="truncate text-xs text-ink-soft">{user.email}</p>
      {user.role === "admin" && (
        <Link href="/admin" className="mt-1.5 inline-block text-sm font-semibold text-verified underline underline-offset-4">
          Admin panel
        </Link>
      )}
    </div>
  );
}

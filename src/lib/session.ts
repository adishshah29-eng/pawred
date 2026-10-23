import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Data Access Layer for auth. Every server-side permission check goes through here.
// These read the request, so call them inside a <Suspense> boundary (Cache Components).

// React's cache() makes this run once per request, however many layouts, pages and
// badges ask for the session. Each lookup would otherwise cost database round trips.
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/** Signed-in user, or redirect to sign-in. */
export async function requireUser(next?: string) {
  const session = await getSession();
  if (!session) redirect(next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in");
  return session.user;
}

/** Signed-in admin, or redirect away. */
export async function requireAdmin() {
  const user = await requireUser("/admin");
  if (user.role !== "admin") redirect("/discover");
  return user;
}

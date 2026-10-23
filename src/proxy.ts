import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// First line of defence: no session cookie → straight to sign-in.
// This only checks that a cookie exists (fast, no database call).
// The real checks (valid session, admin role) happen on the server in
// src/lib/session.ts, called from the (app) and (admin) layouts.
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: [
    "/onboarding/:path*",
    "/discover/:path*",
    "/likes/:path*",
    "/matches/:path*",
    "/dogs/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};

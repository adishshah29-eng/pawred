import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";

// Social sign-in is switched on only when its keys are in .env,
// so the app still works before you create the Google / GitHub apps.
const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }
    : undefined;

const github =
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? { clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET }
    : undefined;

export const enabledSocialProviders = {
  google: Boolean(google),
  github: Boolean(github),
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  session: {
    // Keep a signed copy of the session in the cookie for a minute, so most page loads
    // skip the database lookup. Bans and role changes take effect within that minute.
    cookieCache: { enabled: true, maxAge: 60 },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true, // signed in straight after sign-up
  },
  socialProviders: {
    ...(google && { google }),
    ...(github && { github }),
  },
  plugins: [
    // Roles ("user" | "admin") and bans. Promote yourself with: npm run make-admin -- you@email.com
    admin({ defaultRole: "user", adminRoles: ["admin"] }),
    // Lets Server Actions set auth cookies. Must stay last.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;

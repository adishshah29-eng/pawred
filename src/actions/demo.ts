"use server";

// One-click sign-in for the demo accounts. Only works while DEMO_MODE="true",
// and only for the accounts listed in src/lib/demo-accounts.ts.

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DEMO_ACCOUNTS, demoEnabled } from "@/lib/demo-accounts";

export type DemoState = { error?: string };

export async function signInDemo(_prev: DemoState, formData: FormData): Promise<DemoState> {
  if (!demoEnabled()) return { error: "Demo mode is switched off." };

  const account = DEMO_ACCOUNTS.find((a) => a.email === String(formData.get("email") ?? ""));
  const password = process.env.DEMO_PASSWORD;
  if (!account) return { error: "Unknown demo account." };
  if (!password) return { error: "DEMO_PASSWORD isn't set. Add it to .env and run npm run db:seed." };

  try {
    await auth.api.signInEmail({ body: { email: account.email, password }, headers: await headers() });
  } catch {
    return { error: "Couldn't sign in. Run npm run db:seed to (re)create the demo accounts." };
  }
  redirect(account.role === "admin" ? "/admin" : "/discover");
}

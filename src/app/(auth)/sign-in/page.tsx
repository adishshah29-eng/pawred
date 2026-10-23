import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { DemoPanel } from "@/components/auth/DemoPanel";
import { enabledSocialProviders } from "@/lib/auth";
import { DEMO_ACCOUNTS, demoEnabled } from "@/lib/demo-accounts";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="w-full max-w-[460px]">
      <Suspense>
        <AuthForm mode="sign-in" providers={enabledSocialProviders} />
      </Suspense>
      {demoEnabled() && <DemoPanel accounts={DEMO_ACCOUNTS} />}
    </div>
  );
}

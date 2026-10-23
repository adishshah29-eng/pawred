import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { enabledSocialProviders } from "@/lib/auth";

export const metadata: Metadata = { title: "Create your account" };

export default function SignUpPage() {
  return (
    // The form reads ?next= from the URL, so it renders behind a Suspense boundary.
    <Suspense>
      <AuthForm mode="sign-up" providers={enabledSocialProviders} />
    </Suspense>
  );
}

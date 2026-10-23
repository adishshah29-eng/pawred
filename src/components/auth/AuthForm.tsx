"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";
type Providers = { google: boolean; github: boolean };

// Only allow redirects back into this site.
function safeNext(value: string | null, fallback: string) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export function AuthForm({ mode, providers }: { mode: Mode; providers: Providers }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"), mode === "sign-up" ? "/onboarding" : "/discover");

  const [pending, setPending] = useState<"email" | "google" | "github" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const ids = { name: useId(), email: useId(), password: useId(), error: useId() };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setPending("email");

    const { error } =
      mode === "sign-up"
        ? await signUp.email({ name: String(form.get("name") ?? "").trim(), email, password })
        : await signIn.email({ email, password });

    if (error) {
      setPending(null);
      setError(friendlyError(error.code, error.message, mode));
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function social(provider: "google" | "github") {
    setError(null);
    setPending(provider);
    const { error } = await signIn.social({
      provider,
      callbackURL: next,
      newUserCallbackURL: "/onboarding",
      errorCallbackURL: mode === "sign-up" ? "/sign-up" : "/sign-in",
    });
    if (error) {
      setPending(null);
      setError(error.message ?? "That didn't work. Please try again.");
    }
  }

  const busy = pending !== null;
  const anySocial = providers.google || providers.github;

  return (
    <div className="w-full max-w-[420px]">
      <h1 className="font-display text-[clamp(2.25rem,4vw,3rem)] leading-[1.05]">
        {mode === "sign-up" ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-3 text-ink-soft">
        {mode === "sign-up"
          ? "Next you'll set up your dog's profile. It takes about ten minutes."
          : "Sign in to see who liked your dog."}
      </p>

      {anySocial && (
        <div className="mt-8 grid gap-3">
          {providers.google && (
            <SocialButton label="Continue with Google" busy={pending === "google"} disabled={busy} onClick={() => social("google")}>
              <GoogleMark />
            </SocialButton>
          )}
          {providers.github && (
            <SocialButton label="Continue with GitHub" busy={pending === "github"} disabled={busy} onClick={() => social("github")}>
              <GitHubMark />
            </SocialButton>
          )}
        </div>
      )}

      {anySocial && (
        <div className="my-7 flex items-center gap-4 text-sm text-ink-soft" aria-hidden="true">
          <span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" />
        </div>
      )}

      <form onSubmit={onSubmit} noValidate={false} aria-describedby={error ? ids.error : undefined} className={anySocial ? "" : "mt-8"}>
        <div className="grid gap-5">
          {mode === "sign-up" && (
            <Field id={ids.name} label="Your name">
              <input id={ids.name} name="name" required autoComplete="name" maxLength={80} className={inputClass} />
            </Field>
          )}
          <Field id={ids.email} label="Email">
            <input id={ids.email} name="email" type="email" required autoComplete="email" className={inputClass} />
          </Field>
          <Field
            id={ids.password}
            label="Password"
            hint={mode === "sign-up" ? "At least 8 characters." : undefined}
          >
            <div className="relative">
              <input
                id={ids.password}
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-1 my-auto grid size-11 place-items-center rounded-full text-ink-soft hover:text-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </Field>
        </div>

        {error && (
          <p id={ids.error} role="alert" className="mt-5 rounded-2xl bg-danger/10 px-4 py-3 text-[15px] text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-7 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-ink text-[17px] font-semibold text-paper transition-colors duration-200 hover:bg-felt disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending === "email" && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
          {mode === "sign-up" ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-7 text-ink-soft">
        {mode === "sign-up" ? "Already have an account? " : "New to Pawred? "}
        <Link
          href={`${mode === "sign-up" ? "/sign-in" : "/sign-up"}${params.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-ink underline underline-offset-4"
        >
          {mode === "sign-up" ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}

const inputClass =
  "h-12 w-full rounded-2xl border border-line bg-card px-4 text-[16px] text-ink transition-colors focus:border-marigold-deep focus:outline-none";

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[15px] font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-sm text-ink-soft">{hint}</p>}
    </div>
  );
}

function SocialButton({
  label,
  busy,
  disabled,
  onClick,
  children,
}: {
  label: string;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-line bg-card font-semibold transition-colors duration-200 hover:bg-paper-deep disabled:cursor-not-allowed disabled:opacity-70"
    >
      {busy ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : children}
      {label}
    </button>
  );
}

function friendlyError(code: string | undefined, message: string | undefined, mode: Mode) {
  switch (code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "That email and password don't match. Check them, or create an account.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with this email already exists. Sign in instead.";
    case "PASSWORD_TOO_SHORT":
      return "Your password needs at least 8 characters.";
    case "INVALID_EMAIL":
      return "That email address doesn't look right.";
    case "BANNED_USER":
      return "This account has been suspended. Contact the Pawred team if you think this is a mistake.";
    default:
      return message ?? (mode === "sign-up" ? "We couldn't create your account. Please try again." : "We couldn't sign you in. Please try again.");
  }
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8Z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.7H2.1v2.8A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.7 14c-.2-.7-.4-1.3-.4-2s.1-1.4.4-2V7.2H2.1a11 11 0 0 0 0 9.6L5.7 14Z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.1 7.2L5.7 10c.9-2.7 3.4-4.6 6.3-4.6Z" />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

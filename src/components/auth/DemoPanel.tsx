"use client";

import { useActionState } from "react";
import { Dog, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
import { signInDemo, type DemoState } from "@/actions/demo";
import type { DemoAccount } from "@/lib/demo-accounts";

// Shown on /sign-in while DEMO_MODE="true". Each button signs in as that account.
// Tip for presenting two people at once: open a normal window and a private window.
export function DemoPanel({ accounts }: { accounts: DemoAccount[] }) {
  const [state, action, pending] = useActionState<DemoState, FormData>(signInDemo, {});

  return (
    <section aria-labelledby="demo-title" className="mt-10 rounded-[24px] border border-dashed border-marigold-deep/60 bg-marigold/10 p-5">
      <h2 id="demo-title" className="flex items-center gap-2 font-semibold">
        <Sparkles size={17} className="text-marigold-deep" aria-hidden="true" /> Demo accounts
      </h2>
      <p className="mt-1 text-sm text-ink-soft">Sign in as a sample account with one click. Use a private window for the second person.</p>

      <form action={action} className="mt-4 grid gap-2">
        {accounts.map((a) => (
          <button
            key={a.id}
            type="submit"
            name="email"
            value={a.email}
            disabled={pending}
            className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3 text-left transition-colors hover:border-ink disabled:cursor-wait disabled:opacity-70"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-paper-deep text-ink">
              {a.role === "admin" ? <ShieldCheck size={19} aria-hidden="true" /> : <Dog size={19} aria-hidden="true" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">
                {a.name}
                <span className="font-normal text-ink-soft">{a.dog ? ` · ${a.dog.name}, ${a.dog.breed}` : " · Admin"}</span>
              </span>
              <span className="block text-sm text-ink-soft">{a.blurb}</span>
            </span>
            {pending && <LoaderCircle size={18} className="shrink-0 animate-spin text-ink-soft" aria-hidden="true" />}
          </button>
        ))}
      </form>

      {state.error && (
        <p role="alert" className="mt-3 rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}
    </section>
  );
}

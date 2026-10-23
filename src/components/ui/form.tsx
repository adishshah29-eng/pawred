"use client";

import { startTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CircleCheck, LoaderCircle } from "lucide-react";

/**
 * Runs a Server Action from a form's onSubmit.
 * Unlike <form action={…}>, this doesn't clear the form after submitting,
 * so a validation error never wipes what the person typed.
 */
export function useFormAction<S>(action: (prev: Awaited<S>, data: FormData) => Promise<S>, initial: Awaited<S>) {
  const [state, run, pending] = useActionState<S, FormData>(action, initial);
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => run(data));
  }
  function submit(data: FormData) {
    startTransition(() => run(data));
  }
  return { state, onSubmit, submit, pending };
}

export const inputClass =
  "h-12 w-full rounded-2xl border border-line bg-card px-4 text-[16px] text-ink transition-colors focus:border-marigold-deep focus:outline-none aria-[invalid=true]:border-danger";

export const textareaClass =
  "w-full resize-y rounded-2xl border border-line bg-card px-4 py-3 text-[16px] leading-snug text-ink transition-colors focus:border-marigold-deep focus:outline-none aria-[invalid=true]:border-danger";

export function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-2 text-[15px] font-medium">
        {label}
        {optional && <span className="text-sm font-normal text-ink-soft">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-sm text-ink-soft">{hint}</p>
      )}
    </div>
  );
}

/** Props that link an input to its error message for screen readers. */
export function errorProps(id: string, error?: string) {
  return error ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` } : {};
}

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
  className = "",
  pending: pendingProp,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary";
  className?: string;
  /** Pass this when the form uses useFormAction (onSubmit) instead of action={…}. */
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  const styles =
    variant === "primary"
      ? "bg-ink text-paper hover:bg-felt"
      : "border border-line bg-card text-ink hover:bg-paper-deep";
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${styles} ${className}`}
    >
      {pending && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
      {pending ? pendingLabel : children}
    </button>
  );
}

export function FormAlert({ error, message }: { error?: string; message?: string }) {
  if (error) {
    return (
      <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-[15px] text-danger">
        {error}
      </p>
    );
  }
  if (message) {
    return (
      <p role="status" className="flex items-center gap-2 rounded-2xl bg-verified/10 px-4 py-3 text-[15px] text-verified">
        <CircleCheck size={18} aria-hidden="true" /> {message}
      </p>
    );
  }
  return null;
}

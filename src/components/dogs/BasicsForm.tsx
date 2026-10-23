"use client";

import { useId } from "react";
import { saveBasics, type ActionState } from "@/actions/dogs";
import type { BreedOption } from "@/lib/breeds";
import { MIN_AGE_MONTHS } from "@/lib/validators";
import { Field, FormAlert, SubmitButton, errorProps, inputClass, textareaClass, useFormAction } from "@/components/ui/form";

type Dog = {
  id: string;
  name: string;
  breed: string;
  sex: "MALE" | "FEMALE";
  dateOfBirth: Date;
  weightKg: number | null;
  city: string;
  bio: string | null;
  openToMixed: boolean;
};

const toDateInput = (d: Date) => new Date(d).toISOString().slice(0, 10);

// Errors for fields that have their own message slot on screen.
const SHOWN = ["name", "breed", "sex", "dateOfBirth", "weightKg", "city", "bio"];

/** Any error without a visible field still gets shown, so a save never fails silently. */
function unshownError(e: Record<string, string>) {
  const key = Object.keys(e).find((k) => !SHOWN.includes(k));
  return key ? e[key] : undefined;
}

export function BasicsForm({
  dog,
  breeds,
  defaultCity,
  next,
  submitLabel = "Continue",
}: {
  dog?: Dog | null;
  breeds: BreedOption[];
  defaultCity?: string | null;
  next?: string;
  submitLabel?: string;
}) {
  const { state, onSubmit, pending } = useFormAction<ActionState>(saveBasics, {});
  const e = state.fieldErrors ?? {};
  const id = useId();
  const ids = {
    name: `${id}-name`,
    breed: `${id}-breed`,
    dob: `${id}-dob`,
    weight: `${id}-weight`,
    city: `${id}-city`,
    bio: `${id}-bio`,
  };
  // Latest date that still passes the 18-month rule, as a hint for the date picker.
  const maxDob = new Date();
  maxDob.setMonth(maxDob.getMonth() - MIN_AGE_MONTHS);

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      {dog && <input type="hidden" name="dogId" value={dog.id} />}
      {next && <input type="hidden" name="next" value={next} />}

      <Field id={ids.name} label="Dog's name" error={e.name}>
        <input id={ids.name} name="name" defaultValue={dog?.name} required maxLength={40} className={inputClass} {...errorProps(ids.name, e.name)} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={ids.breed} label="Breed" error={e.breed}>
          <select id={ids.breed} name="breed" defaultValue={dog?.breed ?? ""} required className={inputClass} {...errorProps(ids.breed, e.breed)}>
            <option value="" disabled>
              Choose a breed
            </option>
            {breeds.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>

        <fieldset>
          <legend className="mb-1.5 text-[15px] font-medium">Sex</legend>
          <div className="grid grid-cols-2 gap-2" {...(e.sex ? { "aria-describedby": `${id}-sex-error` } : {})}>
            {(["MALE", "FEMALE"] as const).map((s) => (
              <label
                key={s}
                className="flex h-12 cursor-pointer items-center justify-center rounded-2xl border border-line bg-card font-medium transition-colors has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-marigold-deep"
              >
                <input type="radio" name="sex" value={s} defaultChecked={dog?.sex === s} required className="sr-only" />
                {s === "MALE" ? "Male" : "Female"}
              </label>
            ))}
          </div>
          {e.sex && (
            <p id={`${id}-sex-error`} className="mt-1.5 text-sm text-danger">
              {e.sex}
            </p>
          )}
        </fieldset>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={ids.dob} label="Date of birth" error={e.dateOfBirth} hint={`At least ${MIN_AGE_MONTHS} months old to be listed.`}>
          <input
            id={ids.dob}
            name="dateOfBirth"
            type="date"
            required
            max={toDateInput(maxDob)}
            defaultValue={dog ? toDateInput(dog.dateOfBirth) : undefined}
            className={inputClass}
            {...errorProps(ids.dob, e.dateOfBirth)}
          />
        </Field>
        <Field id={ids.weight} label="Weight (kg)" optional error={e.weightKg}>
          <input
            id={ids.weight}
            name="weightKg"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0.5"
            max="120"
            defaultValue={dog?.weightKg ?? ""}
            className={inputClass}
            {...errorProps(ids.weight, e.weightKg)}
          />
        </Field>
      </div>

      <Field id={ids.city} label="City" error={e.city} hint="Other owners see your city, never your address.">
        <input
          id={ids.city}
          name="city"
          required
          autoComplete="address-level2"
          defaultValue={dog?.city ?? defaultCity ?? ""}
          className={inputClass}
          {...errorProps(ids.city, e.city)}
        />
      </Field>

      <Field id={ids.bio} label="A line about your dog" optional error={e.bio}>
        <textarea id={ids.bio} name="bio" rows={3} maxLength={300} defaultValue={dog?.bio ?? ""} className={textareaClass} {...errorProps(ids.bio, e.bio)} />
      </Field>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-card p-4">
        <input type="checkbox" name="openToMixed" defaultChecked={dog?.openToMixed} className="mt-1 size-5 accent-[var(--ink)]" />
        <span>
          <span className="block font-medium">Open to other breeds</span>
          <span className="text-sm text-ink-soft">By default you only see dogs of the same breed. Turn this on to see other breeds whose owners also opted in.</span>
        </span>
      </label>

      <FormAlert error={state.error ?? unshownError(e)} />
      <div>
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

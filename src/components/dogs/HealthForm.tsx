"use client";

import { useEffect, useId, useRef } from "react";
import { FileCheck2, FileClock, FileX2, Trash2, Upload } from "lucide-react";
import { deleteHealthDoc, saveHealth, uploadHealthDoc, type ActionState } from "@/actions/dogs";
import { DOC_LABELS } from "@/lib/health";
import { Field, FormAlert, SubmitButton, errorProps, inputClass, useFormAction } from "@/components/ui/form";

type Doc = { id: string; type: string; status: "PENDING" | "APPROVED" | "REJECTED"; createdAt: Date };

const STATUS = {
  PENDING: { label: "Waiting for review", icon: FileClock, className: "text-ink-soft" },
  APPROVED: { label: "Verified", icon: FileCheck2, className: "text-verified" },
  REJECTED: { label: "Not accepted", icon: FileX2, className: "text-danger" },
} as const;

/** Vaccination yes/no plus the button that finishes onboarding (or saves on the edit page). */
export function HealthForm({
  dogId,
  vaccinated,
  next,
  submitLabel = "Finish",
}: {
  dogId: string;
  vaccinated: boolean;
  next?: string;
  submitLabel?: string;
}) {
  const { state, onSubmit, pending } = useFormAction<ActionState>(saveHealth, {});
  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <input type="hidden" name="dogId" value={dogId} />
      {next && <input type="hidden" name="next" value={next} />}
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-card p-4">
        <input type="checkbox" name="vaccinated" defaultChecked={vaccinated} className="mt-1 size-5 accent-[var(--ink)]" />
        <span>
          <span className="block font-medium">Vaccinations are up to date</span>
          <span className="text-sm text-ink-soft">Rabies and the core DHPPi shots. Upload the vaccination card to get the Verified badge.</span>
        </span>
      </label>
      <FormAlert error={state.error} />
      <div>
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

/** Upload health documents and see their review status. */
export function HealthDocs({ dogId, docs }: { dogId: string; docs: Doc[] }) {
  const { state, onSubmit, pending } = useFormAction<ActionState>(uploadHealthDoc, {});
  const e = state.fieldErrors ?? {};
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the chosen file after a successful upload.
  useEffect(() => {
    if (state.message) formRef.current?.reset();
  }, [state]);

  return (
    <div className="grid gap-5">
      {docs.length > 0 && (
        <ul className="divide-y divide-line rounded-[24px] border border-line bg-card">
          {docs.map((d) => {
            const s = STATUS[d.status];
            return (
              <li key={d.id} className="flex items-center gap-4 px-5 py-4">
                <s.icon size={22} className={`shrink-0 ${s.className}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{DOC_LABELS[d.type] ?? d.type}</p>
                  <p className={`text-sm ${s.className}`}>{s.label}</p>
                </div>
                <form action={deleteHealthDoc}>
                  <input type="hidden" name="docId" value={d.id} />
                  <button
                    type="submit"
                    className="grid size-11 place-items-center rounded-full text-ink-soft hover:bg-paper hover:text-danger"
                    aria-label={`Remove ${DOC_LABELS[d.type] ?? "document"}`}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="grid gap-4 rounded-[24px] border border-dashed border-line p-5"
      >
        <input type="hidden" name="dogId" value={dogId} />
        <p className="font-semibold">Add a document</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={`${id}-type`} label="Type" error={e.type}>
            <select id={`${id}-type`} name="type" defaultValue="VACCINATION" className={inputClass} {...errorProps(`${id}-type`, e.type)}>
              {Object.entries(DOC_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field id={`${id}-file`} label="File" error={e.file} hint="PDF or photo, up to 4 MB.">
            <input
              id={`${id}-file`}
              name="file"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="block w-full text-sm file:mr-3 file:h-12 file:rounded-full file:border-0 file:bg-paper-deep file:px-4 file:font-semibold file:text-ink hover:file:bg-line"
              {...errorProps(`${id}-file`, e.file)}
            />
          </Field>
        </div>
        <p className="text-sm text-ink-soft">Only Pawred admins can open your documents. Other owners just see the Verified badge.</p>
        <FormAlert error={state.error} message={state.message} />
        <div>
          <SubmitButton pending={pending} variant="secondary" pendingLabel="Uploading…">
            <Upload size={18} aria-hidden="true" /> Upload
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}

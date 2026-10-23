"use client";

import { useId, useState } from "react";
import { savePrompts, type ActionState } from "@/actions/dogs";
import { ANSWER_MAX, PROMPTS } from "@/lib/prompts";
import { FormAlert, SubmitButton, errorProps, inputClass, textareaClass, useFormAction } from "@/components/ui/form";

type Existing = { prompt: string; answer: string }[];

const DEFAULTS = [PROMPTS[0], PROMPTS[1], PROMPTS[2]];

export function PromptsForm({
  dogId,
  dogName,
  existing,
  next,
  submitLabel = "Continue",
}: {
  dogId: string;
  dogName: string;
  existing: Existing;
  next?: string;
  submitLabel?: string;
}) {
  const { state, onSubmit, pending } = useFormAction<ActionState>(savePrompts, {});
  const e = state.fieldErrors ?? {};
  const id = useId();
  const [answers, setAnswers] = useState(() => [0, 1, 2].map((i) => existing[i]?.answer ?? ""));

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <input type="hidden" name="dogId" value={dogId} />
      {next && <input type="hidden" name="next" value={next} />}
      <p className="text-ink-soft">Write in {dogName}&apos;s voice. Owners like a specific answer, so make each one count.</p>

      {[0, 1, 2].map((i) => {
        const promptId = `${id}-p${i}`;
        const answerId = `${id}-a${i}`;
        const pErr = e[`prompts.${i}.prompt`];
        const aErr = e[`prompts.${i}.answer`];
        return (
          <fieldset key={i} className="rounded-[24px] border border-line bg-card p-5">
            <legend className="sr-only">Prompt {i + 1}</legend>
            <label htmlFor={promptId} className="mb-1.5 block text-sm font-medium text-ink-soft">
              Prompt {i + 1}
            </label>
            <select
              id={promptId}
              name={`prompt${i}`}
              defaultValue={existing[i]?.prompt ?? DEFAULTS[i]}
              className={`${inputClass} font-semibold`}
              {...errorProps(promptId, pErr)}
            >
              {PROMPTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {pErr && (
              <p id={`${promptId}-error`} className="mt-1.5 text-sm text-danger">
                {pErr}
              </p>
            )}

            <label htmlFor={answerId} className="sr-only">
              Answer {i + 1}
            </label>
            <textarea
              id={answerId}
              name={`answer${i}`}
              rows={3}
              maxLength={ANSWER_MAX}
              value={answers[i]}
              onChange={(ev) => setAnswers((a) => a.map((v, j) => (j === i ? ev.target.value : v)))}
              placeholder="Your answer"
              className={`${textareaClass} mt-3`}
              {...errorProps(answerId, aErr)}
            />
            <div className="mt-1.5 flex justify-between gap-4 text-sm">
              <span className="text-danger" id={`${answerId}-error`}>
                {aErr}
              </span>
              <span className="tabular-nums text-ink-soft">
                {answers[i].length}/{ANSWER_MAX}
              </span>
            </div>
          </fieldset>
        );
      })}

      <FormAlert error={e.prompts ?? state.error} />
      <div>
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

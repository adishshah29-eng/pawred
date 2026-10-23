import { z } from "zod";
import { ANSWER_MAX, PROMPT_COUNT, PROMPTS } from "./prompts";

export const MIN_AGE_MONTHS = 18;

// HTML checkboxes send "on" when ticked and nothing at all when not.
const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on" || v === "true");

function monthsBetween(from: Date, to: Date) {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) - (to.getDate() < from.getDate() ? 1 : 0);
}

export const basicsSchema = z.object({
  name: z.string().trim().min(1, "Give your dog a name.").max(40, "Keep the name under 40 characters."),
  breed: z.string().trim().min(1, "Choose a breed."),
  sex: z.enum(["MALE", "FEMALE"], { error: "Choose male or female." }),
  dateOfBirth: z.coerce
    .date({ error: "Enter a date of birth." })
    .refine((d) => d <= new Date(), "The date of birth can't be in the future.")
    .refine((d) => monthsBetween(d, new Date()) >= MIN_AGE_MONTHS, `Dogs need to be at least ${MIN_AGE_MONTHS} months old to be listed.`)
    .refine((d) => monthsBetween(d, new Date()) <= 20 * 12, "Check the year. That's over 20 years old."),
  weightKg: z
    .union([z.literal(""), z.coerce.number().positive("Weight must be more than 0.").max(120, "Check the weight.")])
    .transform((v) => (v === "" ? null : v)),
  city: z.string().trim().min(2, "Enter your city.").max(60),
  bio: z.string().trim().max(300, "Keep the bio under 300 characters.").optional().transform((v) => v || null),
  openToMixed: checkbox,
});

export const promptsSchema = z
  .object({
    prompts: z
      .array(
        z.object({
          prompt: z.enum(PROMPTS, { error: "Choose a prompt." }),
          answer: z.string().trim().min(3, "Write a short answer.").max(ANSWER_MAX, `Keep answers under ${ANSWER_MAX} characters.`),
        }),
      )
      .length(PROMPT_COUNT, `Answer ${PROMPT_COUNT} prompts.`),
  })
  .refine((v) => new Set(v.prompts.map((p) => p.prompt)).size === v.prompts.length, {
    message: "Pick three different prompts.",
    path: ["prompts"],
  });

export const healthSchema = z.object({
  vaccinated: checkbox,
});

export const docTypeSchema = z.enum(["VACCINATION", "HIP_ELBOW", "GENETIC", "PEDIGREE"], {
  error: "Choose what kind of document this is.",
});

/** Field errors keyed by field name, for showing next to inputs. */
export type FieldErrors = Record<string, string>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    out[key] ??= issue.message;
  }
  return out;
}

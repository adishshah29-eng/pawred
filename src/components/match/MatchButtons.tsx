"use client";

import { useActionState, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flag, Heart, LoaderCircle, X } from "lucide-react";
import { passDog, reportDog, sendLike, type ReportState } from "@/actions/matching";
import { REPORT_REASONS } from "@/lib/reports";
import { SubmitButton, inputClass, textareaClass } from "@/components/ui/form";

/** "Skip" for Discover: a round icon button, or (compact) an icon with a word, for feed cards. */
export function PassButton({ toDogId, dogName, compact }: { toDogId: string; dogName: string; compact?: boolean }) {
  return (
    <form action={passDog}>
      <input type="hidden" name="toDogId" value={toDogId} />
      {compact ? (
        <SubmitButton variant="secondary" pendingLabel="Skipping…" className="h-11 gap-1.5 px-4">
          <X size={17} aria-hidden="true" /> Skip<span className="sr-only"> {dogName}</span>
        </SubmitButton>
      ) : (
        <PassSubmit dogName={dogName} />
      )}
    </form>
  );
}

function PassSubmit({ dogName }: { dogName: string }) {
  return (
    <SubmitButton
      variant="secondary"
      pendingLabel=""
      className="size-16 rounded-full! px-0! shadow-[0_12px_30px_-12px_rgba(30,26,22,0.5)]"
    >
      <X size={28} aria-hidden="true" />
      <span className="sr-only">Skip {dogName}</span>
    </SubmitButton>
  );
}

/** "Like back" on the Likes page: liking any photo of theirs makes the match. */
export function LikeBackButton({ toDogId, photoId }: { toDogId: string; photoId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await sendLike({ toDogId, targetType: "PHOTO", targetId: photoId });
            if (res.error) setError(res.error);
            else if (res.matchId) router.push(`/matches/${res.matchId}?new=1`);
          })
        }
        className="inline-flex h-11 items-center gap-2 rounded-full bg-marigold px-5 font-semibold text-ink transition-colors hover:bg-marigold-deep disabled:opacity-70"
      >
        {pending ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <Heart size={17} fill="currentColor" aria-hidden="true" />}
        Like back
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function RemoveLikeButton({ toDogId }: { toDogId: string }) {
  return (
    <form action={passDog}>
      <input type="hidden" name="toDogId" value={toDogId} />
      <SubmitButton variant="secondary" pendingLabel="Removing…" className="h-11 px-5">
        Not for us
      </SubmitButton>
    </form>
  );
}

/** Report link + small inline form. */
export function ReportDog({ dogId, dogName }: { dogId: string; dogName: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<ReportState, FormData>(reportDog, {});
  const id = useId();

  if (state.done) {
    return <p className="text-sm text-ink-soft">Thanks. A Pawred admin will review {dogName}&apos;s profile.</p>;
  }
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-11 items-center gap-2 text-sm text-ink-soft hover:text-danger">
        <Flag size={15} aria-hidden="true" /> Report {dogName}
      </button>
    );
  }
  return (
    <form action={action} className="grid gap-3 rounded-[20px] border border-line bg-card p-4">
      <input type="hidden" name="dogId" value={dogId} />
      <label htmlFor={`${id}-reason`} className="text-[15px] font-medium">
        Why are you reporting {dogName}?
      </label>
      <select id={`${id}-reason`} name="reason" required defaultValue="" className={inputClass}>
        <option value="" disabled>
          Choose a reason
        </option>
        {REPORT_REASONS.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
      <label htmlFor={`${id}-details`} className="sr-only">
        Details
      </label>
      <textarea id={`${id}-details`} name="details" rows={2} maxLength={500} placeholder="Anything the admin should know (optional)" className={textareaClass} />
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <div className="flex gap-2">
        <SubmitButton variant="secondary" pendingLabel="Sending…" className="h-11 px-5">
          Send report
        </SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-full px-4 text-ink-soft hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}

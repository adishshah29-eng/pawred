"use client";

import { useId, useState } from "react";
import { deleteDog, setDogActive } from "@/actions/dogs";
import { SubmitButton, inputClass } from "@/components/ui/form";

export function VisibilityForm({ dogId, dogName, isActive }: { dogId: string; dogName: string; isActive: boolean }) {
  return (
    <form action={setDogActive} className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-line bg-card p-5">
      <input type="hidden" name="dogId" value={dogId} />
      <input type="hidden" name="isActive" value={String(!isActive)} />
      <div>
        <p className="font-semibold">{isActive ? `${dogName} is visible` : `${dogName} is paused`}</p>
        <p className="text-sm text-ink-soft">
          {isActive ? "Pause to hide the profile from Discover. Matches and chats stay." : "Other owners can't find this profile until you turn it back on."}
        </p>
      </div>
      <SubmitButton variant="secondary" pendingLabel="Updating…">
        {isActive ? "Pause profile" : "Show profile again"}
      </SubmitButton>
    </form>
  );
}

export function DeleteDogForm({ dogId, dogName }: { dogId: string; dogName: string }) {
  const [typed, setTyped] = useState("");
  const id = useId();
  const matches = typed.trim() === dogName;

  return (
    <form action={deleteDog} className="grid gap-4 rounded-[24px] border border-danger/40 p-5">
      <input type="hidden" name="dogId" value={dogId} />
      <div>
        <p className="font-semibold text-danger">Delete {dogName}&apos;s profile</p>
        <p className="text-sm text-ink-soft">This removes photos, prompts, documents, likes, matches and chats for good.</p>
      </div>
      <div>
        <label htmlFor={id} className="mb-1.5 block text-[15px] font-medium">
          Type <span className="font-semibold">{dogName}</span> to confirm
        </label>
        <input id={id} name="confirm" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" className={inputClass} />
      </div>
      <div>
        <button
          type="submit"
          disabled={!matches}
          className="inline-flex h-12 items-center rounded-full bg-danger px-6 font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Delete profile
        </button>
      </div>
    </form>
  );
}

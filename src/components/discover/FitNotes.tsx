import { CircleAlert, CircleCheck } from "lucide-react";

// "Why Cooper fits Luna": a few plain reasons, shown on Discover and on a dog's profile.
export function FitNotes({ notes, meName, dogName }: { notes: { ok: boolean; text: string }[]; meName: string; dogName: string }) {
  return (
    <div className="mt-4 rounded-2xl bg-paper-deep px-4 py-3">
      <p className="text-sm font-semibold">
        Why {dogName} fits {meName}
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
        {notes.map((n) => (
          <li key={n.text} className={`flex items-center gap-1.5 ${n.ok ? "text-ink" : "text-ink-soft"}`}>
            {n.ok ? (
              <CircleCheck size={15} className="shrink-0 text-verified" aria-hidden="true" />
            ) : (
              <CircleAlert size={15} className="shrink-0 text-ink-soft" aria-hidden="true" />
            )}
            {n.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

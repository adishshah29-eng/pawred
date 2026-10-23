"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Star, Trash2 } from "lucide-react";
import { addPhotos, deletePhoto, makeMainPhoto, type ActionState } from "@/actions/dogs";
import { FormAlert, useFormAction } from "@/components/ui/form";

type Photo = { id: string; url: string; alt: string | null };

const MAX_PHOTOS = 6;
const MAX_EDGE = 1600; // px, longest side after resizing
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

/** Shrink a photo in the browser so uploads stay small and fast. */
async function shrink(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process image"))), "image/webp", 0.85),
  );
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
}

export function PhotoManager({ dogId, dogName, photos }: { dogId: string; dogName: string; photos: Photo[] }) {
  const { state, submit, pending } = useFormAction<ActionState>(addPhotos, {});
  const [preparing, setPreparing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const slotsLeft = MAX_PHOTOS - photos.length;
  const busy = preparing || pending;

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    setLocalError(null);
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow picking the same file again later
    if (picked.length === 0) return;

    const bad = picked.find((f) => !ACCEPT.includes(f.type));
    if (bad) return setLocalError(`${bad.name} isn't a JPG, PNG or WebP image.`);
    if (picked.length > slotsLeft) return setLocalError(`You can add ${slotsLeft} more photo${slotsLeft === 1 ? "" : "s"}.`);

    setPreparing(true);
    try {
      const files = await Promise.all(picked.map(shrink));
      const data = new FormData();
      data.set("dogId", dogId);
      files.forEach((f) => data.append("photos", f));
      submit(data);
    } catch {
      setLocalError("One of those photos couldn't be read. Try a different one.");
    } finally {
      setPreparing(false);
    }
  }

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label={`${dogName}'s photos`}>
        {photos.map((p, i) => (
          <li key={p.id} className="group relative aspect-[4/5] overflow-hidden rounded-[20px] bg-paper-deep">
            <Image src={p.url} alt={p.alt ?? `${dogName}, photo ${i + 1}`} fill sizes="(min-width: 640px) 240px, 45vw" className="object-cover" />
            {i === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold">Main photo</span>
            )}
            <div className="absolute inset-x-2 bottom-2 flex justify-end gap-2">
              {i !== 0 && (
                <form action={makeMainPhoto}>
                  <input type="hidden" name="photoId" value={p.id} />
                  <button
                    type="submit"
                    className="grid size-11 place-items-center rounded-full bg-card/95 text-ink shadow-sm hover:bg-card"
                    aria-label={`Make photo ${i + 1} the main photo`}
                    title="Make main photo"
                  >
                    <Star size={18} aria-hidden="true" />
                  </button>
                </form>
              )}
              <form action={deletePhoto}>
                <input type="hidden" name="photoId" value={p.id} />
                <button
                  type="submit"
                  className="grid size-11 place-items-center rounded-full bg-card/95 text-danger shadow-sm hover:bg-card"
                  aria-label={`Remove photo ${i + 1}`}
                  title="Remove photo"
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </form>
            </div>
          </li>
        ))}

        {slotsLeft > 0 && (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-line bg-card text-ink-soft transition-colors hover:border-ink-soft hover:text-ink disabled:cursor-wait"
            >
              {busy ? <LoaderCircle size={28} className="animate-spin" aria-hidden="true" /> : <ImagePlus size={28} aria-hidden="true" />}
              <span className="px-3 text-center text-sm font-medium">
                {preparing ? "Preparing…" : pending ? "Uploading…" : photos.length === 0 ? "Add photos" : "Add more"}
              </span>
            </button>
          </li>
        )}
      </ul>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-label="Choose photos to upload"
        onChange={onPick}
      />

      <p className="mt-3 text-sm text-ink-soft">
        {photos.length} of {MAX_PHOTOS} photos. JPG, PNG or WebP. Clear, well-lit photos of your dog alone work best.
      </p>

      <div className="mt-4" aria-live="polite">
        <FormAlert error={localError ?? state.error} message={localError ? undefined : state.message} />
      </div>
    </div>
  );
}

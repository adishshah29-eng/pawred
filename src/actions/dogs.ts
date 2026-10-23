"use server";

// Server Actions for creating and editing dog profiles (syllabus Units 3 & 4).
// Every action: check the session → check ownership → validate with Zod → write with Prisma.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { DOGS_TAG } from "@/lib/public-stats";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ACTIVE_DOG_COOKIE, getOwnedDog } from "@/lib/dogs";
import {
  DOC_BUCKET,
  DOC_MAX_BYTES,
  DOC_TYPES,
  PHOTO_BUCKET,
  PHOTO_MAX_BYTES,
  PHOTO_TYPES,
  StorageNotConfigured,
  photoPathFromUrl,
  publicPhotoUrl,
  removeFiles,
  uploadFile,
} from "@/lib/storage";
import { basicsSchema, docTypeSchema, healthSchema, promptsSchema, toFieldErrors, type FieldErrors } from "@/lib/validators";

export type ActionState = { error?: string; fieldErrors?: FieldErrors; message?: string };

const MAX_PHOTOS = 6;

/** Only follow redirects inside this site. */
function safeNext(value: FormDataEntryValue | null, fallback: string) {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : fallback;
}

async function ownedDogOrThrow(dogId: string, userId: string) {
  const dog = await getOwnedDog(dogId, userId);
  if (!dog) throw new Error("Dog not found.");
  return dog;
}

function refreshDog(dogId: string) {
  updateTag(DOGS_TAG); // public breed-page numbers
  revalidatePath(`/dogs/${dogId}`);
  revalidatePath(`/dogs/${dogId}/edit`);
  revalidatePath("/onboarding");
  revalidatePath("/settings");
}

async function setActiveDogCookie(dogId: string) {
  (await cookies()).set(ACTIVE_DOG_COOKIE, dogId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

// ---------- Basics (create or update) ----------

export async function saveBasics(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = basicsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  const dogId = String(formData.get("dogId") ?? "");
  let id = dogId;

  if (dogId) {
    await ownedDogOrThrow(dogId, user.id);
    await prisma.dog.update({ where: { id: dogId }, data: parsed.data });
    await prisma.activityLog.create({ data: { userId: user.id, action: "DOG_UPDATED", meta: { dogId, section: "basics" } } });
  } else {
    const dog = await prisma.dog.create({ data: { ...parsed.data, ownerId: user.id } });
    id = dog.id;
    await setActiveDogCookie(dog.id);
    await prisma.activityLog.create({ data: { userId: user.id, action: "DOG_CREATED", meta: { dogId: dog.id } } });
  }

  refreshDog(id);
  redirect(safeNext(formData.get("next"), `/onboarding?dog=${id}&step=2`).replace("{id}", id));
}

// ---------- Photos ----------

export async function addPhotos(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const dogId = String(formData.get("dogId") ?? "");
  const dog = await ownedDogOrThrow(dogId, user.id);

  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Choose at least one photo." };
  if (dog.photos.length + files.length > MAX_PHOTOS) {
    return { error: `A profile can have up to ${MAX_PHOTOS} photos. You can add ${MAX_PHOTOS - dog.photos.length} more.` };
  }
  for (const f of files) {
    if (!(PHOTO_TYPES as readonly string[]).includes(f.type)) return { error: `${f.name} isn't a JPG, PNG or WebP image.` };
    if (f.size > PHOTO_MAX_BYTES) return { error: `${f.name} is over 5 MB. Choose a smaller photo.` };
  }

  try {
    let order = dog.photos.length;
    for (const f of files) {
      const path = await uploadFile(PHOTO_BUCKET, `${user.id}/${dogId}`, f);
      await prisma.dogPhoto.create({
        data: { dogId, url: publicPhotoUrl(path), order: order++, alt: `${dog.name}, photo ${order}` },
      });
    }
  } catch (err) {
    if (err instanceof StorageNotConfigured) return { error: err.message };
    return { error: "The upload didn't go through. Check your connection and try again." };
  }

  refreshDog(dogId);
  return { message: files.length === 1 ? "Photo added." : `${files.length} photos added.` };
}

export async function deletePhoto(formData: FormData) {
  const user = await requireUser();
  const photoId = String(formData.get("photoId") ?? "");
  const photo = await prisma.dogPhoto.findFirst({ where: { id: photoId, dog: { ownerId: user.id } } });
  if (!photo) return;

  await prisma.$transaction(async (tx) => {
    await tx.dogPhoto.delete({ where: { id: photo.id } });
    // Close the gap so the order stays 0, 1, 2…
    const rest = await tx.dogPhoto.findMany({ where: { dogId: photo.dogId }, orderBy: { order: "asc" } });
    await Promise.all(rest.map((p, i) => tx.dogPhoto.update({ where: { id: p.id }, data: { order: i } })));
  });

  const path = photoPathFromUrl(photo.url);
  if (path) await removeFiles(PHOTO_BUCKET, [path]).catch(() => {});
  refreshDog(photo.dogId);
}

export async function makeMainPhoto(formData: FormData) {
  const user = await requireUser();
  const photoId = String(formData.get("photoId") ?? "");
  const photo = await prisma.dogPhoto.findFirst({ where: { id: photoId, dog: { ownerId: user.id } } });
  if (!photo) return;

  const all = await prisma.dogPhoto.findMany({ where: { dogId: photo.dogId }, orderBy: { order: "asc" } });
  const reordered = [photo, ...all.filter((p) => p.id !== photo.id)];
  await prisma.$transaction(reordered.map((p, i) => prisma.dogPhoto.update({ where: { id: p.id }, data: { order: i } })));
  refreshDog(photo.dogId);
}

// ---------- Prompts ----------

export async function savePrompts(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const dogId = String(formData.get("dogId") ?? "");
  await ownedDogOrThrow(dogId, user.id);

  const prompts = [0, 1, 2].map((i) => ({
    prompt: String(formData.get(`prompt${i}`) ?? ""),
    answer: String(formData.get(`answer${i}`) ?? ""),
  }));
  const parsed = promptsSchema.safeParse({ prompts });
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  await prisma.$transaction([
    prisma.promptAnswer.deleteMany({ where: { dogId } }),
    prisma.promptAnswer.createMany({
      data: parsed.data.prompts.map((p, order) => ({ dogId, prompt: p.prompt, answer: p.answer, order })),
    }),
  ]);
  await prisma.activityLog.create({ data: { userId: user.id, action: "DOG_UPDATED", meta: { dogId, section: "prompts" } } });

  refreshDog(dogId);
  redirect(safeNext(formData.get("next"), `/onboarding?dog=${dogId}&step=4`));
}

// ---------- Health ----------

export async function saveHealth(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const dogId = String(formData.get("dogId") ?? "");
  await ownedDogOrThrow(dogId, user.id);

  const parsed = healthSchema.safeParse({ vaccinated: formData.get("vaccinated") ?? undefined });
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error) };

  await prisma.dog.update({ where: { id: dogId }, data: { vaccinated: parsed.data.vaccinated } });
  refreshDog(dogId);
  redirect(safeNext(formData.get("next"), `/dogs/${dogId}?welcome=1`));
}

export async function uploadHealthDoc(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const dogId = String(formData.get("dogId") ?? "");
  const dog = await ownedDogOrThrow(dogId, user.id);

  const type = docTypeSchema.safeParse(formData.get("type"));
  if (!type.success) return { fieldErrors: { type: type.error.issues[0].message } };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { fieldErrors: { file: "Choose a file to upload." } };
  if (!(DOC_TYPES as readonly string[]).includes(file.type)) return { fieldErrors: { file: "Upload a PDF, JPG, PNG or WebP file." } };
  if (file.size > DOC_MAX_BYTES) return { fieldErrors: { file: "That file is over 4 MB. Try a smaller scan or a PDF." } };

  try {
    const path = await uploadFile(DOC_BUCKET, `${user.id}/${dogId}`, file);
    await prisma.healthDoc.create({ data: { dogId, type: type.data, fileUrl: path, status: "PENDING" } });
  } catch (err) {
    if (err instanceof StorageNotConfigured) return { error: err.message };
    return { error: "The upload didn't go through. Try again." };
  }

  // A new document puts the dog in the admin's verification queue.
  if (dog.verificationStatus !== "VERIFIED") {
    await prisma.dog.update({ where: { id: dogId }, data: { verificationStatus: "PENDING" } });
  }
  await prisma.activityLog.create({ data: { userId: user.id, action: "DOC_UPLOADED", meta: { dogId, type: type.data } } });

  refreshDog(dogId);
  return { message: "Document uploaded. An admin will review it." };
}

export async function deleteHealthDoc(formData: FormData) {
  const user = await requireUser();
  const docId = String(formData.get("docId") ?? "");
  const doc = await prisma.healthDoc.findFirst({ where: { id: docId, dog: { ownerId: user.id } } });
  if (!doc) return;
  await prisma.healthDoc.delete({ where: { id: doc.id } });
  await removeFiles(DOC_BUCKET, [doc.fileUrl]).catch(() => {});
  refreshDog(doc.dogId);
}

// ---------- Profile status ----------

export async function setDogActive(formData: FormData) {
  const user = await requireUser();
  const dogId = String(formData.get("dogId") ?? "");
  await ownedDogOrThrow(dogId, user.id);
  await prisma.dog.update({ where: { id: dogId }, data: { isActive: formData.get("isActive") === "true" } });
  refreshDog(dogId);
}

export async function chooseActiveDog(formData: FormData) {
  const user = await requireUser();
  const dogId = String(formData.get("dogId") ?? "");
  await ownedDogOrThrow(dogId, user.id);
  await setActiveDogCookie(dogId);
  revalidatePath("/settings");
}

export async function deleteDog(formData: FormData) {
  const user = await requireUser();
  const dogId = String(formData.get("dogId") ?? "");
  const dog = await ownedDogOrThrow(dogId, user.id);
  if (formData.get("confirm") !== dog.name) return; // must type the dog's name

  const photoPaths = dog.photos.map((p) => photoPathFromUrl(p.url)).filter((p): p is string => Boolean(p));
  const docPaths = dog.healthDocs.map((d) => d.fileUrl);
  await prisma.dog.delete({ where: { id: dogId } }); // cascades to photos, prompts, likes, matches…
  await Promise.all([removeFiles(PHOTO_BUCKET, photoPaths), removeFiles(DOC_BUCKET, docPaths)]).catch(() => {});

  const jar = await cookies();
  if (jar.get(ACTIVE_DOG_COOKIE)?.value === dogId) jar.delete(ACTIVE_DOG_COOKIE);
  revalidatePath("/settings");
  redirect("/settings");
}

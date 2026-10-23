import "server-only";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// Server-only Supabase Storage client. Uses the secret key, so it must never
// be imported into a Client Component ("server-only" enforces that).

export const PHOTO_BUCKET = "dog-photos";
export const DOC_BUCKET = "health-docs";

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const DOC_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const DOC_MAX_BYTES = 4 * 1024 * 1024; // Vercel caps request bodies at ~4.5 MB

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new StorageNotConfigured();
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export class StorageNotConfigured extends Error {
  constructor() {
    super("Uploads aren't set up yet: add SUPABASE_SERVICE_ROLE_KEY to .env and restart the dev server.");
  }
}

export function storageConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Upload a file and return its storage path, e.g. "user123/dog456/uuid.jpg". */
export async function uploadFile(bucket: string, folder: string, file: File) {
  const path = `${folder}/${randomUUID()}.${EXT[file.type] ?? "bin"}`;
  const { error } = await client()
    .storage.from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return path;
}

export function publicPhotoUrl(path: string) {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}

/** Turn a public photo URL back into its storage path (null for seed/external photos). */
export function photoPathFromUrl(url: string) {
  const prefix = `${process.env.SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

export async function removeFiles(bucket: string, paths: string[]) {
  if (paths.length === 0 || !storageConfigured()) return;
  await client().storage.from(bucket).remove(paths);
}

/** Short-lived link to a private health document (for its owner or an admin). */
export async function signedDocUrl(path: string, expiresInSeconds = 300) {
  const { data, error } = await client().storage.from(DOC_BUCKET).createSignedUrl(path, expiresInSeconds);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

// GET /api/breeds → [{ slug, name }, …]
// Public Route Handler (syllabus Unit 3) backed by the cached breed list.
import { getBreeds } from "@/lib/breeds";

export async function GET() {
  const breeds = await getBreeds();
  return Response.json(breeds, {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}

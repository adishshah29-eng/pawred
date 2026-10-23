// GET /api/admin/docs/:docId → redirect to a 5-minute signed link for a private health document.
// Admins only. The file itself never becomes public.
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StorageNotConfigured, signedDocUrl, storageConfigured } from "@/lib/storage";

export async function GET(request: Request, ctx: RouteContext<"/api/admin/docs/[docId]">) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return new Response("Not allowed.", { status: 403 });
  }
  const { docId } = await ctx.params;
  const doc = await prisma.healthDoc.findUnique({ where: { id: docId } });
  if (!doc) return new Response("Document not found.", { status: 404 });

  // Mock-data documents live in /public/sample-docs (or are external links), not in storage.
  if (doc.fileUrl.startsWith("/")) return Response.redirect(new URL(doc.fileUrl, request.url), 302);
  if (doc.fileUrl.startsWith("http")) return Response.redirect(doc.fileUrl, 302);

  if (!storageConfigured()) return new Response(new StorageNotConfigured().message, { status: 503 });
  return Response.redirect(await signedDocUrl(doc.fileUrl), 302);
}

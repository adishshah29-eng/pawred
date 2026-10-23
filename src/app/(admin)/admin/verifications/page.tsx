import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DOC_LABELS } from "@/lib/health";
import { reviewDoc } from "@/actions/admin";
import { SubmitButton } from "@/components/ui/form";

export const metadata: Metadata = { title: "Verifications" };

export const instant = false;

export default async function VerificationsPage() {
  const docs = await prisma.healthDoc.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" }, // oldest first: fair queue
    include: {
      dog: { include: { owner: { select: { name: true, email: true } }, photos: { orderBy: { order: "asc" }, take: 1 } } },
    },
  });

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
      <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight">Verifications</h1>
      <p className="mt-2 text-ink-soft">
        Open each document, check it matches the dog, then approve or reject. One approved document gives the dog its Verified badge.
      </p>

      {docs.length === 0 ? (
        <p className="mt-10 rounded-[20px] border border-dashed border-line px-6 py-12 text-center text-ink-soft">All caught up. No documents waiting.</p>
      ) : (
        <ul className="mt-8 grid gap-3">
          {docs.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-4 rounded-[20px] border border-line bg-card p-4">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-[14px] bg-paper-deep">
                {d.dog.photos[0] && <Image src={d.dog.photos[0].url} alt="" fill sizes="56px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {DOC_LABELS[d.type] ?? d.type} ·{" "}
                  <Link href={`/dogs/${d.dog.id}`} className="underline underline-offset-4">
                    {d.dog.name}
                  </Link>
                </p>
                <p className="text-sm text-ink-soft">
                  {d.dog.owner.name} ({d.dog.owner.email}) · uploaded {d.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
              <a
                href={`/api/admin/docs/${d.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold hover:bg-paper-deep"
              >
                Open file <ExternalLink size={15} aria-hidden="true" />
              </a>
              <div className="flex gap-2">
                <form action={reviewDoc}>
                  <input type="hidden" name="docId" value={d.id} />
                  <input type="hidden" name="decision" value="reject" />
                  <SubmitButton variant="secondary" pendingLabel="…" className="h-11 px-4 text-sm text-danger">
                    Reject
                  </SubmitButton>
                </form>
                <form action={reviewDoc}>
                  <input type="hidden" name="docId" value={d.id} />
                  <input type="hidden" name="decision" value="approve" />
                  <SubmitButton pendingLabel="…" className="h-11 bg-verified! px-4 text-sm hover:opacity-90">
                    Approve
                  </SubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

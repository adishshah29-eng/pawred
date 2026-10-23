import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { handleReport } from "@/actions/admin";
import { SubmitButton } from "@/components/ui/form";

export const metadata: Metadata = { title: "Reports" };

export const instant = false;

export default async function ReportsPage() {
  const reports = await prisma.report.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "asc" },
    include: {
      reporter: { select: { name: true } },
      dog: {
        include: {
          owner: { select: { name: true, email: true } },
          photos: { orderBy: { order: "asc" }, take: 1 },
          _count: { select: { reports: true } },
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
      <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight">Reports</h1>
      <p className="mt-2 text-ink-soft">Look at the profile, then dismiss the report, mark it handled, or pause the dog so it leaves Discover.</p>

      {reports.length === 0 ? (
        <p className="mt-10 rounded-[20px] border border-dashed border-line px-6 py-12 text-center text-ink-soft">No open reports.</p>
      ) : (
        <ul className="mt-8 grid gap-3">
          {reports.map((r) => (
            <li key={r.id} className="grid gap-4 rounded-[20px] border border-line bg-card p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <div className="relative size-14 overflow-hidden rounded-[14px] bg-paper-deep">
                {r.dog.photos[0] && <Image src={r.dog.photos[0].url} alt="" fill sizes="56px" className="object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="font-semibold">
                  <Link href={`/dogs/${r.dog.id}`} className="underline underline-offset-4">
                    {r.dog.name}
                  </Link>{" "}
                  <span className="font-normal text-ink-soft">
                    · owner {r.dog.owner.name} · {r.dog._count.reports} report{r.dog._count.reports === 1 ? "" : "s"} in total
                    {!r.dog.isActive && " · already paused"}
                  </span>
                </p>
                <p className="mt-1">&ldquo;{r.reason}&rdquo;</p>
                <p className="text-sm text-ink-soft">
                  Reported by {r.reporter.name} on {r.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ["dismiss", "Dismiss", "secondary"],
                  ["resolve", "Handled", "secondary"],
                  ["pause", "Pause dog", "primary"],
                ].map(([outcome, label, variant]) => (
                  <form key={outcome} action={handleReport}>
                    <input type="hidden" name="reportId" value={r.id} />
                    <input type="hidden" name="outcome" value={outcome} />
                    <SubmitButton variant={variant as "primary" | "secondary"} pendingLabel="…" className="h-11 px-4 text-sm">
                      {label}
                    </SubmitButton>
                  </form>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

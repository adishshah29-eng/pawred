import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Admin overview" };

// Live numbers, read per request.
export const instant = false;

const ACTION_LABELS: Record<string, string> = {
  SIGN_UP: "signed up",
  SIGN_IN: "signed in",
  DOG_CREATED: "created a dog profile",
  DOG_UPDATED: "updated a dog profile",
  LIKE_SENT: "sent a like",
  PASS: "skipped a dog",
  MATCH_CREATED: "got a match",
  UNMATCH: "unmatched",
  REPORT_FILED: "reported a profile",
  REPORT_HANDLED: "handled a report",
  DOC_UPLOADED: "uploaded a health document",
  DOC_REVIEWED: "reviewed a document",
  USER_BANNED: "banned a user",
  USER_UNBANNED: "unbanned a user",
  ROLE_CHANGED: "changed a user's role",
};

export default async function AdminOverview() {
  const [users, dogs, activeDogs, matches, messages, pendingDocs, openReports, activity] = await Promise.all([
    prisma.user.count(),
    prisma.dog.count(),
    prisma.dog.count({ where: { isActive: true } }),
    prisma.match.count({ where: { unmatchedAt: null } }),
    prisma.message.count(),
    prisma.healthDoc.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 25, include: { user: { select: { name: true } } } }),
  ]);

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
      <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight">Overview</h1>

      {/* Work queues first: these need someone. */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <QueueCard href="/admin/verifications" count={pendingDocs} label="documents waiting for review" />
        <QueueCard href="/admin/reports" count={openReports} label="open reports" />
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-line bg-line sm:grid-cols-5">
        {[
          ["Owners", users],
          ["Dogs", dogs],
          ["Visible dogs", activeDogs],
          ["Active matches", matches],
          ["Messages", messages],
        ].map(([label, value]) => (
          <div key={label} className="bg-card px-5 py-4">
            <dt className="text-sm text-ink-soft">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="activity" className="mt-12">
        <h2 id="activity" className="text-lg font-semibold">
          Recent activity
        </h2>
        <ol className="mt-4 divide-y divide-line rounded-[20px] border border-line bg-card">
          {activity.length === 0 && <li className="px-5 py-4 text-ink-soft">Nothing yet.</li>}
          {activity.map((a) => (
            <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3">
              <span>
                <span className="font-medium">{a.user.name}</span> {ACTION_LABELS[a.action] ?? a.action.toLowerCase()}
              </span>
              <time dateTime={a.createdAt.toISOString()} className="text-sm tabular-nums text-ink-soft">
                {a.createdAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
              </time>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function QueueCard({ href, count, label }: { href: string; count: number; label: string }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-[20px] border px-5 py-5 transition-colors ${
        count > 0 ? "border-marigold-deep/50 bg-marigold/15 hover:bg-marigold/25" : "border-line bg-card hover:bg-paper-deep"
      }`}
    >
      <span className="text-3xl font-semibold tabular-nums">{count}</span>
      <span className="text-ink-soft">{label}</span>
    </Link>
  );
}

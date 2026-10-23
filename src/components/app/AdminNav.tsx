import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { NavLink } from "@/components/app/NavLink";

// Admin top bar. The two queue links show how many items are waiting.
// Reads the database, so render it inside <Suspense>.
export async function AdminNav() {
  await requireAdmin(); // never run these queries for anyone but an admin
  const [docs, reports] = await Promise.all([
    prisma.healthDoc.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
  ]);

  const count = (n: number, what: string) =>
    n > 0 ? (
      <span className="grid min-w-5 place-items-center rounded-full bg-marigold px-1.5 text-[11px] font-bold leading-5 text-ink tabular-nums">
        {n}
        <span className="sr-only"> {what}</span>
      </span>
    ) : undefined;

  return (
    <nav aria-label="Admin" className="-mx-1 flex gap-1 overflow-x-auto px-1">
      <NavLink href="/admin" label="Overview" variant="pill" exact />
      <NavLink href="/admin/verifications" label="Verifications" variant="pill" badge={count(docs, "documents waiting")} />
      <NavLink href="/admin/reports" label="Reports" variant="pill" badge={count(reports, "open reports")} />
      <NavLink href="/admin/users" label="Users" variant="pill" />
    </nav>
  );
}

export function AdminNavFallback() {
  return (
    <nav aria-label="Admin" className="-mx-1 flex gap-1 px-1">
      {["Overview", "Verifications", "Reports", "Users"].map((l) => (
        <span key={l} className="inline-flex h-10 items-center rounded-full px-4 text-[15px] text-ink-soft">
          {l}
        </span>
      ))}
    </nav>
  );
}

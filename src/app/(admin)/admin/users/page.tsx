import type { Metadata } from "next";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { setBan, setUserRole } from "@/actions/admin";
import { SubmitButton, inputClass } from "@/components/ui/form";

export const metadata: Metadata = { title: "Users" };

export const instant = false;

export default async function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  const me = await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const users = await prisma.user.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { dogs: true, reportsFiled: true } } },
  });

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
      <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight">Users</h1>

      <form role="search" className="mt-6 flex max-w-[480px] gap-2">
        <label htmlFor="q" className="sr-only">
          Search by name or email
        </label>
        <input id="q" name="q" defaultValue={q} placeholder="Search by name or email" className={inputClass} />
        <button type="submit" className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-paper hover:bg-felt" aria-label="Search">
          <Search size={18} aria-hidden="true" />
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-[20px] border border-line bg-card">
        <table className="w-full min-w-[760px] text-left text-[15px]">
          <thead className="border-b border-line text-sm text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Dogs</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => {
              const isMe = u.id === me.id;
              const seed = u.id.startsWith("seed-");
              return (
                <tr key={u.id} className="align-middle">
                  <td className="px-4 py-3">
                    <p className="font-semibold">
                      {u.name} {isMe && <span className="font-normal text-ink-soft">(you)</span>}
                    </p>
                    <p className="text-sm text-ink-soft">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{u._count.dogs}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-soft">{u.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {u.role === "admin" && <span className="rounded-full bg-felt px-2.5 py-0.5 text-xs font-semibold text-on-felt">Admin</span>}
                      {u.banned && <span className="rounded-full bg-danger/15 px-2.5 py-0.5 text-xs font-semibold text-danger">Banned</span>}
                      {seed && <span className="rounded-full bg-paper-deep px-2.5 py-0.5 text-xs font-semibold text-ink-soft">Sample</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {!isMe && (
                      <div className="flex justify-end gap-2">
                        <form action={setUserRole}>
                          <input type="hidden" name="userId" value={u.id} />
                          <input type="hidden" name="role" value={u.role === "admin" ? "user" : "admin"} />
                          <SubmitButton variant="secondary" pendingLabel="…" className="h-10 px-4 text-sm">
                            {u.role === "admin" ? "Remove admin" : "Make admin"}
                          </SubmitButton>
                        </form>
                        <form action={setBan}>
                          <input type="hidden" name="userId" value={u.id} />
                          <input type="hidden" name="ban" value={String(!u.banned)} />
                          <SubmitButton variant="secondary" pendingLabel="…" className={`h-10 px-4 text-sm ${u.banned ? "" : "text-danger"}`}>
                            {u.banned ? "Unban" : "Ban"}
                          </SubmitButton>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <p className="px-4 py-8 text-center text-ink-soft">No users match “{q}”.</p>}
      </div>
    </div>
  );
}

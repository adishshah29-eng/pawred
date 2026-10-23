import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Dog, Plus } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getActiveDog, listMyDogs } from "@/lib/dogs";
import { breedName } from "@/lib/breeds";
import { chooseActiveDog } from "@/actions/dogs";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { SubmitButton } from "@/components/ui/form";

export const metadata: Metadata = { title: "Settings" };

// Depends on the signed-in user, so it renders per request.
export const instant = false;

export default async function SettingsPage() {
  const user = await requireUser("/settings");
  const [dogs, active] = await Promise.all([listMyDogs(user.id), getActiveDog(user.id)]);
  const names = await Promise.all(dogs.map((d) => breedName(d.breed)));

  return (
    <div className="mx-auto w-full max-w-[640px] px-5 py-8 sm:px-8 md:py-12">
      <h1 className="font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05]">Settings</h1>

      <section aria-labelledby="dogs-title" className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="dogs-title" className="font-display text-[28px] leading-tight">
              Your dogs
            </h2>
            {dogs.length > 1 && <p className="mt-1 text-ink-soft">Discover and likes use the dog marked “Browsing as”.</p>}
          </div>
          <Link
            href="/onboarding"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-card px-5 text-[15px] font-semibold hover:bg-paper-deep"
          >
            <Plus size={17} aria-hidden="true" /> Add {dogs.length === 0 ? "your dog" : "another dog"}
          </Link>
        </div>

        {dogs.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-line px-6 py-10 text-center">
            <Dog size={32} className="mx-auto text-ink-soft" aria-hidden="true" />
            <p className="mt-3 font-semibold">No dog profile yet</p>
            <p className="mt-1 text-ink-soft">Create one to start seeing matches.</p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-3">
            {dogs.map((d, i) => {
              const isActive = active?.id === d.id;
              const incomplete = d._count.photos === 0 || d._count.prompts < 3;
              return (
                <li key={d.id} className="flex flex-wrap items-center gap-4 rounded-[24px] border border-line bg-card p-3 pr-5">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-[16px] bg-paper-deep">
                    {d.photos[0] ? (
                      <Image src={d.photos[0].url} alt="" fill sizes="64px" className="object-cover" />
                    ) : (
                      <Dog size={24} className="absolute inset-0 m-auto text-ink-soft" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      <Link href={`/dogs/${d.id}`} className="hover:underline">
                        {d.name}
                      </Link>
                    </p>
                    <p className="text-sm text-ink-soft">
                      {names[i]} · {d.sex === "MALE" ? "Male" : "Female"} · {d.city}
                    </p>
                    <ul className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Status">
                      {d.verificationStatus === "VERIFIED" && <Status tone="good">Verified</Status>}
                      {d.verificationStatus === "PENDING" && <Status>Documents in review</Status>}
                      {d.verificationStatus === "REJECTED" && <Status tone="bad">Document not accepted</Status>}
                      {d.verificationStatus === "NONE" && <Status>No documents yet</Status>}
                      {!d.isActive && <Status>Paused</Status>}
                      {incomplete && <Status tone="bad">Unfinished</Status>}
                    </ul>
                  </div>
                  <div className="flex items-center gap-2">
                    {incomplete ? (
                      <Link
                        href={`/onboarding?dog=${d.id}&step=${d._count.photos === 0 ? 2 : 3}`}
                        className="inline-flex h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper hover:bg-felt"
                      >
                        Finish profile
                      </Link>
                    ) : (
                      <Link href={`/dogs/${d.id}/edit`} className="inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold hover:bg-paper-deep">
                        Edit
                      </Link>
                    )}
                    {dogs.length > 1 &&
                      (isActive ? (
                        <span className="inline-flex h-11 items-center gap-1.5 rounded-full bg-paper-deep px-4 text-sm font-semibold">
                          <Check size={16} aria-hidden="true" /> Browsing as
                        </span>
                      ) : (
                        <form action={chooseActiveDog}>
                          <input type="hidden" name="dogId" value={d.id} />
                          <SubmitButton variant="secondary" pendingLabel="Switching…" className="h-11 px-4 text-sm">
                            Browse as {d.name}
                          </SubmitButton>
                        </form>
                      ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="account-title" className="mt-14 border-t border-line pt-10">
        <h2 id="account-title" className="font-display text-[28px] leading-tight">
          Account
        </h2>
        <p className="mt-3">
          <span className="font-semibold">{user.name}</span> · <span className="text-ink-soft">{user.email}</span>
        </p>
        {/* Sign out also lives in the sidebar on larger screens. */}
        <SignOutButton className="mt-6 inline-flex h-12 items-center gap-2 rounded-full border border-line px-5 font-semibold hover:bg-paper-deep" />
      </section>
    </div>
  );
}

function Status({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "bad" }) {
  const styles = tone === "good" ? "bg-verified/12 text-verified" : tone === "bad" ? "bg-danger/10 text-danger" : "bg-paper-deep text-ink-soft";
  return <li className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>{children}</li>;
}

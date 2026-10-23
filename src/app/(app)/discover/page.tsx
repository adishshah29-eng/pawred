import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid, Rows3 } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ageLabel, getActiveDog } from "@/lib/dogs";
import { breedName } from "@/lib/breeds";
import { fitNotes, listDiscover } from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import { FeedCard } from "@/components/discover/FeedCard";
import { GridTile } from "@/components/discover/GridTile";
import { EmptyState } from "@/components/match/EmptyState";

export const metadata: Metadata = { title: "Discover" };

// Depends on the signed-in user, so it renders per request.
export const instant = false;

const PAGE = { feed: 6, grid: 24 } as const;

// /discover?view=feed|grid&verified=1&city=1&limit=N
//   feed: one dog per card, like an Instagram feed
//   grid: masonry of photos, like Pinterest
export default async function DiscoverPage({ searchParams }: PageProps<"/discover">) {
  const user = await requireUser("/discover");
  const me = await getActiveDog(user.id);

  if (!me) {
    return (
      <EmptyState
        title="First, your dog"
        body="Create your dog's profile and we'll show compatible dogs nearby."
        action={{ href: "/onboarding", label: "Create a profile" }}
      />
    );
  }

  const sp = await searchParams;
  const view = sp.view === "grid" ? "grid" : "feed";
  const verifiedOnly = sp.verified === "1";
  const sameCity = sp.city === "1";
  const limit = Math.min(60, Math.max(PAGE[view], Number(sp.limit) || PAGE[view]));

  // Profile completeness and the dogs to show are independent, so they run together.
  const [photoCount, promptCount, { dogs, total, admirerIds }] = await Promise.all([
    prisma.dogPhoto.count({ where: { dogId: me.id } }),
    prisma.promptAnswer.count({ where: { dogId: me.id } }),
    listDiscover(me, { verifiedOnly, city: sameCity ? me.city : undefined }, limit),
  ]);

  if (photoCount === 0 || promptCount < 3) {
    return (
      <EmptyState
        title={`Finish ${me.name}'s profile`}
        body="Owners only see complete profiles, so Discover opens once yours has a photo and three prompts."
        action={{ href: `/onboarding?dog=${me.id}&step=${photoCount === 0 ? 2 : 3}`, label: "Finish profile" }}
      />
    );
  }

  // Links that keep the other settings when one changes.
  const href = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams();
    const current: Record<string, string | null> = { view: view === "grid" ? "grid" : null, verified: verifiedOnly ? "1" : null, city: sameCity ? "1" : null };
    for (const [k, v] of Object.entries({ ...current, ...changes })) if (v) next.set(k, v);
    const q = next.toString();
    return q ? `/discover?${q}` : "/discover";
  };

  const breeds = await Promise.all(dogs.map((d) => breedName(d.breed)));

  return (
    <div className={`mx-auto w-full px-5 pb-12 pt-6 sm:px-8 md:pt-10 ${view === "grid" ? "max-w-[1120px]" : "max-w-[640px]"}`}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Layout" className="flex rounded-full border border-line bg-card p-1">
          <ViewLink href={href({ view: null })} active={view === "feed"} icon={<Rows3 size={16} aria-hidden="true" />} label="Feed" />
          <ViewLink href={href({ view: "grid" })} active={view === "grid"} icon={<LayoutGrid size={16} aria-hidden="true" />} label="Grid" />
        </nav>
        <div className="flex gap-2" role="group" aria-label="Filters">
          <FilterChip href={href({ verified: verifiedOnly ? null : "1" })} on={verifiedOnly}>
            Verified only
          </FilterChip>
          <FilterChip href={href({ city: sameCity ? null : "1" })} on={sameCity}>
            In {me.city}
          </FilterChip>
        </div>
      </div>

      {dogs.length === 0 ? (
        <EmptyState
          title="You've seen everyone for now"
          body={
            verifiedOnly || sameCity
              ? "Try turning off a filter to see more dogs."
              : `No more compatible ${await breedName(me.breed)} profiles right now. New dogs join every week, so check back soon.`
          }
          action={verifiedOnly || sameCity ? { href: href({ verified: null, city: null }), label: "Clear filters" } : { href: "/likes", label: "See who liked you" }}
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-soft" aria-live="polite">
            {total} {total === 1 ? "dog suits" : "dogs suit"} {me.name}
          </p>

          {view === "feed" ? (
            <div className="grid gap-6">
              {dogs.map((dog, i) => (
                <FeedCard
                  key={dog.id}
                  dog={dog}
                  breed={breeds[i]}
                  age={ageLabel(dog.dateOfBirth)}
                  fit={fitNotes(me, dog).filter((n) => n.ok).map((n) => n.text).slice(0, 3)}
                  priority={i === 0}
                  admirer={admirerIds.has(dog.id)}
                />
              ))}
            </div>
          ) : (
            <ul className="columns-2 gap-4 md:columns-3 xl:columns-4">
              {dogs.map((dog, i) => (
                <GridTile key={dog.id} dog={dog} breed={breeds[i]} age={ageLabel(dog.dateOfBirth)} />
              ))}
            </ul>
          )}

          {total > dogs.length && (
            <div className="mt-8 text-center">
              <Link
                href={href({ limit: String(limit + PAGE[view]) })}
                scroll={false}
                className="inline-flex h-12 items-center rounded-full border border-line bg-card px-6 font-semibold transition-colors hover:bg-paper-deep"
              >
                Show more ({total - dogs.length} left)
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ViewLink({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      replace
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"}`}
    >
      {icon}
      {label}
    </Link>
  );
}

function FilterChip({ href, on, children }: { href: string; on: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      replace
      aria-current={on ? "true" : undefined}
      className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors ${
        on ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink hover:bg-paper-deep"
      }`}
    >
      {children}
    </Link>
  );
}

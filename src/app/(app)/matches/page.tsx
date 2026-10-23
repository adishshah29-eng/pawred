import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getActiveDog } from "@/lib/dogs";
import { getMatches } from "@/lib/matching";
import { breedName } from "@/lib/breeds";
import { Rosette } from "@/components/site/Wordmark";
import { EmptyState } from "@/components/match/EmptyState";

export const metadata: Metadata = { title: "Matches" };

// Depends on the signed-in user, so it renders per request.
export const instant = false;

function when(d: Date) {
  const diff = Date.now() - +d;
  if (diff < 60_000) return "now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default async function MatchesPage() {
  const user = await requireUser("/matches");
  const me = await getActiveDog(user.id);
  if (!me) {
    return <EmptyState title="No dog yet" body="Create your dog's profile to start matching." action={{ href: "/onboarding", label: "Create a profile" }} />;
  }

  const matches = await getMatches(me.id);
  if (matches.length === 0) {
    return (
      <EmptyState
        title="No matches yet"
        body="When you and another owner like each other's dogs, you'll be able to chat here."
        action={{ href: "/discover", label: "Go to Discover" }}
      />
    );
  }

  const breeds = await Promise.all(matches.map((m) => breedName(m.other.breed)));

  return (
    <div className="mx-auto w-full max-w-[640px] px-5 py-8 sm:px-8 md:py-12">
      <h1 className="font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05]">Matches</h1>
      <p className="mt-2 text-lg text-ink-soft">{me.name}&apos;s matches. Talk health first, then plan a meeting.</p>

      <ul className="mt-8 divide-y divide-line overflow-hidden rounded-[28px] border border-line bg-card">
        {matches.map((m, i) => (
          <li key={m.id}>
            <Link href={`/matches/${m.id}`} className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-paper/70">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-paper-deep">
                {m.other.photos[0] && <Image src={m.other.photos[0].url} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className={`flex min-w-0 items-center gap-1.5 text-lg ${m.unread ? "font-bold" : "font-semibold"}`}>
                    <span className="truncate">{m.other.name}</span>
                    {m.other.verificationStatus === "VERIFIED" && (
                      <span title="Health-verified" className="shrink-0">
                        <Rosette className="size-4" />
                        <span className="sr-only">Verified</span>
                      </span>
                    )}
                  </p>
                  <span className={`shrink-0 text-sm tabular-nums ${m.unread ? "font-semibold text-ink" : "text-ink-soft"}`}>
                    {when(m.last?.createdAt ?? m.createdAt)}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-3">
                  <p className={`truncate ${m.unread ? "font-medium text-ink" : "text-ink-soft"}`}>
                    {m.last ? (m.last.senderDogId === me.id ? `You: ${m.last.text}` : m.last.text) : "New match. Say hello!"}
                  </p>
                  {m.unread > 0 && (
                    <span className="grid min-w-6 shrink-0 place-items-center rounded-full bg-marigold px-1.5 text-xs font-bold text-ink">
                      {m.unread}
                      <span className="sr-only"> unread</span>
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-ink-soft">
                  {breeds[i]} · {m.other.city}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

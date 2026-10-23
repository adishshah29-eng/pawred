import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Ellipsis, PartyPopper, ShieldCheck, Syringe } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getMatchForUser, listMessages } from "@/lib/chat";
import { breedName } from "@/lib/breeds";
import { DOC_LABELS } from "@/lib/health";
import { Rosette } from "@/components/site/Wordmark";
import { unmatch } from "@/actions/matching";
import { ChatThread } from "@/components/chat/ChatThread";
import { ReportDog } from "@/components/match/MatchButtons";
import { SubmitButton } from "@/components/ui/form";

export const metadata: Metadata = { title: "Chat" };

// Depends on the signed-in user, so it renders per request.
export const instant = false;

const healthChip = "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-line bg-card px-3 text-[13px]";

export default async function ChatPage({ params, searchParams }: PageProps<"/matches/[matchId]">) {
  const { matchId } = await params;
  const sp = await searchParams;
  const user = await requireUser(`/matches/${matchId}`);
  // Both queries start together. The messages are only used if the match belongs to this user.
  const [match, messages] = await Promise.all([getMatchForUser(matchId, user.id), listMessages(matchId)]);
  if (!match) notFound();
  const { me, other } = match;
  const breed = await breedName(other.breed);

  return (
    // Full-height chat: header, scrolling messages, composer. Leaves room for the mobile tab bar.
    <div className="mx-auto flex h-[calc(100dvh-8.5rem)] w-full max-w-[760px] flex-col md:h-dvh">
      <header className="flex items-center gap-3 border-b border-line px-3 py-3 sm:px-5">
        <Link href="/matches" className="grid size-11 place-items-center rounded-full hover:bg-paper-deep" aria-label="Back to matches">
          <ArrowLeft size={20} />
        </Link>
        <Link href={`/dogs/${other.id}`} className="flex min-w-0 flex-1 items-center gap-3">
          <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-paper-deep">
            {other.photos[0] && <Image src={other.photos[0].url} alt="" fill sizes="44px" className="object-cover" />}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="truncate">{other.name}</span>
              {other.verificationStatus === "VERIFIED" && (
                <span className="shrink-0" title="Health-verified">
                  <Rosette className="size-4" />
                  <span className="sr-only">Verified</span>
                </span>
              )}
            </span>
            <span className="block truncate text-sm text-ink-soft">
              {breed} · {other.city} · {other.owner.name}
            </span>
          </span>
        </Link>
        <details className="relative">
          <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-full hover:bg-paper-deep" aria-label="More options">
            <Ellipsis size={20} aria-hidden="true" />
          </summary>
          <div className="absolute right-0 top-12 z-20 grid w-72 gap-2 rounded-[20px] border border-line bg-card p-3 shadow-[0_20px_40px_-20px_rgba(30,26,22,0.35)]">
            <Link href={`/dogs/${other.id}`} className="flex h-11 items-center rounded-xl px-3 hover:bg-paper">
              View {other.name}&apos;s profile
            </Link>
            {!match.unmatchedAt && (
              <form action={unmatch}>
                <input type="hidden" name="matchId" value={match.id} />
                <SubmitButton variant="secondary" pendingLabel="Unmatching…" className="h-11 w-full justify-start rounded-xl! border-0 px-3 text-danger">
                  Unmatch
                </SubmitButton>
              </form>
            )}
            <div className="px-3">
              <ReportDog dogId={other.id} dogName={other.name} />
            </div>
          </div>
        </details>
      </header>

      {/* Health facts stay in view while the owners talk, since that's what the chat is for. */}
      <ul className="flex gap-2 overflow-x-auto border-b border-line px-3 py-2.5 sm:px-5" aria-label={`${other.name}'s health`}>
        <li className={`${healthChip} ${other.vaccinated ? "" : "text-ink-soft"}`}>
          <Syringe size={14} className={other.vaccinated ? "text-verified" : ""} aria-hidden="true" />
          {other.vaccinated ? "Vaccinated" : "Vaccination not confirmed"}
        </li>
        {other.healthDocs.map((d) => (
          <li key={d.type} className={healthChip}>
            <ShieldCheck size={14} className="text-verified" aria-hidden="true" />
            {DOC_LABELS[d.type] ?? d.type}
          </li>
        ))}
      </ul>

      {sp.new === "1" && messages.length === 0 && (
        <div className="mx-4 mt-4 flex items-center gap-3 rounded-[20px] bg-felt px-5 py-4 text-on-felt sm:mx-6">
          <PartyPopper size={22} className="shrink-0 text-marigold" aria-hidden="true" />
          <p>
            <strong className="font-display text-[22px] font-normal">It&apos;s a match.</strong>{" "}
            <span className="text-on-felt-soft">
              {me.name} and {other.name} liked each other.
            </span>
          </p>
        </div>
      )}

      <ChatThread matchId={match.id} myDogId={me.id} otherName={other.name} initial={messages} unmatched={Boolean(match.unmatchedAt)} />
    </div>
  );
}

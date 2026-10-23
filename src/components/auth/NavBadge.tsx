import { requireUser } from "@/lib/session";
import { getActiveDog } from "@/lib/dogs";
import { getMatches, getPendingLikes } from "@/lib/matching";

// Small count next to "Likes you" / "Matches". Reads the session, so it sits inside <Suspense>.
export async function NavBadge({ kind }: { kind: "likes" | "matches" }) {
  const user = await requireUser();
  const me = await getActiveDog(user.id);
  if (!me) return null;

  const count =
    kind === "likes"
      ? (await getPendingLikes(me.id)).length
      : (await getMatches(me.id)).reduce((sum, m) => sum + m.unread, 0);
  if (count === 0) return null;

  return (
    <span className="grid min-w-5 place-items-center rounded-full bg-marigold px-1.5 text-[11px] font-bold leading-5 text-ink tabular-nums">
      {count > 9 ? "9+" : count}
      <span className="sr-only">{kind === "likes" ? " new likes" : " unread messages"}</span>
    </span>
  );
}

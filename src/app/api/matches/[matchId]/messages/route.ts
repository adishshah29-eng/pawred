// GET /api/matches/:matchId/messages?after=<ISO date>
// The chat page polls this every few seconds (syllabus Unit 3: Route Handlers).
// Only the two owners in the match can read it.
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { getMatchForUser, listMessages, markRead, readUpTo } from "@/lib/chat";
import { matchesTag } from "@/lib/matching";

export async function GET(request: Request, ctx: RouteContext<"/api/matches/[matchId]/messages">) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Sign in first." }, { status: 401 });

  const { matchId } = await ctx.params;
  const match = await getMatchForUser(matchId, session.user.id);
  if (!match) return Response.json({ error: "Not found." }, { status: 404 });

  const afterParam = new URL(request.url).searchParams.get("after");
  const after = afterParam ? new Date(afterParam) : undefined;
  if (after && Number.isNaN(+after)) return Response.json({ error: "Bad 'after' date." }, { status: 400 });

  // Three independent queries, run together (each costs a round trip to the database).
  const [messages, marked, readUpToTime] = await Promise.all([
    listMessages(matchId, after),
    markRead(matchId, match.me.id),
    readUpTo(matchId, match.me.id),
  ]);
  if (marked > 0) revalidateTag(matchesTag(match.me.id), "max"); // unread badge on the Matches list

  return Response.json(
    { messages, unmatched: Boolean(match.unmatchedAt), readUpTo: readUpToTime },
    { headers: { "Cache-Control": "no-store" } },
  );
}

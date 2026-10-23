"use client";

import { Fragment, useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import { ArrowUp, LoaderCircle } from "lucide-react";
import { sendMessage } from "@/actions/chat";
import type { ChatMessage } from "@/lib/chat";
import styles from "./Chat.module.css";

const POLL_MS = 4000;

type Local = ChatMessage & { pending?: boolean };

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
const day = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

export function ChatThread({
  matchId,
  myDogId,
  otherName,
  initial,
  unmatched: initiallyUnmatched,
}: {
  matchId: string;
  myDogId: string;
  otherName: string;
  initial: ChatMessage[];
  unmatched: boolean;
}) {
  const [messages, setMessages] = useState<Local[]>(initial);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unmatched, setUnmatched] = useState(initiallyUnmatched);
  const [readUpTo, setReadUpTo] = useState<string | null>(null);
  const [sending, startSending] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  // Merge new messages in, keeping order and dropping duplicates.
  const merge = useCallback((incoming: ChatMessage[]) => {
    if (incoming.length === 0) return;
    setMessages((prev) => {
      const byId = new Map(prev.filter((m) => !m.pending).map((m) => [m.id, m]));
      incoming.forEach((m) => byId.set(m.id, m));
      const pending = prev.filter((m) => m.pending);
      return [...[...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt)), ...pending];
    });
  }, []);

  const lastConfirmed = messages.filter((m) => !m.pending).at(-1)?.createdAt;

  // Poll the Route Handler for new messages (paused while the tab is hidden).
  useEffect(() => {
    let stopped = false;
    async function poll() {
      if (document.hidden) return;
      try {
        const url = `/api/matches/${matchId}/messages${lastConfirmed ? `?after=${encodeURIComponent(lastConfirmed)}` : ""}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok || stopped) return;
        const data = (await res.json()) as { messages: ChatMessage[]; unmatched: boolean; readUpTo: string | null };
        merge(data.messages);
        setUnmatched(data.unmatched);
        setReadUpTo(data.readUpTo);
      } catch {
        // Offline for a moment; the next poll will catch up.
      }
    }
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, [matchId, lastConfirmed, merge]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  function send() {
    const body = text.trim();
    if (!body || sending) return;
    setError(null);
    const temp: Local = { id: `temp-${Date.now()}`, text: body, senderDogId: myDogId, createdAt: new Date().toISOString(), readAt: null, pending: true };
    setMessages((m) => [...m, temp]);
    setText("");
    startSending(async () => {
      const res = await sendMessage(matchId, body);
      setMessages((m) => m.filter((x) => x.id !== temp.id));
      if (res.error) {
        setError(res.error);
        setText(body);
      } else if (res.message) {
        merge([res.message]);
      }
    });
  }

  const lastMine = [...messages].reverse().find((m) => m.senderDogId === myDogId && !m.pending);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6" aria-live="polite" aria-label="Messages">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-[380px] py-10 text-center text-ink-soft">
            <p className="font-display text-[24px] text-ink">Say hello to {otherName}&apos;s human</p>
            <p className="mt-2">A good first message: what caught your eye, and one health question.</p>
          </div>
        ) : (
          <ol className={styles.list}>
            {messages.map((m, i) => {
              const mine = m.senderDogId === myDogId;
              const newDay = i === 0 || day(messages[i - 1].createdAt) !== day(m.createdAt);
              return (
                <Fragment key={m.id}>
                  {newDay && <li className={styles.dayDivider}>{day(m.createdAt)}</li>}
                  <li className={`${styles.row} ${mine ? styles.mine : styles.theirs}`}>
                    <p className={`${styles.bubble} ${m.pending ? styles.sending : ""}`}>
                      <span className="sr-only">{mine ? "You" : otherName}: </span>
                      {m.text}
                    </p>
                  </li>
                  {m.id === lastMine?.id && (
                    <li className={`${styles.meta} text-right`}>
                      {time(m.createdAt)} · {m.readAt || (readUpTo && m.createdAt <= readUpTo) ? "Read" : "Sent"}
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ol>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-line bg-paper px-4 pb-4 pt-3 sm:px-6">
        {unmatched ? (
          <p className="rounded-2xl bg-paper-deep px-4 py-3 text-center text-ink-soft">This match has ended, so the chat is closed.</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-end gap-2"
          >
            <label htmlFor={inputId} className="sr-only">
              Message {otherName}&apos;s human
            </label>
            <textarea
              id={inputId}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              maxLength={1000}
              placeholder="Write a message"
              className="max-h-40 min-h-12 flex-1 resize-none rounded-[24px] border border-line bg-card px-4 py-3 text-[16px] [field-sizing:content] focus:border-marigold-deep focus:outline-none"
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              aria-label="Send message"
              className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-paper transition-colors hover:bg-felt disabled:opacity-40"
            >
              {sending ? <LoaderCircle size={20} className="animate-spin" aria-hidden="true" /> : <ArrowUp size={20} aria-hidden="true" />}
            </button>
          </form>
        )}
        {error && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { createContext, useContext, useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Heart, LoaderCircle, X } from "lucide-react";
import { sendLike } from "@/actions/matching";
import { showToast } from "@/components/app/Toast";

// Hinge-style liking: every photo and prompt gets a heart. Tapping it opens
// a sheet where the owner can add a comment, then sends the like.

type Target = { type: "PHOTO" | "PROMPT"; id: string; label: string };
type Ctx = { open: (t: Target) => void; disabled: boolean };

const LikeContext = createContext<Ctx | null>(null);
const ease = [0.22, 1, 0.36, 1] as const;

export function LikeProvider({ toDogId, dogName, children }: { toDogId: string; dogName: string; children: React.ReactNode }) {
  const router = useRouter();
  const [target, setTarget] = useState<Target | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const id = useId();

  useEffect(() => {
    if (target) requestAnimationFrame(() => textareaRef.current?.focus());
  }, [target]);

  function close() {
    if (pending) return;
    setTarget(null);
    setComment("");
    setError(null);
  }

  function send() {
    if (!target) return;
    setError(null);
    startTransition(async () => {
      const res = await sendLike({ toDogId, targetType: target.type, targetId: target.id, comment });
      if (res.error) {
        setError(res.error);
        return;
      }
      setTarget(null);
      setComment("");
      if (res.matchId) {
        router.push(`/matches/${res.matchId}?new=1`);
      } else {
        showToast(`Like sent to ${dogName}`);
        router.refresh(); // the liked dog leaves the feed; a profile page shows its new state
      }
    });
  }

  return (
    <LikeContext value={{ open: setTarget, disabled: pending }}>
      <MotionConfig reducedMotion="user">
        {children}
        <AnimatePresence>
          {target && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-ink/40"
                onClick={close}
                aria-hidden="true"
              />
              <motion.div
                key="sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${id}-title`}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.32, ease }}
                onKeyDown={(e) => e.key === "Escape" && close()}
                className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[560px] rounded-t-[28px] bg-card p-6 pb-8 shadow-[0_-20px_50px_-20px_rgba(30,26,22,0.35)] md:bottom-6 md:rounded-[28px]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p id={`${id}-title`} className="font-display text-[26px] leading-tight">
                      Like {dogName}&apos;s {target.type === "PHOTO" ? "photo" : "answer"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{target.label}</p>
                  </div>
                  <button type="button" onClick={close} className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-paper" aria-label="Cancel">
                    <X size={20} />
                  </button>
                </div>
                <label htmlFor={`${id}-comment`} className="mt-5 block text-[15px] font-medium">
                  Add a comment <span className="font-normal text-ink-soft">(optional)</span>
                </label>
                <textarea
                  id={`${id}-comment`}
                  ref={textareaRef}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={140}
                  rows={3}
                  placeholder={`Say why ${dogName} caught your eye`}
                  className="mt-1.5 w-full resize-none rounded-2xl border border-line bg-paper px-4 py-3 text-[16px] focus:border-marigold-deep focus:outline-none"
                />
                <p className="mt-1 text-right text-sm tabular-nums text-ink-soft">{comment.length}/140</p>
                {error && (
                  <p role="alert" className="mt-2 rounded-2xl bg-danger/10 px-4 py-3 text-[15px] text-danger">
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={send}
                  disabled={pending}
                  className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-marigold text-[17px] font-semibold text-ink transition-colors hover:bg-marigold-deep disabled:opacity-70"
                >
                  {pending ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Heart size={18} fill="currentColor" aria-hidden="true" />}
                  {pending ? "Sending…" : "Send like"}
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </MotionConfig>
    </LikeContext>
  );
}

export function LikeButton({ type, id, label, size = "md" }: Target & { size?: "md" | "sm" }) {
  const ctx = useContext(LikeContext);
  if (!ctx) throw new Error("LikeButton must be inside LikeProvider");
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.88 }}
      disabled={ctx.disabled}
      onClick={() => ctx.open({ type, id, label })}
      aria-label={type === "PHOTO" ? "Like this photo" : "Like this answer"}
      className={`grid ${size === "sm" ? "size-10" : "size-[52px]"} place-items-center rounded-full bg-card text-marigold-deep shadow-[0_8px_20px_-8px_rgba(30,26,22,0.45)] transition-colors duration-200 hover:bg-marigold hover:text-ink`}
    >
      <Heart size={size === "sm" ? 19 : 24} strokeWidth={2.2} aria-hidden="true" />
    </motion.button>
  );
}

/** Double-click (or double-tap) a photo to like it, like Instagram. The heart button stays as the main way. */
export function LikeSurface({ type, id, label, className = "", children }: Target & { className?: string; children: React.ReactNode }) {
  const ctx = useContext(LikeContext);
  const [burst, setBurst] = useState(0);
  if (!ctx) throw new Error("LikeSurface must be inside LikeProvider");
  return (
    <div
      className={className}
      onDoubleClick={() => {
        setBurst((b) => b + 1);
        ctx.open({ type, id, label });
      }}
    >
      {children}
      {burst > 0 && (
        <motion.span
          key={burst}
          initial={{ scale: 0.5, opacity: 0.95 }}
          animate={{ scale: 1.3, opacity: 0 }}
          transition={{ duration: 0.7, ease }}
          className="pointer-events-none absolute inset-0 grid place-items-center text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.35)]"
          aria-hidden="true"
        >
          <Heart size={96} fill="currentColor" strokeWidth={0} />
        </motion.span>
      )}
    </div>
  );
}

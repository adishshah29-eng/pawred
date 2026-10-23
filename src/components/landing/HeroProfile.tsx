"use client";

// Interactive sample profile: like a photo or prompt, add a comment, see the match moment.
// Animmaster slot: a Hero Animation can wrap this card's entrance once the pack is added.

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Heart, MapPin, ShieldCheck, X } from "lucide-react";
import { bruno, photos } from "@/lib/sample-data";
import { Rosette } from "@/components/site/Wordmark";

type Target = "photo" | "prompt";
type Stage = { kind: "idle" } | { kind: "composing"; target: Target } | { kind: "matched"; target: Target; comment: string };

const suggestions: Record<Target, string> = {
  photo: "That grin! Maya makes the same face at the beach.",
  prompt: "Maya swims every Sunday. She'd share the tennis ball. Probably.",
};

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroProfile() {
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  const [comment, setComment] = useState("");
  const commentId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function startLike(target: Target) {
    setComment(suggestions[target]);
    setStage({ kind: "composing", target });
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function send() {
    if (stage.kind !== "composing") return;
    setStage({ kind: "matched", target: stage.target, comment: comment.trim() });
  }

  const liked = stage.kind !== "idle" ? stage.target : null;

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative mx-auto w-full max-w-[440px]">
        <p className="mb-3 flex items-center gap-2 text-sm text-ink-soft">
          <span className="inline-block size-2 rounded-full bg-marigold" aria-hidden="true" />
          Try it: you&apos;re Maya&apos;s human. Like one thing about Bruno.
        </p>

        <motion.article
          aria-label="Sample profile: Bruno"
          initial={{ y: 24, rotate: 1.5 }}
          animate={{ y: 0, rotate: 0 }}
          transition={{ duration: 0.8, ease }}
          className="relative overflow-hidden rounded-[28px] border border-line bg-card p-3 shadow-[0_30px_60px_-30px_rgba(30,26,22,0.35)]"
        >
          <header className="flex items-start justify-between px-2 pb-3 pt-1">
            <div>
              <h2 className="font-display text-[34px] leading-none">{bruno.name}</h2>
              <p className="mt-1.5 text-sm text-ink-soft">
                {bruno.breed} · {bruno.sex} · {bruno.age}
              </p>
            </div>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 text-xs font-semibold text-verified">
              <Rosette className="size-4" />
              Verified
            </span>
          </header>

          <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-paper-deep">
            <Image
              src={`${bruno.photo}?w=900&q=75`}
              alt={bruno.photoAlt}
              fill
              priority
              sizes="(min-width: 640px) 420px, 92vw"
              className="object-cover object-[50%_30%]"
            />
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium">
              <MapPin size={13} aria-hidden="true" /> {bruno.city} · {bruno.distance}
            </span>
            <LikeButton
              label="Like Bruno's photo"
              active={liked === "photo"}
              onClick={() => startLike("photo")}
              className="absolute bottom-3 right-3"
            />
          </div>

          <div className="relative mt-3 rounded-[20px] bg-paper px-5 pb-5 pt-4">
            <p className="text-sm font-semibold text-ink-soft">{bruno.prompt}</p>
            <p className="mt-1.5 pr-12 font-display text-[20px] leading-[1.25]">{bruno.answer}</p>
            <LikeButton
              label="Like Bruno's prompt answer"
              active={liked === "prompt"}
              onClick={() => startLike("prompt")}
              className="absolute bottom-4 right-4"
            />
          </div>

          <ul className="flex flex-wrap gap-2 px-2 pb-1 pt-3" aria-label="Health checks">
            {bruno.health.map((h) => (
              <li
                key={h}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-[13px] text-ink-soft"
              >
                <ShieldCheck size={14} className="text-verified" aria-hidden="true" />
                {h}
              </li>
            ))}
          </ul>

          <AnimatePresence>
            {stage.kind === "composing" && (
              <motion.div
                key="sheet"
                role="dialog"
                aria-label={stage.target === "photo" ? "Like Bruno's photo" : "Like Bruno's prompt"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.38, ease }}
                className="absolute inset-x-0 bottom-0 z-10 rounded-t-[24px] border-t border-line bg-card p-5 shadow-[0_-20px_40px_-20px_rgba(30,26,22,0.3)]"
                onKeyDown={(e) => e.key === "Escape" && setStage({ kind: "idle" })}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    You&apos;re liking Bruno&apos;s {stage.target === "photo" ? "photo" : "prompt answer"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStage({ kind: "idle" })}
                    className="grid size-11 place-items-center rounded-full hover:bg-paper"
                    aria-label="Cancel like"
                  >
                    <X size={20} />
                  </button>
                </div>
                <label htmlFor={commentId} className="mt-3 block text-sm text-ink-soft">
                  Add a comment (optional)
                </label>
                <textarea
                  id={commentId}
                  ref={textareaRef}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  maxLength={140}
                  className="mt-1.5 w-full resize-none rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] focus:border-marigold-deep focus:outline-none"
                />
                <button
                  type="button"
                  onClick={send}
                  className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-marigold font-semibold text-ink transition-colors duration-200 hover:bg-marigold-deep"
                >
                  <Heart size={18} fill="currentColor" aria-hidden="true" /> Send like
                </button>
              </motion.div>
            )}

            {stage.kind === "matched" && (
              <motion.div
                key="match"
                role="status"
                initial={{ clipPath: "circle(0% at 85% 60%)" }}
                animate={{ clipPath: "circle(150% at 85% 60%)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease }}
                className="absolute inset-0 z-20 flex flex-col bg-felt p-3 text-on-felt"
              >
                <div className="relative min-h-0 flex-1 overflow-hidden rounded-[20px]">
                  <Image
                    src={`${photos.goldenPair}?w=900&q=75`}
                    alt="Two golden retrievers lying side by side"
                    fill
                    sizes="(min-width: 640px) 420px, 92vw"
                    className="object-cover"
                  />
                </div>
                <div className="px-3 pb-3 pt-5">
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5, ease }}
                    className="font-display text-[44px] leading-none"
                  >
                    It&apos;s a match.
                  </motion.p>
                  <p className="mt-3 text-on-felt-soft">
                    Bruno&apos;s human liked Maya back
                    {stage.comment ? <> after reading: &ldquo;{stage.comment}&rdquo;</> : "."}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <a
                      href="/sign-up"
                      className="inline-flex h-12 items-center whitespace-nowrap rounded-full bg-marigold px-5 font-semibold text-ink transition-colors duration-200 hover:bg-marigold-deep"
                    >
                      Make Maya&apos;s profile
                    </a>
                    <button
                      type="button"
                      onClick={() => setStage({ kind: "idle" })}
                      className="h-12 whitespace-nowrap rounded-full px-2 text-sm text-on-felt-soft underline hover:text-on-felt"
                    >
                      Replay demo
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.article>
      </div>
    </MotionConfig>
  );
}

function LikeButton({
  label,
  active,
  onClick,
  className = "",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      className={`grid size-[52px] place-items-center rounded-full bg-card text-marigold-deep shadow-[0_8px_20px_-8px_rgba(30,26,22,0.45)] transition-colors duration-200 hover:bg-marigold hover:text-ink ${
        active ? "bg-marigold text-ink" : ""
      } ${className}`}
    >
      <Heart size={24} strokeWidth={2.2} fill={active ? "currentColor" : "none"} aria-hidden="true" />
    </motion.button>
  );
}

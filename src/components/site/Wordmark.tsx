// Wordmark: name set in the display serif, with a small rosette mark.
export function Wordmark({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  return (
    <span
      className={`flex items-center gap-2 font-display text-[26px] leading-none tracking-[-0.01em] ${
        tone === "paper" ? "text-on-felt" : "text-ink"
      }`}
    >
      <Rosette className="size-6" />
      Pawred
    </span>
  );
}

export function Rosette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M8.5 13.5 6 22l3.6-2 2.4 2.6.6-8.6Z" fill="var(--marigold-deep)" />
      <path d="M15.5 13.5 18 22l-3.6-2-2.4 2.6-.6-8.6Z" fill="var(--marigold-deep)" />
      <circle cx="12" cy="9" r="7.5" fill="var(--marigold)" />
      <circle cx="12" cy="9" r="4.2" fill="none" stroke="var(--ink)" strokeWidth="1.2" />
    </svg>
  );
}

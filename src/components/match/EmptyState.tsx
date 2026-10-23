import Link from "next/link";

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mx-auto max-w-[460px] px-5 py-20 text-center">
      <svg viewBox="0 0 64 64" className="mx-auto size-16 text-line" aria-hidden="true">
        <g fill="currentColor">
          <ellipse cx="32" cy="42" rx="13" ry="11" />
          <ellipse cx="16" cy="26" rx="6" ry="8" />
          <ellipse cx="27" cy="16" rx="6" ry="8" />
          <ellipse cx="38" cy="16" rx="6" ry="8" />
          <ellipse cx="48" cy="26" rx="6" ry="8" />
        </g>
      </svg>
      <h1 className="mt-6 font-display text-[clamp(1.9rem,4vw,2.5rem)] leading-tight">{title}</h1>
      <p className="mt-3 text-lg text-ink-soft">{body}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-paper transition-colors hover:bg-felt"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

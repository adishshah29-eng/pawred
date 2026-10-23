"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// One link component for every navigation in the app, so the current page always
// looks the same way (and is announced as the current page to screen readers).
type Props = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  /** side = sidebar row · tab = mobile bottom bar · pill = admin top bar */
  variant?: "side" | "tab" | "pill";
  /** Only the exact path counts as current (e.g. the admin overview). */
  exact?: boolean;
};

export function NavLink({ href, label, icon, badge, variant = "side", exact }: Props) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  if (variant === "tab") {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`relative flex h-16 flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
          active ? "font-semibold text-ink" : "text-ink-soft"
        }`}
      >
        <span className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${active ? "bg-marigold/30" : ""}`}>{icon}</span>
        {label}
        {badge && <span className="absolute left-1/2 top-1.5 ml-2.5">{badge}</span>}
      </Link>
    );
  }

  if (variant === "pill") {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] transition-colors duration-200 ${
          active ? "bg-ink font-semibold text-paper" : "text-ink-soft hover:bg-paper-deep hover:text-ink"
        }`}
      >
        {label}
        {badge}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex h-11 items-center gap-3 rounded-xl px-3 transition-colors duration-200 ${
        active ? "bg-paper-deep font-semibold text-ink" : "text-ink-soft hover:bg-paper-deep/70 hover:text-ink"
      }`}
    >
      <span className={active ? "text-marigold-deep" : ""}>{icon}</span>
      {label}
      {badge}
    </Link>
  );
}

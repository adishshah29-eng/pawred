import Link from "next/link";
import { Wordmark } from "./Wordmark";

const groups = [
  {
    title: "Pawred",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/safety", label: "Health & safety" },
      { href: "/sign-up", label: "Create a profile" },
    ],
  },
  {
    title: "Breeds",
    links: [
      { href: "/breeds/golden-retriever", label: "Golden Retriever" },
      { href: "/breeds/pug", label: "Pug" },
      { href: "/breeds/border-collie", label: "Border Collie" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-felt text-on-felt">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Wordmark tone="paper" />
          <p className="mt-4 text-on-felt-soft">
            Careful matchmaking for dog owners. A college mini-project (DJS23AMD302L). Profiles
            shown on this site are samples.
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="text-sm font-semibold text-on-felt">{g.title}</h2>
            <ul className="mt-4 space-y-3">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-on-felt-soft transition-colors duration-200 hover:text-on-felt"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-felt-raised">
        <p className="mx-auto max-w-[1240px] px-5 py-6 text-sm text-on-felt-soft sm:px-8">
          Dog photos from Unsplash.
        </p>
      </div>
    </footer>
  );
}

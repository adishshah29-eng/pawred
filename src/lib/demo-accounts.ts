// The three accounts created by `npm run db:seed` for live demos.
// Their shared password is DEMO_PASSWORD in .env (never written in code).
// Plain data only, so both the seed script and the sign-in page can import it.

export type DemoAccount = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  city?: string;
  dog?: { name: string; breed: string; id: string };
  /** One line the presenter can read out: what this account has set up. */
  blurb: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "demo-priya",
    name: "Priya Nair",
    email: "priya@pawred.demo",
    role: "user",
    city: "Pune",
    dog: { id: "demo-dog-luna", name: "Luna", breed: "Golden Retriever" },
    blurb: "Owns Luna. Has an unread chat from Simba, and Cooper is waiting in Discover.",
  },
  {
    id: "demo-rohan",
    name: "Rohan Mehta",
    email: "rohan@pawred.demo",
    role: "user",
    city: "Pune",
    dog: { id: "demo-dog-cooper", name: "Cooper", breed: "Golden Retriever" },
    blurb: "Owns Cooper. Honey already liked him, and Sunny sent an unread message.",
  },
  {
    id: "demo-admin",
    name: "Pawred Admin",
    email: "admin@pawred.demo",
    role: "admin",
    blurb: "Reviews health documents, handles reports, bans users.",
  },
];

export const demoEnabled = () => process.env.DEMO_MODE === "true";

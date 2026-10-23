// The public address of the site. Set NEXT_PUBLIC_SITE_URL on Vercel (Phase 10).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

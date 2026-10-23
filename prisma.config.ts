import "dotenv/config";
import { defineConfig } from "prisma/config";

// The Prisma CLI (migrate, studio, seed) uses Supabase's DIRECT connection.
// The app itself uses the pooled DATABASE_URL (see src/lib/prisma.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // May be unset during `prisma generate` (e.g. npm install on Vercel); that's fine.
    url: process.env.DIRECT_URL,
  },
});

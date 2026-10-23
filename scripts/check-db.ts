// Read-only connection check for the Supabase database: npm run db:check
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const [users, dogs, matches, messages] = await Promise.all([
      prisma.user.count(),
      prisma.dog.count(),
      prisma.match.count(),
      prisma.message.count(),
    ]);
    console.log(
      `Supabase OK: ${users} users, ${dogs} dogs, ${matches} matches, ${messages} messages`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Connection check failed:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});

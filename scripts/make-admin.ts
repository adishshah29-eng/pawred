// Give an existing account the admin role:
//   npm run make-admin -- you@example.com
// Sign up in the app first, then run this with the same email.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run make-admin -- you@example.com");
    process.exitCode = 1;
    return;
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL }),
  });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`No account with ${email}. Sign up in the app first.`);
      process.exitCode = 1;
      return;
    }
    await prisma.user.update({ where: { email }, data: { role: "admin" } });
    console.log(`${user.name} (${email}) is now an admin. Sign out and back in if the admin link doesn't appear.`);
  } finally {
    await prisma.$disconnect();
  }
}

main();

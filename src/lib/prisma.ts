import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// One Prisma client per server process. In dev, hot reload would otherwise
// create a new connection pool on every file save.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set. Add it to .env.");
  // DATABASE_URL is Supabase's pooled connection (port 6543).
  // Opening a connection to a faraway database takes seconds, so keep a few warm
  // instead of closing them after pg's default 10 s idle timeout.
  const adapter = new PrismaPg({
    connectionString,
    max: 5,
    idleTimeoutMillis: 5 * 60_000,
    connectionTimeoutMillis: 20_000,
    keepAlive: true,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

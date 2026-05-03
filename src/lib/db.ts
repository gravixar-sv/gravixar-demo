// Prisma client singleton with the PrismaPg adapter.
// Reads DATABASE_URL from env (Neon-injected via Vercel Marketplace).
// The globalThis trick prevents Next.js dev HMR from creating a new
// client on every reload.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Prisma 7 with the new client engine requires a driver adapter.
  // Strip Prisma-specific connection-string hints that pg would reject.
  const connectionString = (process.env.DATABASE_URL ?? "").replace(
    "?pgbouncer=true",
    "",
  );
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

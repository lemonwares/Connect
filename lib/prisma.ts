import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter, log: ["error"] });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Resets the singleton so the next call to getClient() creates a fresh connection
function resetClient() {
  globalForPrisma.prisma = undefined;
}

// Wraps any prisma call — on P1017 (server closed connection) it drops the
// stale singleton, creates a fresh client, and retries once.
export async function withRetry<T>(fn: (db: PrismaClient) => Promise<T>): Promise<T> {
  try {
    return await fn(getClient());
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "P1017") {
      resetClient();
      return await fn(getClient());
    }
    throw err;
  }
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

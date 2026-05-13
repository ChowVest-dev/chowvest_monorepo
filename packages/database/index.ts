import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

export * from "@prisma/client";

const connectionString = process.env.DATABASE_URL!;

const poolConfig = {
  connectionString,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: true }
    : { rejectUnauthorized: false },
  max: process.env.NODE_ENV === "production" ? 3 : 5,
  min: 0,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 8000,
  allowExitOnIdle: true,
};

let pool: Pool;
let adapter: PrismaPg;
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  pool = new Pool(poolConfig);
  adapter = new PrismaPg(pool);
  prisma = new PrismaClient({
    adapter,
    log: ["error"],
  });
} else {
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: Pool | undefined;
  };

  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool(poolConfig);
  }
  pool = globalForPrisma.pool;
  adapter = new PrismaPg(pool);

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: ["error", "warn"],
    });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma, pool };

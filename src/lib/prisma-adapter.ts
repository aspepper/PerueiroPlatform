import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

type GlobalForPrismaAdapter = typeof globalThis & {
  prismaPgPool?: Pool;
};

const globalForPrismaAdapter = globalThis as GlobalForPrismaAdapter;

const getPool = () => {
  if (!globalForPrismaAdapter.prismaPgPool) {
    globalForPrismaAdapter.prismaPgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  return globalForPrismaAdapter.prismaPgPool;
};

export const createPrismaAdapter = () => new PrismaPg(getPool());

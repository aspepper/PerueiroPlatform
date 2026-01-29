// prisma.config.ts
import path from "node:path";
import "dotenv/config"; // <- se você dependia do auto-load do .env, faça isso
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // onde está seu schema (arquivo único ou pasta com múltiplos .prisma)
  schema: path.join("prisma", "schema.prisma"),

  // opcional: personalize onde ficam as migrations e como rodar o seed
  migrations: {
    path: path.join("prisma", "migrations"),
    // se você rodava seed via package.json, traga para cá:
    // ex.: "tsx prisma/seed.ts" ou "node --import=tsx prisma/seed.ts"
    // seed: "tsx prisma/seed.ts",
  },
  adapter: async () =>
    new PrismaPg(
      new Pool({
        connectionString: process.env.DATABASE_URL,
      }),
    ),

  // opcional: se usa views (db) ou typedSql (preview), pode configurar:
  // views: { path: path.join("db", "views") },
  // typedSql: { path: path.join("db", "queries") },
});

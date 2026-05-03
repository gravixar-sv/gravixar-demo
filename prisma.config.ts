// Prisma 7 config, connection URL + migrations path live here, not in
// schema.prisma. Loaded by `prisma generate`, `prisma db push`, and
// every other prisma CLI command.

import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local first (Vercel-pulled vars), then fall back to .env.
// `vercel env pull` writes .env.local; .env stays optional.
dotenv.config({ path: [".env.local", ".env"] });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
});

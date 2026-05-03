// Prisma 7 config — connection URL + migrations path live here, not in
// schema.prisma. Loaded by `prisma generate`, `prisma db push`, and
// every other prisma CLI command.

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
});

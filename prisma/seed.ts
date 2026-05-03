// Demo seed — calls the shared wipeAndReseedDemo() so the data stays
// in lockstep with the cron-based weekly reset.
//
// Run via `pnpm db:seed`. Idempotent — safe to run repeatedly.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { wipeAndReseedDemo } from "../src/lib/demo/reset-data.js";

const adapter = new PrismaPg({
  connectionString: (process.env.DATABASE_URL ?? "").replace(
    "?pgbouncer=true",
    "",
  ),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Wiping + reseeding demo data…");
  const counts = await wipeAndReseedDemo(prisma);
  console.log(
    `✓ Seed complete: ${counts.users} users · ${counts.projects} projects · ${counts.tasks} tasks · ${counts.inquiries} inquiry · ${counts.leaveRequests} leave · ${counts.expenses} expenses`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

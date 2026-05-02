// Vercel project configuration for demo.gravixar.com.
// Weekly reset cron resets the seed back to canonical state.

import { type VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  buildCommand: "pnpm build",
  installCommand: "pnpm install --frozen-lockfile",
  crons: [
    // Weekly reset — Sunday 03:00 UTC. Wipes demo data, re-runs the seed.
    { path: "/api/cron/reset-demo", schedule: "0 3 * * 0" },
  ],
};

export default config;

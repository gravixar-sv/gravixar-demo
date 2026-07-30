// Vercel project configuration for demo.gravixar.com.
//
// No crons. The weekly Sunday 03:00 UTC reset was retired: every scene
// is local component state that never touches the database, so the job
// was wiping and reseeding rows no rendered surface reads. The route
// (/api/cron/reset-demo) and the seed are kept as the manual path for
// the inert auth/db scaffolding; nothing calls them on a schedule.

import { type VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  buildCommand: "pnpm build",
  installCommand: "pnpm install --frozen-lockfile",
};

export default config;

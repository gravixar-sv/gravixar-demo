// Vercel project configuration for demo.gravixar.com.
//
// The site is a Vite build prerendered to one HTML file per route
// (scripts/prerender.mjs), served as static files. There is no server:
// every scene is local component state that never leaves the tab, so
// there are no functions, no crons and no database.
//
// cleanUrls serves dist/lattice.html at /lattice (and 308s the .html
// form). Unknown paths get dist/404.html with a real 404 status.

import { type VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "vite",
  buildCommand: "pnpm build",
  installCommand: "pnpm install --frozen-lockfile",
  outputDirectory: "dist",
  cleanUrls: true,
  trailingSlash: false,
  redirects: [
    // The 60-second tour was retired for the scene index; old links land home.
    { source: "/tour", destination: "/", permanent: true },
  ],
  headers: [
    {
      source: "/assets/(.*)",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    },
    {
      source: "/(.*)",
      headers: [
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        { key: "X-DNS-Prefetch-Control", value: "off" },
        // Literal, not built from a directive map: Vercel validates these
        // values without running the code that would compute them (a
        // computed CSP failed the deploy, "missing required property value").
        {
          key: "Content-Security-Policy",
          value:
            "default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; frame-src 'self'; connect-src 'self' https://vitals.vercel-insights.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
        },
        // The demo subdomain is for people, not search engines, so the
        // keyword weight stays on gravixar.com.
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
      ],
    },
  ],
};

export default config;

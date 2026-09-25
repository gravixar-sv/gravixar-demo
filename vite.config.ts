import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// One Vite app, prerendered per route. `pnpm build` runs three steps:
//   1. the client build (dist/, with a manifest so the prerender can
//      preload each page's own chunk),
//   2. an SSR build of src/entry-server.tsx (dist-ssr/),
//   3. scripts/prerender.mjs, which renders every route in src/routes.ts
//      to dist/<route>.html and removes dist-ssr/.
// The dev server is a plain SPA: every path gets index.html and
// entry-client renders the matching route.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    manifest: true,
    target: "es2022",
  },
  server: { port: 3400 },
  preview: { port: 3400 },
});

// Step 3 of `pnpm build`: render every route to static HTML.
//
// Reads the client build's dist/index.html as the template, renders each
// route in src/routes.tsx through the SSR bundle, and writes
// dist/<path>.html (dist/index.html for "/", dist/404.html for the
// not-found page). Vercel's cleanUrls serves dist/lattice.html at
// /lattice. Each page also gets a modulepreload for its own chunk, so
// the hydrate never waits on a second round trip to find its code.

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const ssr = resolve(root, "dist-ssr");

const template = readFileSync(resolve(dist, "index.html"), "utf8");
const manifest = JSON.parse(readFileSync(resolve(dist, ".vite/manifest.json"), "utf8"));
const { render, ROUTES, NOT_FOUND } = await import(pathToFileURL(resolve(ssr, "entry-server.js")).href);

/** The page chunk plus every static import it pulls in, deduped. */
function preloads(src) {
  const seen = new Set();
  const walk = (key) => {
    const entry = manifest[key];
    if (!entry || seen.has(entry.file)) return;
    seen.add(entry.file);
    for (const dep of entry.imports ?? []) walk(dep);
  };
  walk(src);
  return [...seen].map((f) => `<link rel="modulepreload" crossorigin href="/${f}" />`);
}

const outFile = (path) =>
  path === "/" ? "index.html" : path === "/404" ? "404.html" : `${path.slice(1)}.html`;

let count = 0;
for (const route of [...ROUTES, NOT_FOUND]) {
  const { html, head } = await render(route);
  const page = template
    .replace("<!--app-head-->", [head, ...preloads(route.src)].join("\n    "))
    .replace("<!--app-html-->", html);
  const file = resolve(dist, outFile(route.path));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page);
  count++;
}

rmSync(ssr, { recursive: true, force: true });
console.log(`prerendered ${count} pages into dist/`);

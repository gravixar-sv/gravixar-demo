// Gallery captures: one real headless-Chrome screenshot per live scene.
//
//   pnpm capture:scenes [baseUrl]      (default http://localhost:3400)
//
// For each scene it writes, into public/scenes/:
//   <slug>.png   1600x1000 CSS px at 1.5x (2400x1500). The social card,
//                and the file gravixar.com copies into its own
//                /public/scenes for its demo cards.
//   <slug>.webp  the same view at 1x, for this site's own scene cards.
// and public/scenes/geometry.json: the workspace frame and each pane's
// box in CSS px of the 1600x1000 view, so gravixar.com's crop boxes
// (src/lib/demos.ts there) can be set from measurements, not by eye.
//
// The page gets real wall-clock time before the shot, so the CSS
// entrance has finished and the fonts have swapped in.

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import puppeteer from "puppeteer-core";

const base = (process.argv[2] ?? "http://localhost:3400").replace(/\/$/, "");
const executablePath = process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const SLUGS = ["lattice", "studio-mix", "cockpit", "northbeam", "care-ledger"];
// A scene whose resting state is an idle panel is staged first, so the
// picture shows work: the first button whose text matches is clicked and
// the page gets time to settle.
const STAGE = { "studio-mix": "run" };
const W = 1600;
const H = 1000;

const out = resolve(import.meta.dirname, "../public/scenes");
mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({ executablePath, headless: true });
const geometry = { viewport: { w: W, h: H }, scenes: {} };
try {
  for (const slug of SLUGS) {
    for (const scale of [1.5, 1]) {
      const page = await browser.newPage();
      await page.setViewport({ width: W, height: H, deviceScaleFactor: scale });
      await page.goto(`${base}/${slug}`, { waitUntil: "networkidle2", timeout: 60_000 });
      await page.evaluate(() => document.fonts.ready);
      await sleep(2200);
      if (STAGE[slug]) {
        await page.evaluate((label) => {
          const btn = [...document.querySelectorAll("button")].find((b) =>
            b.textContent.replace(/\s+/g, " ").trim().toLowerCase().includes(label),
          );
          btn?.click();
        }, STAGE[slug]);
        await sleep(2600);
        await page.evaluate(() => window.scrollTo(0, 0));
        await sleep(300);
      }
      if (scale === 1.5) {
        await page.screenshot({ path: resolve(out, `${slug}.png`) });
        geometry.scenes[slug] = await page.evaluate(() => {
          const box = (el) => {
            const r = el.getBoundingClientRect();
            return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
          };
          const frame = document.querySelector('section.frame[aria-label$="workspace"]');
          if (!frame) return null;
          const panes = [...frame.querySelectorAll(":scope > div > section")].map(box);
          return { frame: box(frame), panes };
        });
      } else {
        await page.screenshot({ path: resolve(out, `${slug}.webp`), type: "webp", quality: 84 });
      }
      await page.close();
    }
    console.log(`captured ${slug}`);
  }
} finally {
  await browser.close();
}
writeFileSync(resolve(out, "geometry.json"), JSON.stringify(geometry, null, 2) + "\n");
console.log("wrote public/scenes/geometry.json");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

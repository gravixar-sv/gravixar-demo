// Page capture via real headless Chrome (puppeteer-core + the system
// Chrome install). Unlike `chrome --headless --screenshot`, this gives
// the page real wall-clock time, real rAF, and a scroll walk, so
// viewport reveals, GSAP scroll state, and the WebGL field all render
// the way a visitor sees them.
//
//   node scripts/capture.mjs [url] [outPrefix] [width] [height]
//   pnpm capture                  -> captures localhost:3400 desktop
//   pnpm capture -- http://localhost:3400/lattice shots/lattice 390 844
//
// For the index it also captures each landmark section. For other
// pages it captures the top viewport only.

import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer-core";

const [
  ,
  ,
  url = "http://localhost:3400/",
  prefix = "shots/page",
  w = "1440",
  h = "900",
] = process.argv;

const executablePath =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const outPrefix = resolve(prefix);
mkdirSync(dirname(outPrefix), { recursive: true });

const browser = await puppeteer.launch({ executablePath, headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: Number(w), height: Number(h) });
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60_000 });
  await sleep(1400);

  // Walk the page so IntersectionObserver reveals fire everywhere.
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.7);
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y <= max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 160));
    }
    window.scrollTo(0, 0);
  });
  await sleep(900);

  const spots = await page.evaluate(() => {
    const out = [["hero", 0]];
    for (const [name, sel] of [
      ["loop", "#loop"],
      ["scenes", "#scenes"],
      ["proof", "section[aria-labelledby='proof-heading']"],
    ]) {
      const el = document.querySelector(sel);
      if (el)
        out.push([
          name,
          Math.max(0, el.getBoundingClientRect().top + window.scrollY - 56),
        ]);
    }
    return out;
  });

  for (const [name, y] of spots) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(1000);
    const path = `${outPrefix}-${name}.png`;
    await page.screenshot({ path });
    console.log(`captured ${path}`);
  }
} finally {
  await browser.close();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

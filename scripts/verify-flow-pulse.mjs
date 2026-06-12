// Spot-check the cascade flow pulse: click a loop action in each scene
// and assert the transient orb element actually enters the DOM (fixed
// position, scene accent). Run against a real Chrome so GSAP ticks.

import puppeteer from "puppeteer-core";

const base = process.argv[2] ?? "http://localhost:3401";
const executablePath =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const CASES = [
  { scene: "lattice", includes: "approve", excludes: "send to client" },
  { scene: "cockpit", includes: "add to today" },
  { scene: "studio-mix", includes: "run" },
  { scene: "northbeam", includes: "generate on-brand" },
];

const browser = await puppeteer.launch({ executablePath, headless: true });
const results = [];
try {
  for (const c of CASES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1400 });
    await page.goto(`${base}/${c.scene}`, { waitUntil: "networkidle2" });
    await sleep(1000);

    const flew = await page.evaluate(async (s) => {
      const norm = (b) => b.textContent.replace(/\s+/g, " ").trim().toLowerCase();
      const btn = [...document.querySelectorAll("button")].find(
        (b) =>
          norm(b).includes(s.includes) &&
          (!s.excludes || !norm(b).includes(s.excludes)),
      );
      if (!btn) return "no-button";
      btn.click();
      // The orb is appended to <body> for the flight (~0.9s total).
      for (let i = 0; i < 10; i += 1) {
        await new Promise((r) => setTimeout(r, 60));
        const orb = [...document.body.children].find(
          (el) =>
            el.tagName === "DIV" &&
            el.style.position === "fixed" &&
            el.style.borderRadius === "50%",
        );
        if (orb) return "flew";
      }
      return "no-orb";
    }, c);

    results.push({ scene: c.scene, flew });
    await page.close();
  }
} finally {
  await browser.close();
}

console.table(results);
if (results.some((r) => r.flew !== "flew")) {
  console.error("flow pulse missing in some scenes");
  process.exit(1);
}
console.log("flow pulse flew in all 4 scenes");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

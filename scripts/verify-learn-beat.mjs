// One-shot functional probe for the learn-beat: open each scene in
// real headless Chrome, fire its approval action, and assert a fresh
// learned rule lands in the strip. Exercises the cherry-picked
// reducers through the real UI, not in isolation.

import puppeteer from "puppeteer-core";

const base = process.argv[2] ?? "http://localhost:3401";
const executablePath =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

// Each case is a click sequence through the scene's approve path.
// `includes`/`excludes` match against normalized button text.
const CASES = [
  {
    scene: "lattice",
    clicks: [{ includes: "approve", excludes: "send to client" }],
  },
  {
    scene: "cockpit",
    clicks: [{ includes: "approve" }],
  },
  {
    scene: "studio-mix",
    clicks: [{ includes: "run" }, { includes: "approve" }],
  },
  {
    scene: "northbeam",
    clicks: [{ includes: "generate on-brand" }, { includes: "approve" }],
  },
];

const browser = await puppeteer.launch({ executablePath, headless: true });
const results = [];
try {
  for (const c of CASES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1400 });
    await page.goto(`${base}/${c.scene}`, { waitUntil: "networkidle2" });
    await sleep(1200);

    const before = await countLearned(page);
    let clicked = true;
    for (const step of c.clicks) {
      const hit = await clickByText(page, step);
      clicked = clicked && hit;
      await sleep(900);
    }
    const after = await countLearned(page);
    results.push({ scene: c.scene, clicked, before, after, grew: after > before });
    await page.close();
  }
} finally {
  await browser.close();
}

console.table(results);
const failures = results.filter((r) => !r.grew);
if (failures.length > 0) {
  console.error("learn-beat did not grow in:", failures.map((f) => f.scene).join(", "));
  process.exit(1);
}
console.log("learn-beat grew in all 4 scenes");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function clickByText(page, step) {
  return page.evaluate((s) => {
    const norm = (b) => b.textContent.replace(/\s+/g, " ").trim().toLowerCase();
    const btn = [...document.querySelectorAll("button")].find(
      (b) =>
        norm(b).includes(s.includes) &&
        (!s.excludes || !norm(b).includes(s.excludes)),
    );
    if (!btn) return false;
    btn.click();
    return true;
  }, step);
}

async function countLearned(page) {
  return page.evaluate(() => {
    const text = document.body.innerText.toLowerCase();
    const m = text.match(/(\d+)\s+learned from \w+/);
    return m ? Number(m[1]) : 0;
  });
}

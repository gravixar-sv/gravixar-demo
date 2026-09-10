// One-shot functional probe for the outcome tiles: open each scene in
// real headless Chrome, run the visitor's own loop, and assert the
// tiles that loop can move DID move, that the ones it cannot move held
// still, and that reset rewound them. A screenshot of a number is not
// proof it changed, so this reads each tile before and after.
//
// Sibling of verify-learn-beat.mjs. Same shape, same headless surface:
// the in-app preview browser skips View Transitions, so a scene has to
// be driven somewhere that actually runs them.

import puppeteer from "puppeteer-core";

const base = process.argv[2] ?? "http://localhost:3400";
const executablePath =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const CASES = [
  {
    scene: "lattice",
    steps: [{ click: "approve", not: "send to client" }],
    expect: { "deliverables approved": ["1,284", "1,285"] },
    static: { "invoices issued": "£412k", "leave & WFH requests": "318" },
  },
  {
    scene: "cockpit",
    steps: [
      { click: "add to today" },
      { click: "chase it" },
      { click: "approve & send" },
      { click: "approve & send" },
    ],
    expect: {
      "emails triaged": ["312", "313"],
      "drafts approved": ["47", "49"],
      "invoices chased & paid": ["£18.6k", "£20.1k"],
    },
    static: { "transactions categorised": "1,940" },
  },
  {
    scene: "studio-mix",
    steps: [{ click: "run" }, { click: "run again" }],
    expect: { "drafts generated": ["9,640", "9,642"] },
    static: { "auto-publishes": "0", "approved as-is": "94%" },
  },
  {
    scene: "northbeam",
    steps: [
      { click: "generate on-brand" },
      { click: "approve & publish" },
      { click: "generate (watch the guardrail)" },
    ],
    expect: {
      "assets drafted on-brand": ["2,460", "2,461"],
      "brand rules learned": ["94", "95"],
      "off-brand requests blocked": ["187", "188"],
    },
    static: { "published assets gated": "100%" },
  },
  {
    scene: "care-ledger",
    steps: [{ click: "approve & submit" }, { click: "verify & credential" }],
    expect: {
      "claims collected": ["$612k", "$696.2k"],
      "providers credentialed": ["1,420", "1,421"],
    },
    static: { "PHI records stored": "0" },
  },
];

const browser = await puppeteer.launch({ executablePath, headless: true });
const rows = [];
let failed = 0;

try {
  for (const c of CASES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1600 });
    await page.goto(`${base}/${c.scene}`, { waitUntil: "networkidle2" });
    await sleep(1400); // let the first-paint count-up settle

    const before = await tiles(page);
    const clicked = [];
    for (const s of c.steps) {
      clicked.push(`${s.click}:${(await clickByText(page, s)) ? "ok" : "MISS"}`);
      await sleep(900);
    }
    const after = await tiles(page);

    // reset, then confirm the tiles rewind to the baseline
    await clickByText(page, { click: "reset" });
    await sleep(900);
    const reset = await tiles(page);

    for (const [label, [from, to]] of Object.entries(c.expect)) {
      check(c.scene, `${label} start`, before[label], from);
      check(c.scene, `${label} after clicks`, after[label], to);
      check(c.scene, `${label} after reset`, reset[label], from);
    }
    for (const [label, value] of Object.entries(c.static ?? {})) {
      check(c.scene, `${label} held still`, after[label], value);
    }
    rows.push({ scene: c.scene, clicks: clicked.join(" ") });
    await page.close();
  }
} finally {
  await browser.close();
}

console.table(rows);
if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("\nevery outcome tile moved with its own click, and rewound on reset");

function check(scene, what, got, want) {
  const ok = got === want;
  if (!ok) failed += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${scene.padEnd(12)} ${what.padEnd(38)} ${
      ok ? got : `got ${JSON.stringify(got)}, wanted ${JSON.stringify(want)}`
    }`,
  );
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** { label: rendered value } for the outcome panel's tiles. */
async function tiles(page) {
  return page.evaluate(() => {
    const panel = document.querySelector('section[aria-labelledby="outcome-heading"]');
    if (!panel) return {};
    const out = {};
    for (const cell of panel.querySelectorAll("dl > div")) {
      const label = cell.querySelector("dt")?.textContent?.trim();
      const value = cell.querySelector("dd")?.textContent?.trim();
      if (label) out[label] = value;
    }
    return out;
  });
}

async function clickByText(page, step) {
  return page.evaluate((s) => {
    const norm = (b) => b.textContent.replace(/\s+/g, " ").trim().toLowerCase();
    const btn = [...document.querySelectorAll("button")].find(
      (b) => norm(b).includes(s.click) && (!s.not || !norm(b).includes(s.not)),
    );
    if (!btn) return false;
    btn.click();
    return true;
  }, step);
}

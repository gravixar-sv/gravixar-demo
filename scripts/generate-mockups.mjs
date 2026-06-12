// Generate the AI attachment artwork for Lattice + Northbeam via fal.
// Blocked on account balance as of 2026-06-12 ("Exhausted balance") —
// top up at fal.ai/dashboard/billing, then:
//
//   $env:FAL_KEY = "<key>"   # or set FAL_KEY in .env.local
//   node scripts/generate-mockups.mjs
//
// Writes public/mockups/<brand>-<kind>.webp (~$0.08/image, 6 images).
// Integration after generation: in DeliverableMockup.tsx, swap <Art/>
// for <Image src={`/mockups/${brand}-${kind}.webp`} .../> per the
// component's own header note.

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("Set FAL_KEY first (fal.ai dashboard > keys).");
  process.exit(1);
}

const MODEL = "fal-ai/nano-banana-2";
const OUT = resolve("public/mockups");
mkdirSync(OUT, { recursive: true });

const LATTICE_STYLE =
  "Flat UI design mockup, premium editorial agency aesthetic, deep navy background #0c0e1a, coral accent #FF6B6B, cream #F5E6D3, elegant serif display type, generous whitespace, no photograph, pure interface design.";
const NORTHBEAM_STYLE =
  "Flat marketing design mockup for a handmade home-goods DTC brand, deep green-black background #10160c, sage green accent #9DBE6E, cream #F2DDC1, warm modern serif type, calm and premium, no photograph.";

const JOBS = [
  ["lattice-web", "16:9", `Website homepage hero section for creative agency LATTICE. Large serif headline "Make it unmistakable." with coral pill button "Start a project", floating cream product card on the right. ${LATTICE_STYLE}`],
  ["lattice-social", "1:1", `Instagram launch carousel slide 01 for agency LATTICE. Serif headline "New season, new look.", small mono label "LAUNCH 01", magenta accent line. ${LATTICE_STYLE}`],
  ["lattice-email", "16:9", `Welcome email header banner for agency LATTICE. Serif headline "Welcome aboard.", subline about week one, coral "Get started" button. ${LATTICE_STYLE}`],
  ["northbeam-web", "16:9", `Landing page bundle module for DTC brand NORTHBEAM. Serif headline "Bundle up.", subline "Three favourites, one box.", sage "Shop the set" button, cream product card right. ${NORTHBEAM_STYLE}`],
  ["northbeam-social", "1:1", `Instagram post for DTC brand NORTHBEAM spring collection. Serif headline "The spring drop is here.", small caps wordmark NORTHBEAM, sage accent underline. ${NORTHBEAM_STYLE}`],
  ["northbeam-email", "16:9", `Monthly newsletter header for DTC brand NORTHBEAM. Serif headline "May, in objects.", subline "What we made, mended, and shipped.", sage "Read on" button. ${NORTHBEAM_STYLE}`],
];

for (const [name, aspect, prompt] of JOBS) {
  process.stdout.write(`generating ${name} ... `);
  const res = await fetch(`https://fal.run/${MODEL}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: aspect,
      num_images: 1,
      output_format: "webp",
    }),
  });
  if (!res.ok) {
    console.error(`FAILED (${res.status}): ${await res.text()}`);
    process.exit(1);
  }
  const data = await res.json();
  const url = data.images?.[0]?.url;
  if (!url) {
    console.error(`no image URL in response: ${JSON.stringify(data).slice(0, 300)}`);
    process.exit(1);
  }
  const img = await fetch(url);
  writeFileSync(`${OUT}/${name}.webp`, Buffer.from(await img.arrayBuffer()));
  console.log("ok");
}
console.log(`done -> ${OUT}`);

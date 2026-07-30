# AGENTS.md, gravixar-demo

Conventions and context for Claude (or any AI agent) working on this
repo. Read this first when starting a new session, then check the brain
at `C:\dev\gravixar-hq\brain\projects\gravixar-demo.md` for current
state. The brain is canonical; this file is conventions only.

## What this repo is

`gravixar-demo` is **demo.gravixar.com**. Five working apps with sample
data, one per buyer. Each is a cascading multi-column playground: AI
drafts, a human approves, the agent learns a rule, the audit trail
records it. The marketing site at gravixar.com links here as proof.

Live at **https://demo.gravixar.com**. No coming-soon gate.

## The thing that trips up every session

**There is no sign-in, and there is no persona switcher.**

Every scene is stateless client state: a `useReducer` over fixtures in
`src/lib/playground/`, nothing reaching a server. No login, no identity
fork, no session, no persona pages. Reload and the scene restarts.

Older docs, older marketing copy, and the git history all describe a
"demo-bypass persona switcher" with Mira / Kai / Nox / Sage logins. That
was removed in PR #14 (2026-05-29). **Nox does not exist as a persona at
all.** If you are about to write copy, a comment, or a doc that mentions
persona login, stop.

Prisma, `src/lib/auth.ts`, `src/lib/db.ts` and `/api/auth/[...nextauth]`
are kept but **inert**: no rendered surface reads the database. There
are no crons (the weekly reset was retired 2026-07-30 because it
reseeded rows nothing renders).

## Stack

- Next.js 16 App Router, React 19, TypeScript strict
- Tailwind CSS v4
- Hubot Sans (display) + Mona Sans (body), self-hosted via
  `@fontsource-variable`, matching the marketing site. Geist Mono stays
  as `--font-mono`. **Not Geist Sans** (swapped out in PR #22).
- Prisma 7 + Neon Postgres, single-file schema at `prisma/schema.prisma`
- Three.js in exactly one component (`components/home/GateField.tsx`)
- Hosting: Vercel, auto-deploy from `main`

## Local dev

```powershell
cd "C:\dev\gravixar-demo"
pnpm install
pnpm dev
```

Port **3400** (marketing 3300, bs-hub 3000). Never background the dev
server.

Gate before any PR: `pnpm typecheck` **and** `pnpm build`. `pnpm lint`
calls the Next-16-removed `next lint`; run `npx eslint .` instead.
`pnpm capture` refreshes `public/scenes/*.png` with real headless-Chrome
captures. `pnpm verify:learn-beat` asserts all 5 scenes learn on approve.

## Scenes

All five live. Slugs are a **published contract** mirrored in
`gravixar-marketing/src/lib/demos.ts` and linked from gravixar.com.
Changing a slug, name, codename, personaLabel, openLabel, whatItIs or
tryLine on one side without the other is a break.

| Scene | Slug | Codename | Buyer |
|---|---|---|---|
| Agency OS | `/lattice` | Lattice | agencies |
| Agent Console | `/studio-mix` | Studio Mix | ops & technical teams |
| Founder Cockpit | `/cockpit` | Driftwood | founders & small teams |
| Brand Guardian | `/northbeam` | Northbeam | brands & DTC |
| Billing & Credentialing | `/care-ledger` | Care Ledger | healthcare & billing |

Plus `/modules` (12 cards, 3 interactive widgets) and `/tour` (permanent
redirect to `/`, kept so old links resolve).

A scene enters `src/lib/scenes.ts` only when it is genuinely clickable.
Roadmap scenes live in the brain, never in the registry, because every
field on `Scene` exists to be rendered.

## Repo layout

```
src/
  app/
    layout.tsx                 # root: fonts, DemoBanner
    page.tsx                   # the index: Hero / LoopSection / SceneGallery / ProofStrip
    (scenes)/<slug>/           # one layout.tsx (chrome + scene CSS vars) + one page.tsx
    modules/[slug]/            # widget renderer
    api/auth/[...nextauth]/    # inert
    api/cron/reset-demo/       # inert, no schedule
  components/
    demo/                      # Topbar, DemoBanner, LearnBeat, OutcomePanel, SceneCTA, DeliverableMockup, Avatar
    home/                      # Hero, GateField, LoopSection, SceneGallery, ProofStrip
    modules/                   # ReviewStateMachine, DailyCheckin, AuditLogRestore
  lib/
    scenes.ts                  # scene registry (mirrored contract)
    modules.ts                 # 12 module manifest
    playground/*-data.ts       # per-scene reducers + fixtures
    useReveal.ts               # the reveal hook, see motion rules
    flowPulse.ts, gsap.ts      # transient cross-column cue
prisma/schema.prisma           # single file, inert
scripts/capture.mjs            # pnpm capture
```

## Conventions

### Copy

- **No em-dashes.** Anywhere, in copy or in comments you touch. Use a
  comma or a period.
- **First person "I", never "we".** One person's work. Fictional
  personas inside sample data may say "we"; Gravixar's own voice may
  not.
- Keep the honesty labels: "illustrative sample data", "Sample numbers
  for the sandbox, not a real company's metrics", "No PHI in the
  portal". Propagate, do not trim.
- Every promise must resolve. If copy names a button, that button must
  exist with that label.

### Visual identity

- Dark only. No light theme, no toggle.
- `--color-mark` (`#ff1f2d`) is the logo mark and nothing else.
  Everything else reads `--color-scene-1` / `-2` / `-glow`, which each
  scene layout sets **inline on its root** via a `style` prop. There are
  no `.scene-<slug>` palette classes; do not add a `paletteClass` field
  back to `Scene`.
- Consume tokens through `.text-scene` / `.bg-scene` / `.border-scene` /
  `.ring-scene`, or `var(--color-scene-1)` directly. Never a raw
  Tailwind hue on a token-tinted surface.
- Contrast floors, measured against the real ground: zinc-400 = 7.9:1,
  zinc-500 = 4.2:1 (floor for anything informative), **zinc-600 = 2.63:1
  and is decoration only** (hairlines, separators). Type floor: 10px for
  meta, 11px for anything a visitor must read to act. The 8px/9px tiers
  are banned.
- Buttons: `inline-flex min-h-10 ... active:scale-[0.98] lg:min-h-0`.
  Tailwind 4's preflight ships `cursor: default` on buttons, so
  `globals.css` restores the pointer.
- Banned: gradient text, glassmorphism as a default surface, side-stripe
  accents, identical icon-plus-heading-plus-text card grids, nested
  cards, big-gradient-number hero metrics.
- A new accent hue or font family needs a brain decision entry first.

### Motion

- `transform` and `opacity` only. Never width, height, top, left,
  filter, or background-position on scroll.
- Reveals use `IntersectionObserver` via `src/lib/useReveal.ts`, never
  scroll listeners.
- **Base visibility must never depend on a JS ticker.** Elements hide in
  CSS, the observer adds `.is-in`, the compositor transitions, and a
  ~1400ms rescue timer force-shows anything near the viewport with
  `transition: none`. Reduced motion renders everything visible via CSS;
  `@media (scripting: none)` does too.
- When a transform *is* the content (the attachment-preview zoom is how
  you read the attachment), reduced motion drops the animation, not the
  content.
- Environment gotcha: the in-app preview browser **never advances CSS
  transitions**, which pins transitioned properties at their start value
  and makes computed-style checks read as broken. Verify transforms with
  the transition suppressed.

### Shared primitives

UI repeated across scenes lives in one component, not five copies:
`LearnBeat` (+ `RuleRow`), `OutcomePanel`, `DeliverableMockup`,
`formatRelative`. Scene-specific variation goes through props. On record
exception: Brand Guardian keeps an inline rule column, because its rules
*are* a column and `BrandRule.learned` does not satisfy `LearnedRule`.

### Section order

Every scene renders `grid -> LearnBeat -> OutcomePanel -> feed/audit ->
SceneCTA`. Scene-specific extras attach after the receipts and before
the CTA. Exceptions on record: Brand Guardian's rules are a column, and
Agent Console's feed is a column.

### Accessibility

Eyebrows are `<h2>` with `aria-labelledby` on their section, so no page
jumps h1 to h3. Live regions go on the **stable wrapper**, not on the
swapped-in content (a region that mounts with its content often is not
announced). Focus moves to the resolved state rather than falling to
`<body>`. `<dl>` puts `<dt>` before `<dd>`.

### Branches

`feat/DDMMYY-HHMM-demo`, or `fix/` / `chore/`. One PR per concern,
squash-merge. Git identity is not set in this repo, so commit with
`git -c user.name=Qamar -c user.email=gravixar@gmail.com commit ...`.

## Sister repos

- `C:\dev\gravixar-marketing` (gravixar.com, port 3300), mirrors the
  scene catalog. Treat the two repos as one contract surface.
- `C:\dev\bs-hub` is **recipe, not parent.** Patterns are copied in as
  fresh code. Never import from it, never share its database.

## Project state

Canonical state is the brain at
`C:\dev\gravixar-hq\brain\projects\gravixar-demo.md`. Per-repo
`STATE.md` files are retired; do not create one.

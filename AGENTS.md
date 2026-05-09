# AGENTS.md, gravixar-demo

Conventions and context for Claude (or any AI agent) working on this
repo. Read this first when starting a new session.

## What this repo is

`gravixar-demo` is **demo.gravixar.com** — a multi-scene showroom of
the systems Qamar can build. NOT a Broomstick clone; completely
separate brand, separate fictional personas, separate visual identity.
The marketing site at gravixar.com links here as proof.

Live at: **https://demo.gravixar.com**

## Stack

- Next.js 16 App Router + React 19 + TypeScript strict
- Tailwind CSS v4
- Prisma 7 + Neon Postgres (multi-file schema, via Vercel Marketplace)
- NextAuth v5 (JWT, demo-bypass persona switcher — no real passwords)
- Anthropic Claude via Vercel AI Gateway (Studio Mix scene only)
- Hosting: Vercel Functions (Fluid Compute)

## Local dev

```powershell
cd "C:\dev\gravixar-demo"
pnpm install
pnpm dev
```

Open http://localhost:3400 (port pinned to avoid marketing on 3300
and bs-hub on 3000).

## Scenes (current state, post-PR-#1 merge)

| Scene | Slug | Status | What it shows |
|---|---|---|---|
| Lattice Studio | `/lattice` | live | Agency client portal, 4 personas (Mira/Kai/Nox/Sage), closed loops + reset button + try-this hints |
| Studio Mix | `/studio-mix` | live, partly mocked | AI agents (ECHO/PULSE/RIVER/ATLAS) — operator console |
| Modules | `/modules` | live | 12 module cards: 3 interactive widgets (review state machine, daily check-in, audit log + restore), 9 coming-soon |
| Northbeam Goods | `/northbeam` | placeholder | DTC brand admin (planned) |
| Verus Partners | `/verus` | placeholder | Professional services intake (planned) |

## Repo layout

```
src/
  app/
    layout.tsx                 # root: Geist fonts, demo banner, scene routing
    page.tsx                   # gallery landing
    (auth)/                    # demo-bypass login (no real passwords)
    (scenes)/
      lattice/                 # 4 persona pages (page, dashboard, tasks, inbox, admin)
      studio-mix/              # AI agents playground
    modules/                   # /modules surface peer to scenes
      [slug]/                  # detail page with widget renderer
    api/
      agents/{atlas,echo,pulse,river}/  # AI agent endpoints (Studio Mix)
      auth/[...nextauth]/      # NextAuth handler
      cron/reset-demo/         # weekly Sunday reset
      persona/[id]/            # POST: switch persona, set JWT cookie
  components/
    demo/                      # Topbar, DemoBanner, GlassPanel, WindowChrome, ResetButton, TryNext
    scenes/                    # scene-specific components
    modules/                   # 3 interactive widgets so far
  lib/
    db.ts                      # Prisma singleton
    auth.ts                    # NextAuth config + demo bypass
    actions/lattice.ts         # server actions (resetSceneAction, approveTask, etc.)
    queries/lattice.ts         # data readers for Lattice scene
    personas/lattice.ts        # 4 personas + lookup helpers
    scenes.ts                  # scene registry
    modules.ts                 # 12 module manifest
    demo/                      # demo-mode session helpers
prisma/
  schema/                      # multi-file schema (identity, audit, projects, etc.)
  seed.ts                      # canonical seed for resets
public/
```

## Conventions

### Visual identity

- **Geist Sans + Geist Mono** (matches marketing site as of 2026-05-05)
- Per-scene CSS variables override the theme defaults. Tailwind
  utilities like `text-scene` / `bg-scene` read from these
- `.glass`, `.glass-strong`, `.bg-lattice`, `.bg-studio-mix`,
  `.bg-gallery`, `.scene-card` utilities defined in `globals.css`
- Window-chrome traffic-light dots (`.window-dots`) are kept for
  Studio Mix's operator console only; Lattice scene removed them
  per design feedback (felt overdesigned for client portal)
- Scene cards: `.scene-card` utility (matches marketing site's
  `.card-surface` shape so the visual language reads as one family)

### Closed-loop discipline (Lattice scene)

Each persona has ONE closed-loop action available. Visitors do that
action, the activity ripples (audit row + state change), they switch
to the next persona to verify. Reset button on every page re-seeds.

| Persona | Action |
|---|---|
| Mira (client) | approve / request revision on a deliverable |
| Kai (PM) | send first reply on PM_ASSIGNED inquiry |
| Sage (designer) | submit DRAFT for client review |
| Nox (admin) | approve / reject leave request |

### `<TryNext>` callouts

Every persona page has a `<TryNext>` callout (`components/demo/TryNext.tsx`)
that tells visitors what to do and points at the next persona to
switch to. Don't ship a persona page without one.

### Demo-mode infrastructure

- `GRAVIXAR_DEMO_MODE=true` sitewide
- DemoBanner top of every page, not dismissable
- Side-effect stubs: no real Resend / Stripe / Drive
- Persona switcher: visitors click → POST /api/persona/[id] → JWT
  cookie set → redirect to scene
- Weekly reset cron: Sunday 03:00 UTC, runs `wipeAndReseedDemo()`

### Reset behavior

The current reset is **global** — clicking re-seeds the DB for
everyone. Documented limitation. Per-session sandboxes are a future
refactor (would need a `sessionId` column on every interactive table).

For widgets in `/modules/[slug]`: pure client-side React state, NO
DB. Each visitor gets fresh state on every page load. Per-session
isolation by default. This is the preferred shape for new sandbox
demos.

### Branch + commit conventions

- Feature branches: `feat/DDMMYY-HHMM-demo` (date+time stamp + repo
  tag — `demo` for this repo; `hq` and `mkt` for the sister repos so
  cross-repo branches stay distinguishable at a glance)
- Fixes: `fix/DDMMYY-HHMM-demo`. Chores: `chore/DDMMYY-HHMM-demo`.
- One PR per concern, squash-merge by default.
- See gravixar-ai's AGENTS.md for the full commit-message + Git
  identity conventions; they apply unchanged here.

## Sister project relationship

bs-hub at `C:\Users\zaigu\OneDrive\Desktop\Google Antigravity\bs-hub`
is **recipe, not parent**. Patterns (auth shape, audit log writer,
review state machine, AI guardrail wrapper) are selectively copied
into this repo as fresh code. **Never import from bs-hub or share
code/DB with broomstickhub.com.**

## Key memory references

User memory lives in
`C:\Users\zaigu\.claude\projects\C--dev-gravixar-ai\memory\` (note:
this directory is keyed off the `gravixar-ai` workspace path but
applies to demo work too):

- `project_gravixar_demo.md` — demo project context
- `project_gravixar_locked_decisions.md` — pre-decided choices
- `feedback_no_background_dev_server.md` — don't run `next dev` in bg

Internal planning docs (specs, scene catalog, roadmaps) live outside
this repo at `C:\dev\gravixar-notes\`, not committed. Ask the user
for the specific doc you need if it's relevant to the task.

## Database access

Schema is multi-file (`prisma/schema/*.prisma`). Push changes:

```powershell
pnpm db:push
pnpm seed         # idempotent superadmin + demo data
```

Every reset re-runs the seed. Don't add data outside the seed unless
it's part of a flow visitors trigger themselves.

## When deploying

- Vercel auto-deploys on every push to `main`
- demo.gravixar.com is the production URL (Vercel custom domain)
- Don't touch DNS settings; managed at gravixar-marketing project's
  domain config (the same Vercel team owns both, nameservers point
  to Vercel)

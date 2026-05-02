# gravixar-demo

`demo.gravixar.com` — design + capability showroom.

A Gravixar-branded multi-scene demo site. Visitors pick a scene from the gallery and explore an interactive showcase of a kind of system Qamar can build. **Not a Broomstick clone** — completely separate brand, separate fictional personas, separate visual identity, separate database.

## Stack

- Next.js 16 App Router · React 19 · TypeScript strict
- Tailwind CSS v4
- Prisma 7 + Neon Postgres (via Vercel Marketplace)
- NextAuth v5 (JWT, demo-bypass persona switcher)
- AI SDK v6 via Vercel AI Gateway

## Local dev

Prerequisites: Node 20+, pnpm 9+. Demo runs on **port 3400** (avoids collision with marketing on 3300).

```powershell
cd "C:\dev\gravixar-demo"
pnpm install
pnpm dev
```

Open http://localhost:3400 — or http://demo.localhost:3400 for a labeled tab.

## Scenes

See [DEMO-SCENES.md](DEMO-SCENES.md) for the full catalog. MVP launches with two scenes:

- **Lattice Studio** — agency client portal. Login as Mira Voss (client), Kai Render (PM), Nox Bellini (admin), or Sage Holloway (designer).
- **Studio Mix** — AI agents playground. No login — operator-style sandbox showing live SEO drafter, anomaly cron, suspicion classifier, content review queue.

Coming next: **Northbeam Goods** (DTC brand admin), **Verus Partners** (professional services intake).

## Demo-mode infrastructure

`GRAVIXAR_DEMO_MODE=true` is hard-on in this app. The infrastructure layer:

- Sitewide banner ("Demo mode — sandbox, resets weekly")
- Persona-switcher login bypass (visitors click a card, no password needed)
- Side-effect stubs (no real Resend, no Stripe, no Drive)
- Weekly reset cron: `/api/cron/reset-demo` runs Sunday 03:00 UTC, wipes the DB and re-runs `prisma/seed.ts`

## Codebase relationship to bs-hub

bs-hub at `C:\Users\zaigu\OneDrive\Desktop\Google Antigravity\bs-hub` is **recipe, not parent**. Patterns (auth shape, audit log writer, AI integrations, review state machine) are selectively copied into this codebase as fresh code. This app does not import bs-hub or share live code/DB with broomstickhub.com.

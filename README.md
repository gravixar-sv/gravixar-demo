# gravixar-demo

`demo.gravixar.com`, the public product showroom.

Five working apps with sample data. Each one is a cascading multi-column
playground: AI drafts the work, a human approves it, the agent learns a
rule from that approval, and every state change lands in an audit trail.
Visitors open a scene and run the loop themselves.

Not a Broomstick clone. Separate brand, separate fictional personas,
separate visual identity.

## Stack

- Next.js 16 App Router, React 19, TypeScript strict
- Tailwind CSS v4
- Hubot Sans (display) + Mona Sans (body), self-hosted via `@fontsource-variable`
- Prisma 7 + Neon Postgres, and NextAuth v5, both **inert** (see below)
- Three.js, one component only (the index hero's particle field)

## There is no sign-in

This is the single most important thing to know about the repo, because
it contradicts a lot of older writing about it.

**Every scene is stateless client state.** Each one owns a `useReducer`
over fixture data in `src/lib/playground/`, and nothing it does reaches a
server. There is no login, no persona switcher, no identity fork, no
session. Reload the page and the scene starts over. The footer says "no
sign-in" because that is literally true.

The Prisma schema, the seed, `src/lib/auth.ts`, `src/lib/db.ts` and
`/api/auth/[...nextauth]` are kept but **inert**: no rendered surface
reads the database. The `/api/cron/reset-demo` route and `prisma/seed.ts`
still work if invoked by hand, but no cron calls them (retired 2026-07-30,
because it was reseeding rows nothing renders).

## Scenes

All five are live. Slugs are a published contract, mirrored in the
marketing repo at `gravixar-marketing/src/lib/demos.ts` and linked from
gravixar.com. Do not change one without the other.

| Scene | Slug | Buyer | The loop |
|---|---|---|---|
| Agency OS (Lattice) | `/lattice` | agencies | Deliverable moves Editor to PM to Client and back. Approve, request a revision, or push it back. Also samples projects, invoicing, commissions, and leave. |
| Agent Console (Studio Mix) | `/studio-mix` | ops & technical teams | Run an agent on the Claude API. Read-only agents run alone; writers stop at a gate for Approve & publish or Discard. |
| Founder Cockpit (Driftwood) | `/cockpit` | founders & small teams | Inbox triage, today's priorities, and cash flow in one view. You approve every send. |
| Brand Guardian (Northbeam) | `/northbeam` | brands & DTC | Brief in, on-brand draft out. Off-brand requests stop at the guardrail. Every approval teaches a do or a don't. |
| Billing & Credentialing (Care Ledger) | `/care-ledger` | healthcare & billing | Credential a provider, approve a claim batch, close a clinic deal. No PHI in the portal, isolated by design. |

Each scene keeps its descriptive name as primary and its original
codename as a secondary tag. `/modules` is a peer surface: 12 module
cards, 3 of them interactive widgets.

`/tour` is a permanent redirect to `/` (the guided tour was retired in
May 2026). Keep it; the URL is still reachable from old links.

### Section order

Every scene renders the same rhythm below its column grid:

```
grid -> LearnBeat -> OutcomePanel -> feed/audit -> SceneCTA
```

Scene-specific extras attach after the receipts and before the CTA, so
the four shared beats always read in the same order. Two documented
exceptions: Brand Guardian's rules are a column rather than a below-grid
`LearnBeat`, and Agent Console's feed is a column rather than a
below-grid audit trail.

## Local dev

Prerequisites: Node 24, pnpm. Port **3400** (marketing runs on 3300).

```powershell
cd "C:\dev\gravixar-demo"
pnpm install
pnpm dev
```

Open http://localhost:3400.

| Script | What it does |
|---|---|
| `pnpm typecheck` | `tsc --noEmit`. This plus `pnpm build` is the gate. |
| `pnpm build` | Production build. |
| `pnpm capture` | Real headless-Chrome page captures with a scroll walk, into `public/scenes/`. Gives the page wall-clock time so viewport reveals and the WebGL field render the way a visitor sees them. |
| `pnpm verify:learn-beat` | Asserts all 5 scenes grow a rule on approval. |

`pnpm lint` calls `next lint`, which Next 16 removed. Run `npx eslint .`
instead.

## House rules

- **No em-dashes** anywhere in copy or in comments you touch. Commas or
  periods.
- **First person "I", never "we".** This is one person's work.
- **Dark mode only.** No light theme, no toggle.
- `--color-mark` (`#ff1f2d`) is the logo mark and nothing else.
  Everything else reads the scene-scoped `--color-scene-1` / `-2` /
  `-glow`, which each scene layout sets inline on its root.
- **Motion animates `transform` and `opacity` only.** Reveals use
  `IntersectionObserver` (`src/lib/useReveal.ts`), never scroll
  listeners. Base visibility must never depend on a JS ticker: elements
  hide in CSS, the observer adds `.is-in`, and a ~1400ms rescue timer
  force-shows anything near the viewport with `transition: none`.
  Reduced motion and `@media (scripting: none)` both render everything
  visible.
- **Honesty labels stay.** "illustrative sample data", "Sample numbers
  for the sandbox, not a real company's metrics", "No PHI in the
  portal". Propagate them rather than trimming them.
- A scene reaches `src/lib/scenes.ts` only once it is genuinely
  clickable. Roadmap scenes live in the brain, not in the registry.

Branches are `feat/DDMMYY-HHMM-demo` (or `fix/`, `chore/`), one PR per
concern, squash-merged.

## Relationship to bs-hub

bs-hub at `C:\dev\bs-hub` is **recipe, not parent**. Patterns (audit log
writer, review state machine, AI guardrail wrapper) are copied in as
fresh code. This app never imports from bs-hub and shares no database
with broomstickhub.com.

## Project state

Canonical state lives in the brain at
`C:\dev\gravixar-hq\brain\projects\gravixar-demo.md`, not in this repo.
There is deliberately no `STATE.md`.

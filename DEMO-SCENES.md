# DEMO-SCENES.md, gravixar-demo scene catalog

Each scene is a self-contained showcase: its own URL prefix, its own visual identity, its own personas, its own data model slice.

## Visual system (shared)

- **Type pairings**, each scene picks a display + body pair. Display fonts vary; body is **Inter** everywhere for consistency.
- **Layout grammar**, asymmetric editorial grids, generous whitespace, big typography moments
- **Treatment**, glassmorphic panels (`backdrop-blur-xl`, gradient fills), subtle window-chrome dots on key panels
- **Motion**, restrained: subtle hover scale, gradient drifts, content fade-in. Nothing distracting.
- **Demo banner**, sitewide, top of viewport, never dismissable

## Scene 1, `Lattice Studio` (live in MVP)

**URL prefix:** `/lattice`
**Tagline:** "A creative studio's client portal, built by Gravixar."
**Showcases:** Operations Infrastructure service.

### Visual

- Display font: **Fraunces** (variable serif, editorial magazine feel)
- Palette:
  - Background gradient: deep navy → warm violet → soft cream wash
  - Primary accent: electric coral `#FF6B6B`
  - Secondary: warm cream `#F5E6D3`
  - Surface: glass panels over the gradient
- Window-chrome: present on the dashboard's main panels (red/amber/green dots, top-left)

### Personas

| Name | Role | What they see |
|---|---|---|
| **Mira Voss** | Client | Project list, deliverable review queue, chat with PM |
| **Kai Render** | PM | Inbox of inquiries, scope builder, project workspace |
| **Nox Bellini** | Admin | All clients/projects, audit log, presence dashboard |
| **Sage Holloway** | Designer | Personal task list, deliverable upload |

### Data slice

- `projects` (3 seeded, one in active flow, one awaiting review, one shipped)
- `tasks` flowing through review state machine
- `inquiries` (1 in PM_ASSIGNED state for the funnel demo)
- `messages` (chat between Mira and Kai)

### Interactive flows visitors can run

1. Approve a deliverable as Mira → see notification appear in Kai's view
2. Move a task through the review state machine as Kai
3. Browse the audit log as Nox

---

## Scene 2, `Studio Mix` (live in MVP)

**URL prefix:** `/studio-mix`
**Tagline:** "Live AI agents, content, anomaly, classifier, review."
**Showcases:** AI Tooling service end-to-end.

### Visual

- Display font: **JetBrains Mono** (operator-console feel)
- Palette:
  - Background gradient: near-black → deep violet → indigo aurora
  - Primary accent: cyan `#00E1FF`
  - Secondary: magenta `#FF2D95`
  - Surface: dark glass panels with cyan/magenta edge glows
- Window-chrome: present on every agent's status card

### "Personas" (agents, no human login)

| Agent | Role | What it does live |
|---|---|---|
| **ECHO** | SEO drafter | Generates a blog draft on click, shows generation tokens streaming |
| **PULSE** | Anomaly cron | Sweeps a fake audit log for spikes, flags incidents |
| **RIVER** | Suspicion classifier | Takes a sample inbound, classifies it as legit/suspicious with reasoning |
| **ATLAS** | Content reviewer | Reviews a draft against a style guide, suggests edits |

### Interactive flows visitors can run

1. Click ECHO → "Draft a post on [topic]" → watch real Anthropic tokens stream in
2. Click PULSE → "Run anomaly scan" → see flagged events
3. Paste an inquiry into RIVER → see classification + reason
4. Drop a paragraph into ATLAS → see suggested edits

(In MVP, ECHO is fully wired through AI Gateway. PULSE/RIVER/ATLAS are partly mocked for launch and progressively wired up.)

---

## Scene 3, `Northbeam Goods` (placeholder in MVP)

**URL prefix:** `/northbeam` (gallery shows it as "coming online")
**Showcases:** Brand & Visuals service, DTC brand admin with Amazon A+ workflow, motion-graphics review, brand-system browser.

---

## Scene 4, `Verus Partners` (placeholder in MVP)

**URL prefix:** `/verus` (gallery shows it as "coming online")
**Showcases:** AI Tooling end-to-end for professional services, AI intake → brand brief → discovery booking flow with real auth.

---

## Adding a new scene

1. Add a row to `src/lib/scenes.ts`, slug, name, tagline, palette tokens, display font, gallery copy, status (`live` / `coming-online`)
2. Create `src/app/(scenes)/{slug}/layout.tsx` and pages
3. Create `src/components/scenes/{slug}/` for scene-specific components
4. Extend `prisma/schema.prisma` if the scene has its own data slice
5. Update `prisma/seed.ts` with seeded data for the scene
6. Add personas to `src/lib/personas/` if the scene has a login flow

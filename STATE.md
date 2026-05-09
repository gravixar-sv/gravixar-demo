# STATE — gravixar-demo

> Read first at session start. Updated on every PR.
>
> Last updated: 2026-05-09

## Live now

- `https://demo.gravixar.com` — **paused** behind a coming-soon page
  (PR #5 production middleware). Vercel preview deployments still serve
  the full app for internal review.
- Main at `2b4044b` (tag `v1.1-dashboard-shell`) — dashboard shell +
  reframed gallery merged (PR #6, "session 1/3" of the demo polish).

## Currently working on

- (nothing — demo work paused 2026-05-07 PM)

## Next session

- **Lattice playground session 2** — column polish, mini-banner ripples
  across columns, mobile stacked layout, "what is this?" topbar. Resumes
  open PR #7.
- **Or**: pivot decision (see Decisions log on master STATE.md, 2026-05-09)
  — Lattice will finish (sessions 2 + 3) then become one selectable combo
  in the new configurator landing. So: ship sessions 2-3 first, *then*
  build the configurator surface around it.

## Open PRs

- **PR #7** — `polish/playground-state-and-shell`, session 1 of the
  Lattice playground build. Build passes, ripples wired, no styling.
  ON ICE pending demo-resume decision.

## Recent merges (last 5)

- 2026-05-07: PR #6 — polish: dashboard shell + reframed gallery (session 1/3)
- 2026-05-07: PR #4 — chore: trim root docs
- 2026-05-07: PR #5 — chore: pause public demo with coming-soon page
- 2026-05-07: PR #3 — feat(tour): V1 demo tour at `/tour`
- 2026-05-06: PR #2 — Checkpoint: launch-day docs

## Phase 5 roadmap (when demo work resumes)

1. Lattice playground session 2 — column polish + ripples + mobile + topbar
2. Lattice playground session 3 — retire `/tour`, gallery rail/CTA
   updates, delete persona-pick subpages (`/lattice/dashboard`, `/inbox`,
   `/tasks`, `/admin`)
3. Module picker landing — replaces gallery; 12 module checkboxes +
   "Build my sandbox" button
4. Sandbox renderer — picks render as stacked single-page experience with
   shared sample data; Lattice becomes the "agency review loop" combo
5. Telemetry on combo picks — log to Blob, prioritize the 9 unbuilt
   module widgets
6. Lift coming-soon pause

## Blockers / decisions pending

- Whether to ship sessions 2-3 of Lattice as polish, or rebrand the
  finished Lattice as a "combo" inside the new configurator landing.
  Decision per 2026-05-09: ship Lattice s2/s3 first, then build
  configurator landing around the finished work.

## Known broken / out of date

- `DEMO-PLAYGROUND-PLAN.md` and `DEMO-POLISH-PLAN.md` (in
  `gravixar-notes/`) describe the original framing. Configurator pivot
  isn't reflected there yet. Treat conversation context as the
  authoritative plan.

## Update protocol

- End of every session: update this file as part of the same PR
- On every merge: bump "Recent merges," clear "Currently working on"

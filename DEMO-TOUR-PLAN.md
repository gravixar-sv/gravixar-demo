# DEMO-TOUR-PLAN.md, demo.gravixar.com guided tour

## Why this exists

The current `/lattice` scene is built for someone who already knows
what a client portal is. A small-business buyer lands, sees four
fictional personas, has no narrative, doesn't know what they'd
actually use, bounces.

This tour reframes the demo as a **guided onboarding experience for
small-to-medium business buyers** rather than a sandbox to explore.
The buyer mental model: "I'm thinking of buying a portal for my
agency. Show me what I'd actually USE." Not: "Here are four
fictional people, click around as them."

**Audience**: small/medium business owners + operators evaluating
Gravixar. NOT general public. If we build for everyone we serve no
one.

## V1 scope (this spec)

- **Hardcoded** guided tour. No AI in V1. We validate the model
  first, then add AI personalization in V2 if V1 works.
- **Single business context**: agency. Healthcare and other contexts
  added later if there's signal.
- **Single window experience**. Login flow + persona dashboards
  unfold in one route, not navigation between pages.
- **Auto-progression**: tour walks visitor through 3 personas in a
  scripted sequence with subtle transitions. Visitor can pause and
  click around.
- **Shipping target**: 8-12 hours of focused work, 2-3 sessions.

## V1 design

### Route

`/tour` at the top level (peer to `/lattice` and `/studio-mix`).
Promoted from the gallery landing as the **primary CTA** ("Take the
30-second tour"). The existing `/lattice` scene stays as the
"go deeper" path for visitors who want freeform exploration.

### Flow (60-90 seconds total)

```
1. Welcome screen (5s)
   ├─ "What kind of business are you running?"
   ├─ Buttons: [Agency] [Healthcare clinic] [Other]
   └─ Optional: 1-line "Company name" text field
                (used for fake personalization, no AI)

2. Login screen (10s)
   ├─ Looks like a real product login
   ├─ Pre-filled username: mira@<their-company>.com
   ├─ Pre-filled password: ••••••••
   └─ [Sign in] → loading spinner → drops into Mira's dashboard

3. Mira's dashboard — focused (15s)
   ├─ One main panel: "1 deliverable awaiting your review"
   ├─ Big card: deliverable preview, [Approve] [Request revision]
   ├─ Tooltip overlay: "👋 You're the client. Your designer just
   │   submitted work. Click Approve to ship it."
   └─ Click Approve → toast → auto-progress

4. Auto-switch to Kai's view (15s)
   ├─ Brief screen flash, login transition animation
   ├─ Kai's PM dashboard: "1 inquiry awaiting reply"
   ├─ Tooltip: "You're the PM. New inquiry came in. Click 'send
   │   first reply' to advance the funnel."
   ├─ Click → animation, status changes
   └─ Audit row appears (visible in next step)

5. Auto-switch to Nox's view (15s)
   ├─ Admin console
   ├─ Activity log shows: "[Mira] approved deliverable",
   │   "[Kai] sent first reply"
   ├─ Tooltip: "You're the admin. Here's the audit trail of what
   │   just happened. This is what compliance teams check."
   └─ Visitor scrolls audit log, sees the cause-and-effect

6. Done screen (10s)
   ├─ "That's the round-trip. Three roles, one system, one audit
   │   trail. This same pattern runs in production at our existing
   │   clients."
   ├─ Two CTAs:
   │   • [Try it freely] → drops into existing /lattice scene
   │   • [Talk to Qamar] → links to gravixar.com/contact
   └─ Optional: "Take the tour again" button
```

### Layout principles

Each persona's dashboard in the tour is **focused, not sprawling**.
Show ONE main panel + one main action. The current /lattice persona
pages have multiple panels (KPI grid, project list, audit, etc.) —
the tour version strips this to the headline interaction. The
philosophy: tour is the elevator pitch, /lattice is the deep dive.

### Transitions between personas

Subtle "logging out" animation (2s):
- Screen darkens with a brief loading shimmer
- "Switching to [Persona name] · [Role]" text fades in
- Login screen flashes for 1s with the new persona's email
- New dashboard fades in

Sound on transition (optional, default off): subtle "ding"
(~0.3s) when state advances. Toggle in tour settings.

### Comments inside the tour

In step 3 (Mira), before the Approve button, add a small text field:
"Leave a note for the designer (optional)". Whatever they type
appears as a comment on Sage's view if they switch later. Provides
the "leave a comment, trigger something on another role" feature the
user described, without requiring full free-form interaction.

### State management

- All state in React (`useState` + `useReducer`)
- NO database writes. NO server actions in tour mode.
- Each visitor gets isolated state automatically (no per-session
  sandboxing needed because state never persists)
- "Restart tour" button resets local state, no global side effects

## Out of scope for V1

- ❌ AI-personalized narration (V2)
- ❌ Multiple business contexts beyond Agency (V2 / per-vertical)
- ❌ Free-form interaction within tour mode (the existing /lattice
  scene already provides this)
- ❌ Real persistence (state lives only in React)
- ❌ Account creation / lead capture inside the tour (the "Talk to
  Qamar" CTA at the end routes to /contact)
- ❌ Multi-pane simultaneous role view (we considered this; chose
  sequential auto-switch instead — cleaner cognitive load)

## V2 (when V1 has validated)

Triggers to start V2:
1. ≥30 visitors complete the tour
2. ≥3 of those visitors book a discovery call within 7 days
3. Bounce-rate at the welcome screen <50%

If those hit, V2 adds:
- **AI-personalized welcome**: free-text "What kind of business?"
  → Claude generates a tailored 4-6 step tour script
- **Per-vertical contexts**: healthcare, accounting, professional
  services
- **Dynamic narration**: AI inserts visitor's company name +
  context-aware reasoning at each step
- **Voice narration** (optional, ElevenLabs or similar)

V2 is roughly 6-8 hours additional on top of V1. Build only when V1
data justifies it.

## Implementation checklist

When you start the V1 build (in a new session):

- [ ] Branch off `main` in gravixar-demo: `feat/lattice-tour-v1`
- [ ] New route: `src/app/tour/page.tsx` (single page, client component)
- [ ] State machine: track `step` (0-5) and `actions` (approved /
      replied / etc.)
- [ ] Components needed:
   - `<TourWelcome>` — step 0
   - `<TourLogin>` — step 1
   - `<TourPersonaView>` — steps 2-4 (parameterized by persona)
   - `<TourTransition>` — between-persona animation
   - `<TourDone>` — step 5
   - `<TourTooltip>` — overlay component for guidance text
- [ ] Add to `src/lib/scenes.ts` as a new scene type (or peer entry)
- [ ] Update gallery landing (`src/app/page.tsx`) to feature the
      tour as the primary entry point
- [ ] Sound assets in `public/audio/` (optional, ~10kb each)
- [ ] Mobile layout: confirm tour works on small screens (one
      breakpoint, single-column layout)
- [ ] Build + verify: `pnpm build` clean, route `/tour` appears
      as static
- [ ] Open PR, target `main`

## Definition of done

- Visitor lands on demo.gravixar.com → sees "Take the 30-sec tour"
  as the most prominent CTA on the gallery
- Click → 60-90 second guided experience completes without errors
- Visitor finishes with a clear understanding of: "I just played
  three roles in a portal. The system tracked everything. This is
  what my own portal would feel like."
- Two CTAs at the end visibly route to: deeper exploration
  (existing /lattice scene) OR contact (gravixar.com/contact)
- Mobile + desktop both work
- Build passes, no TypeScript errors, no console errors at runtime

## Open questions to lock at session start

1. **Replace or augment /lattice as primary CTA from gallery?**
   - Recommendation: augment. Tour is the front door, /lattice is
     the deep dive. Both visible.
2. **Sound on by default or off?**
   - Recommendation: off by default, toggle visible in tour UI.
3. **How prominent is "Talk to Qamar" CTA at done screen?**
   - Recommendation: equal weight with "Try it freely". Don't push
     a sales conversation, but make it available.
4. **Real fake-name personalization or skip?**
   - Recommendation: skip in V1. Just say "Mira" / "Kai" / "Nox"
     as in the existing scene. AI personalization comes in V2.

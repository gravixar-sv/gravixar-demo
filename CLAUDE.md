@AGENTS.md

## Quick reference

- **State:** `C:\dev\gravixar-hq\brain\projects\gravixar-demo.md` (the brain is canonical; `AGENTS.md` holds conventions).
- **Dev:** `pnpm dev` on port 3400. **Gate before a PR:** `pnpm typecheck`, `pnpm lint`, `pnpm build`
  (the build includes the prerender). There is no unit-test script; `pnpm verify:learn-beat` and
  `pnpm verify:outcomes` check a running site.
- **Deploy:** Vercel, static `dist/`, auto-deploys from `main` to demo.gravixar.com. Merging is a release.
- **This repo is public.** No client names or private detail in code, commits or PR text.
- Scene slugs are a contract mirrored in gravixar-marketing: change both sides or neither.

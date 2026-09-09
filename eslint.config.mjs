// Demo ESLint — consumes the canonical Gravixar flat config from the shared
// @gravixar-sv/core package. This MODERNIZES off the legacy FlatCompat shim
// (which routed next/core-web-vitals through @eslint/eslintrc's legacy
// validator) onto the native flat config the rest of the fleet uses, and kills
// the per-repo eslint drift the fleet-dep-drift sensor measures.
//
// LOCAL IGNORE, added 2026-09-09 alongside the `next lint` -> `eslint .` script
// fix: the shared GRAVIXAR_IGNORES lists `.next/**`, `out/**`, `build/**` and
// `dist/**`, but a flat-config ignore pattern without a leading `**/` matches
// only at the project root. A Claude worktree lives at
// `.claude/worktrees/<name>/` and carries its own `.next/` build output, so
// `eslint .` walks it and lints thousands of generated chunks.
//
// Here that is merely wasteful — it currently reports warnings only. In
// ace-of-maids the identical situation produced hard errors
// (no-require-imports, no-assign-module-variable, ban-ts-comment on generated
// chunks) and failed the lint outright, so this repo is one stale build away
// from the same. Ignoring `.claude/**` makes `pnpm lint` depend only on this
// repo's own source.
//
// The fleet-wide fix belongs upstream: changing GRAVIXAR_IGNORES to `**/.next/**`
// etc. in @gravixar-sv/core would cover every consumer at once. Raised there;
// this stays as the local guard until it lands.
import { withOverrides } from "@gravixar-sv/core/eslint";
import { globalIgnores } from "eslint/config";

export default withOverrides(globalIgnores([".claude/**"]));

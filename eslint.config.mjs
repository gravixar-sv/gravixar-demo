// Demo ESLint — consumes the canonical Gravixar flat config from the shared
// @gravixar-sv/core package. This MODERNIZES off the legacy FlatCompat shim
// (which routed next/core-web-vitals through @eslint/eslintrc's legacy
// validator) onto the native flat config the rest of the fleet uses, and kills
// the per-repo eslint drift the fleet-dep-drift sensor measures.
import gravixar from "@gravixar-sv/core/eslint";

export default gravixar;

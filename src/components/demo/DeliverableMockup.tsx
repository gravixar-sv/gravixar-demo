// Inline-SVG design mockups for the Lattice review-loop deliverables.
// CSP-safe (no external image host), zero-cost, and good-looking enough
// to read as real agency work. Swappable for AI-generated images later
// (drop an <img src="/lattice/<kind>.webp"> in place of <Art/>).
//
// MockupThumb renders the art small and "pops" it (scales up with a
// ring + shadow) on hover — the attachment-preview interaction.

import type { DeliverableKind } from "@/lib/playground/lattice-deliverables";

function WebArt() {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" role="img" aria-label="Homepage hero mockup">
      <rect width="320" height="180" fill="#0c0e1a" />
      <rect x="0" y="0" width="320" height="22" fill="#11142400" />
      <circle cx="14" cy="11" r="3" fill="#FF6B6B" />
      <text x="26" y="14" fill="#F5E6D3" fontSize="8" fontFamily="serif" letterSpacing="2">LATTICE</text>
      <text x="266" y="14" fill="#71717a" fontSize="6" fontFamily="monospace">menu</text>
      <text x="20" y="78" fill="#f5f5f7" fontSize="26" fontFamily="serif" fontWeight="600">Make it</text>
      <text x="20" y="108" fill="#FF6B6B" fontSize="26" fontFamily="serif" fontWeight="600">unmistakable.</text>
      <rect x="20" y="124" width="78" height="18" rx="9" fill="#FF6B6B" />
      <text x="34" y="136" fill="#0c0e1a" fontSize="8" fontFamily="sans-serif" fontWeight="700">Start a project</text>
      <rect x="210" y="40" width="92" height="110" rx="6" fill="#1a1f33" />
      <rect x="222" y="54" width="68" height="40" rx="3" fill="#F5E6D3" opacity="0.85" />
      <rect x="222" y="102" width="68" height="6" rx="3" fill="#3a3f55" />
      <rect x="222" y="114" width="48" height="6" rx="3" fill="#3a3f55" />
    </svg>
  );
}

function SocialArt() {
  return (
    <svg viewBox="0 0 180 180" className="h-full w-full" role="img" aria-label="Launch carousel mockup">
      <rect width="180" height="180" fill="#1a0f1f" />
      <circle cx="150" cy="30" r="34" fill="#FF2D95" opacity="0.18" />
      <text x="20" y="40" fill="#C9A227" fontSize="7" fontFamily="monospace" letterSpacing="3">LAUNCH · 01</text>
      <text x="20" y="92" fill="#f5f5f7" fontSize="22" fontFamily="serif" fontWeight="700">New season,</text>
      <text x="20" y="116" fill="#f5f5f7" fontSize="22" fontFamily="serif" fontWeight="700">new look.</text>
      <rect x="20" y="134" width="60" height="3" fill="#FF2D95" />
      <text x="20" y="162" fill="#a1a1aa" fontSize="8" fontFamily="sans-serif">swipe to see the system →</text>
    </svg>
  );
}

function EmailArt() {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" role="img" aria-label="Email banner mockup">
      <rect width="320" height="180" fill="#0e1024" />
      <rect x="0" y="0" width="320" height="120" fill="#141833" />
      <text x="24" y="40" fill="#F5E6D3" fontSize="9" fontFamily="serif" letterSpacing="2">LATTICE</text>
      <text x="24" y="74" fill="#f5f5f7" fontSize="18" fontFamily="serif" fontWeight="600">Welcome aboard.</text>
      <text x="24" y="94" fill="#a1a1aa" fontSize="8" fontFamily="sans-serif">Here&apos;s what happens in week one.</text>
      <rect x="24" y="138" width="74" height="20" rx="10" fill="#FF6B6B" />
      <text x="38" y="151" fill="#0e1024" fontSize="8" fontFamily="sans-serif" fontWeight="700">Get started</text>
      <text x="232" y="151" fill="#52525b" fontSize="7" fontFamily="monospace">unsubscribe</text>
    </svg>
  );
}

// ─── Northbeam Goods variants ───────────────────────────────────────
// Same shapes, the DTC brand's own voice: sage green + cream on deep
// green-black. Northbeam's attachments must read as NORTHBEAM work,
// not Lattice's.

function NorthbeamSocialArt() {
  return (
    <svg viewBox="0 0 180 180" className="h-full w-full" role="img" aria-label="Northbeam social post mockup">
      <rect width="180" height="180" fill="#121a0e" />
      <circle cx="140" cy="44" r="40" fill="#9DBE6E" opacity="0.22" />
      <text x="20" y="38" fill="#F2DDC1" fontSize="7" fontFamily="monospace" letterSpacing="3">NORTHBEAM</text>
      <text x="20" y="92" fill="#f5f5f7" fontSize="21" fontFamily="serif" fontWeight="700">The spring</text>
      <text x="20" y="116" fill="#9DBE6E" fontSize="21" fontFamily="serif" fontWeight="700">drop is here.</text>
      <rect x="20" y="134" width="56" height="3" fill="#9DBE6E" />
      <text x="20" y="162" fill="#a1a1aa" fontSize="8" fontFamily="sans-serif">made to last, made by hand</text>
    </svg>
  );
}

function NorthbeamWebArt() {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" role="img" aria-label="Northbeam landing module mockup">
      <rect width="320" height="180" fill="#10160c" />
      <circle cx="14" cy="11" r="3" fill="#9DBE6E" />
      <text x="26" y="14" fill="#F2DDC1" fontSize="8" fontFamily="serif" letterSpacing="2">NORTHBEAM</text>
      <text x="20" y="78" fill="#f5f5f7" fontSize="24" fontFamily="serif" fontWeight="600">Bundle up.</text>
      <text x="20" y="104" fill="#9DBE6E" fontSize="13" fontFamily="serif">Three favourites, one box.</text>
      <rect x="20" y="124" width="76" height="18" rx="9" fill="#9DBE6E" />
      <text x="32" y="136" fill="#10160c" fontSize="8" fontFamily="sans-serif" fontWeight="700">Shop the set</text>
      <rect x="206" y="38" width="96" height="112" rx="6" fill="#1c2614" />
      <rect x="218" y="52" width="72" height="44" rx="3" fill="#F2DDC1" opacity="0.85" />
      <rect x="218" y="106" width="72" height="6" rx="3" fill="#3a4a2e" />
      <rect x="218" y="118" width="50" height="6" rx="3" fill="#3a4a2e" />
    </svg>
  );
}

function NorthbeamEmailArt() {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" role="img" aria-label="Northbeam newsletter header mockup">
      <rect width="320" height="180" fill="#10160c" />
      <rect x="0" y="0" width="320" height="120" fill="#18220f" />
      <text x="24" y="40" fill="#F2DDC1" fontSize="9" fontFamily="serif" letterSpacing="2">NORTHBEAM</text>
      <text x="24" y="74" fill="#f5f5f7" fontSize="18" fontFamily="serif" fontWeight="600">May, in objects.</text>
      <text x="24" y="94" fill="#a1a1aa" fontSize="8" fontFamily="sans-serif">What we made, mended, and shipped.</text>
      <rect x="24" y="138" width="68" height="20" rx="10" fill="#9DBE6E" />
      <text x="36" y="151" fill="#10160c" fontSize="8" fontFamily="sans-serif" fontWeight="700">Read on</text>
      <text x="232" y="151" fill="#52525b" fontSize="7" fontFamily="monospace">unsubscribe</text>
    </svg>
  );
}

type MockupBrand = "lattice" | "northbeam";

function Art({ kind, brand }: { kind: DeliverableKind; brand: MockupBrand }) {
  if (brand === "northbeam") {
    if (kind === "social") return <NorthbeamSocialArt />;
    if (kind === "email") return <NorthbeamEmailArt />;
    return <NorthbeamWebArt />;
  }
  if (kind === "social") return <SocialArt />;
  if (kind === "email") return <EmailArt />;
  return <WebArt />;
}

export function MockupThumb({
  kind,
  brand = "lattice",
}: {
  kind: DeliverableKind;
  /** Which fictional brand's voice the artwork carries. */
  brand?: MockupBrand;
}) {
  const ratio = kind === "social" ? "aspect-square w-20" : "aspect-[16/9] w-32";
  return (
    <span className="group/thumb relative inline-block" style={{ zIndex: 0 }}>
      <span
        className={`block ${ratio} overflow-hidden rounded-md border border-white/10 shadow-sm transition-transform duration-200 ease-out group-hover/thumb:scale-[2.1] group-hover/thumb:shadow-2xl`}
        style={{ transformOrigin: "left center" }}
      >
        <Art kind={kind} brand={brand} />
      </span>
      {/* lift above siblings on hover so the popped preview isn't clipped */}
      <style>{`.group\\/thumb:hover{z-index:30}`}</style>
    </span>
  );
}

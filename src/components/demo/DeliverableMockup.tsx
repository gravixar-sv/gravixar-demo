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

function Art({ kind }: { kind: DeliverableKind }) {
  if (kind === "social") return <SocialArt />;
  if (kind === "email") return <EmailArt />;
  return <WebArt />;
}

export function MockupThumb({ kind }: { kind: DeliverableKind }) {
  const ratio = kind === "social" ? "aspect-square w-20" : "aspect-[16/9] w-32";
  return (
    <span className="group/thumb relative inline-block" style={{ zIndex: 0 }}>
      <span
        className={`block ${ratio} overflow-hidden rounded-md border border-white/10 shadow-sm transition-transform duration-200 ease-out group-hover/thumb:scale-[2.1] group-hover/thumb:shadow-2xl`}
        style={{ transformOrigin: "left center" }}
      >
        <Art kind={kind} />
      </span>
      {/* lift above siblings on hover so the popped preview isn't clipped */}
      <style>{`.group\\/thumb:hover{z-index:30}`}</style>
    </span>
  );
}

// Polished persona avatar — a layered gradient orb with a soft glass
// highlight, a thin ring, and the monogram. Distinct hues per persona
// so Client / PM / Editor read as different people at a glance.
// CSP-safe (no external image hosts); upgradeable to real portraits
// later by swapping the inner content for an <img>.

export type AvatarHue = {
  from: string;
  to: string;
  /** Monogram + accent colour that reads well on the gradient. */
  ink: string;
};

const SIZES = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-[11px]",
  lg: "h-12 w-12 text-xs",
} as const;

export function Avatar({
  initials,
  hue,
  size = "md",
  ring = true,
}: {
  initials: string;
  hue: AvatarHue;
  size?: keyof typeof SIZES;
  ring?: boolean;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${SIZES[size]}`}
      style={{
        backgroundImage: `linear-gradient(140deg, ${hue.from} 0%, ${hue.to} 100%)`,
        boxShadow: ring
          ? `0 0 0 1px rgba(255,255,255,0.12), 0 2px 8px -2px ${hue.from}80`
          : undefined,
      }}
      aria-hidden
    >
      {/* Soft top-left glass highlight */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 28% 22%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 60%)",
        }}
      />
      <span
        className="relative font-mono font-semibold tracking-tight"
        style={{ color: hue.ink }}
      >
        {initials}
      </span>
    </span>
  );
}

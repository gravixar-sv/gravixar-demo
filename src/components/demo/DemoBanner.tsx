// Sitewide banner. Hard-on whenever GRAVIXAR_DEMO_MODE=true, which is
// always for this app. Visitors should never not see this.

export function DemoBanner() {
  return (
    <div className="border-b border-white/5 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6 py-2 text-[11px] font-mono uppercase tracking-widest text-zinc-300 md:text-xs">
        <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-mark)] text-[var(--color-mark)]" />
        <span>demo mode</span>
        <span className="text-zinc-600">·</span>
        <span className="hidden sm:inline">sandboxed showroom</span>
        <span className="hidden sm:inline text-zinc-600">·</span>
        <span>resets every sunday</span>
        <span className="hidden md:inline text-zinc-600">·</span>
        <a
          href="https://gravixar.com"
          rel="noreferrer"
          className="hidden md:inline font-medium text-zinc-100 underline-offset-4 hover:underline"
        >
          gravixar.com →
        </a>
      </div>
    </div>
  );
}

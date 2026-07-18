// Sitewide banner above the topbar. Tells a first-time visitor the two
// things that lower the barrier to clicking around: it's safe (sample
// data, nothing they do is saved) and it self-heals (resets weekly).
// Ends with a real next step rather than a bare domain.

export function DemoBanner() {
  return (
    <div className="border-b border-white/5 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-6 py-2 text-[11px] font-mono uppercase tracking-widest text-zinc-300 md:text-xs">
        <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-mark)] text-[var(--color-mark)]" />
        <span>live demo</span>
        <span aria-hidden className="text-zinc-600">·</span>
        <span>sample data · click anything, nothing&apos;s saved</span>
        <span aria-hidden className="hidden sm:inline text-zinc-600">·</span>
        <span className="hidden sm:inline">resets every Sunday</span>
        <span aria-hidden className="hidden md:inline text-zinc-600">·</span>
        <a
          href="https://gravixar.com/contact"
          rel="noreferrer"
          className="hidden font-medium text-zinc-100 underline-offset-4 hover:underline md:inline"
        >
          book a call →
        </a>
      </div>
    </div>
  );
}

// Sitewide strip above everything. Tells a first-time visitor the one
// thing that lowers the barrier to clicking around: it is safe, because
// every scene is local component state that never leaves the tab.
//
// No "resets weekly" claim. Nothing is persisted in the first place, so
// there is nothing to reset. No "Book a call" either: that lives in the
// main header and the closing section, so the strip stays one quiet line.
export function DemoBanner() {
  return (
    <div className="relative z-50 border-b border-line bg-ink-950">
      <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-x-2.5 px-4 py-2 text-center text-sm text-ink-300 sm:px-6 lg:px-10">
        <span aria-hidden className="live-dot text-[var(--color-mark)]" />
        {/* On a phone the strip keeps one line: the header's "demo" chip
            already says it is a demo. */}
        <span className="hidden font-medium text-ink-100 sm:inline">Live demo</span>
        <span aria-hidden className="hidden text-ink-500 sm:inline">/</span>
        <span>Sample data. Click anything, nothing is saved</span>
        <span aria-hidden className="hidden text-ink-500 sm:inline">/</span>
        <span className="hidden sm:inline">Reload and it starts over</span>
      </div>
    </div>
  );
}

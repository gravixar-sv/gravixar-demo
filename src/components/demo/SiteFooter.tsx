// The page foot every surface shares: the mark, the honesty line, and
// the ways out.
export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
        <div className="flex items-center gap-3">
          <img src="/brand/gravixar-wordmark.png" alt="Gravixar" width={130} height={32} className="h-4 w-auto opacity-90" />
          <span className="text-xs text-ink-500">
            Demo on sample data. Nothing you press here leaves the page.
          </span>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-400">
            <li>
              <a href="/" className="link-draw transition-colors hover:text-ink-50">
                All scenes
              </a>
            </li>
            <li>
              <a href="/modules" className="link-draw transition-colors hover:text-ink-50">
                Modules
              </a>
            </li>
            <li>
              <a href="https://gravixar.com" rel="noreferrer" className="link-draw transition-colors hover:text-ink-50">
                gravixar.com
              </a>
            </li>
            <li>
              <a href="https://gravixar.com/contact" rel="noreferrer" className="link-draw text-ink-100 transition-colors hover:text-white">
                Book a call
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

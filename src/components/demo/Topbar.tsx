import { ButtonLink } from "@/components/ui/Button";

// The site header for the index, /modules and the 404. Scenes carry
// their own bar (SceneLayout), with a way back here.
export function Topbar({ current }: { current?: "home" | "modules" }) {
  const links = [
    { href: current === "home" ? "#scenes" : "/#scenes", label: "Scenes" },
    { href: current === "home" ? "#loop" : "/#loop", label: "How it works" },
    { href: "/modules", label: "Modules", active: current === "modules" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink-950/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-10">
        <a href="/" className="flex items-center gap-2.5" aria-label="Gravixar demo, home">
          <img src="/brand/gravixar-wordmark.png" alt="" width={130} height={32} className="h-4 w-auto" />
          <span className="chip">demo</span>
        </a>
        <nav aria-label="Main" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  aria-current={l.active ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
                    l.active ? "text-ink-50" : "text-ink-400 hover:bg-white/[0.04] hover:text-ink-50"
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <ButtonLink href="https://gravixar.com/contact" external variant="primary" size="sm" arrow className="ml-auto md:ml-0">
          Book a call
        </ButtonLink>
      </div>
    </header>
  );
}

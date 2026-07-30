import Link from "next/link";
import {
  CATEGORY_LABELS,
  INTERACTIVE_COUNT,
  MODULE_COUNT,
  MODULES,
  numberWord,
  type ModuleCategory,
} from "@/lib/modules";

// The reusable library behind the builds. Every entry runs in production
// somewhere; a few also have a sandbox here. The page scopes that promise
// up front rather than inviting a visitor to "try it in 30 seconds" and
// then handing three quarters of them a dead panel.
export default function ModulesIndex() {
  // Group by category, in declaration order
  const groups = MODULES.reduce<Record<ModuleCategory, typeof MODULES>>(
    (acc, m) => {
      (acc[m.category] ||= []).push(m);
      return acc;
    },
    {} as Record<ModuleCategory, typeof MODULES>,
  );

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-12 md:px-10 lg:px-16">
      {/* Header */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-scene-1)]">
            modules, the patterns I reuse across builds
          </p>
          <h1 className="mt-5 text-5xl font-medium leading-[0.98] tracking-[-0.02em] text-zinc-50 md:text-6xl lg:text-[72px]">
            Pick a module.
            <br />
            <span className="text-zinc-400">
              {numberWord(INTERACTIVE_COUNT)} of them you can press.
            </span>
          </h1>
        </div>
        <div className="lg:col-span-4 lg:pt-6">
          <p className="max-w-md text-lg leading-relaxed text-zinc-300">
            The patterns I reuse across builds, running in production at
            Broomstick Hub, Beeline Medical, and the platform Gravixar runs
            itself on. Each engagement adds to the library, so the next build
            is faster because these already exist.
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-400">
            {numberWord(INTERACTIVE_COUNT)} have a sandbox on this site. The
            rest open their write-up, because a pattern that runs in a client
            system is not the same thing as one you can safely poke at here.
          </p>
          <p className="mt-4 max-w-md font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            {INTERACTIVE_COUNT} interactive · {MODULE_COUNT} in the library · no
            signup
          </p>
        </div>
      </div>

      {/* Modules by category */}
      <div className="mt-14 space-y-12">
        {Object.entries(groups).map(([category, items]) => (
          <section key={category} aria-labelledby={`modules-${category}`}>
            <h2
              id={`modules-${category}`}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-scene-1)]"
            >
              {CATEGORY_LABELS[category as ModuleCategory]}
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 md:gap-5">
              {items
                .sort((a, b) => a.order - b.order)
                .map((m) => (
                  <ModuleCard key={m.slug} m={m} />
                ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 border-t border-white/5 pt-8">
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 hover:text-zinc-200"
        >
          ← back to gallery
        </Link>
      </div>
    </div>
  );
}

// Every card is a link. The non-interactive ones used to be dead divs at
// 70% opacity, which read as broken rather than as "documented elsewhere";
// they now open the module's own page, which carries the summary, where it
// runs, its stack, and a link to the full write-up on gravixar.com.
function ModuleCard({ m }: { m: (typeof MODULES)[number] }) {
  const interactive = m.status === "interactive";

  return (
    <Link
      href={`/modules/${m.slug}`}
      className="scene-card group relative block rounded-2xl p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-medium tracking-[-0.01em] text-zinc-100 md:text-xl">
          {m.title}
        </h3>
        <span
          className={`shrink-0 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] ${
            interactive ? "text-emerald-300/90" : "text-zinc-400"
          }`}
        >
          <span
            aria-hidden
            className={
              interactive
                ? "pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 text-emerald-400"
                : "inline-block h-1.5 w-1.5 rounded-full bg-zinc-500"
            }
          />
          {interactive ? "interactive" : "in production"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{m.summary}</p>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/5 pt-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          {m.runningIn.join(" · ")}
        </p>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 group-hover:text-white">
          {interactive ? "try" : "read"}
          <span aria-hidden className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

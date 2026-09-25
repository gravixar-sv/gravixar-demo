import { ModulesLayout } from "@/components/demo/ModulesLayout";
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
// then handing most of them a dead panel. A catalogue of rows, grouped by
// category, rather than a grid of identical cards.
export default function ModulesIndex() {
  const groups = MODULES.reduce<Record<ModuleCategory, typeof MODULES>>(
    (acc, m) => {
      (acc[m.category] ||= []).push(m);
      return acc;
    },
    {} as Record<ModuleCategory, typeof MODULES>,
  );

  return (
    <ModulesLayout>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
        <div className="scene-rise">
          <p className="eyebrow">Modules, the patterns I reuse across builds</p>
          <h1 className="display mt-5 text-5xl text-ink-50 md:text-7xl">
            Pick a module.
            <span className="voice mt-2 block font-normal text-scene-soft">
              {numberWord(INTERACTIVE_COUNT)} of them you can press.
            </span>
          </h1>
        </div>
        <div className="scene-rise-2 space-y-4 text-base leading-relaxed text-ink-400">
          <p className="text-ink-300">
            The patterns I reuse across builds, running in production at Broomstick Hub, Beeline Medical, and the
            platform Gravixar runs itself on. Each engagement adds to the library, so the next build is faster.
          </p>
          <p>
            {numberWord(INTERACTIVE_COUNT)} have a sandbox on this site. The rest open their write-up, because a
            pattern that runs in a client system is not the same thing as one you can safely poke at here.
          </p>
          <p className="flex flex-wrap gap-2 pt-1">
            <span className="chip chip-positive">{INTERACTIVE_COUNT} interactive</span>
            <span className="chip">{MODULE_COUNT} in the library</span>
            <span className="chip">no signup</span>
          </p>
        </div>
      </div>

      <div className="scene-rise-3 mt-16 space-y-14">
        {Object.entries(groups).map(([category, items]) => (
          <section key={category} aria-labelledby={`modules-${category}`}>
            <h2 id={`modules-${category}`} className="eyebrow capitalize">
              {CATEGORY_LABELS[category as ModuleCategory]}
            </h2>
            <ul className="mt-4 border-t border-line">
              {items
                .sort((a, b) => a.order - b.order)
                .map((m) => (
                  <li key={m.slug}>
                    <ModuleRow m={m} />
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </ModulesLayout>
  );
}

// Every row is a link. Interactive modules open their sandbox; the rest
// open the module's own page (summary, where it runs, stack, write-up).
function ModuleRow({ m }: { m: (typeof MODULES)[number] }) {
  const interactive = m.status === "interactive";
  return (
    <a
      href={`/modules/${m.slug}`}
      data-spot
      className="group grid gap-x-8 gap-y-2 border-b border-line px-2 py-6 transition-colors duration-200 hover:bg-white/[0.02] md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_auto] md:items-baseline md:px-4"
    >
      <h3 className="heading text-xl text-ink-100 transition-colors group-hover:text-white">{m.title}</h3>
      <div>
        <p className="max-w-[70ch] text-sm leading-relaxed text-ink-400">{m.summary}</p>
        <p className="mt-2 text-xs text-ink-500">Runs in {m.runningIn.join(", ")}</p>
      </div>
      <span className="flex items-center gap-3 md:justify-end">
        <span className={`chip ${interactive ? "chip-positive" : ""}`}>
          {interactive ? (
            <>
              <span aria-hidden className="live-dot" /> interactive
            </>
          ) : (
            "in production"
          )}
        </span>
        <span className="inline-flex items-center gap-1 text-sm text-ink-300 group-hover:text-white">
          {interactive ? "Try it" : "Read"}
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </span>
      </span>
    </a>
  );
}

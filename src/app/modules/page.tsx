import Link from "next/link";
import { CATEGORY_LABELS, MODULES, type ModuleCategory } from "@/lib/modules";

export default function ModulesIndex() {
  // Group by category, in declaration order
  const groups = MODULES.reduce<Record<ModuleCategory, typeof MODULES>>(
    (acc, m) => {
      (acc[m.category] ||= []).push(m);
      return acc;
    },
    {} as Record<ModuleCategory, typeof MODULES>,
  );

  const interactiveCount = MODULES.filter(
    (m) => m.status === "interactive",
  ).length;
  const comingCount = MODULES.length - interactiveCount;

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
            <span className="text-zinc-400">Try it in 30 seconds.</span>
          </h1>
        </div>
        <div className="lg:col-span-4 lg:pt-6">
          <p className="max-w-md text-lg leading-relaxed text-zinc-300">
            The same patterns running in production at Broomstick Hub and
            Beeline Medical. Each engagement adds reusable modules to a shared
            library, the next build is faster because these already exist.
          </p>
          <p className="mt-4 max-w-md font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            {interactiveCount} interactive · {comingCount} coming online · no signup
          </p>
        </div>
      </div>

      {/* Modules by category */}
      <div className="mt-14 space-y-12">
        {Object.entries(groups).map(([category, items]) => (
          <section key={category}>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-scene-1)]">
              {CATEGORY_LABELS[category as ModuleCategory]}
            </p>
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

function ModuleCard({ m }: { m: (typeof MODULES)[number] }) {
  const interactive = m.status === "interactive";

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-medium tracking-[-0.01em] text-zinc-100 md:text-xl">
          {m.title}
        </h2>
        <span
          className={`shrink-0 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] ${
            interactive ? "text-emerald-300/90" : "text-zinc-500"
          }`}
        >
          <span
            className={
              interactive
                ? "pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 text-emerald-400"
                : "inline-block h-1.5 w-1.5 rounded-full bg-zinc-500"
            }
          />
          {interactive ? "interactive" : "coming"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{m.summary}</p>
      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
          {m.runningIn.join(" · ")}
        </p>
        {interactive ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 group-hover:text-white">
            try
            <span aria-hidden className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
        ) : null}
      </div>
    </>
  );

  if (interactive) {
    return (
      <Link
        href={`/modules/${m.slug}`}
        className="scene-card group relative block rounded-2xl p-6"
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className="scene-card relative rounded-2xl p-6 opacity-70">
      {inner}
    </div>
  );
}

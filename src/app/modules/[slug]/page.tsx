import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findModule, MODULES } from "@/lib/modules";
import { ReviewStateMachine } from "@/components/modules/ReviewStateMachine";
import { DailyCheckin } from "@/components/modules/DailyCheckin";
import { AuditLogRestore } from "@/components/modules/AuditLogRestore";

// Widget registry. Each interactive module slug maps to its component.
// Coming-soon modules render the same detail page minus the widget.
const WIDGETS: Record<string, () => React.ReactElement> = {
  "review-state-machine": () => <ReviewStateMachine />,
  "daily-checkin": () => <DailyCheckin />,
  "audit-log-restore": () => <AuditLogRestore />,
};

export async function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const m = findModule(slug);
  if (!m) return { title: "Not found" };
  return { title: `${m.title}, Gravixar demo modules` };
}

export default async function ModulePage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const m = findModule(slug);
  if (!m) notFound();

  const Widget = WIDGETS[m.slug];
  const isInteractive = m.status === "interactive";

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-12 md:px-10 lg:px-16">
      {/* Breadcrumb-ish */}
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-scene-1)]">
        modules · {m.category}
      </p>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <h1 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.02em] md:text-5xl lg:text-6xl">
            {m.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-300">
            {m.summary}
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        {/* Widget */}
        <div className="lg:col-span-8">
          {isInteractive && Widget ? (
            <Widget />
          ) : (
            <div className="scene-card rounded-2xl p-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                in production, no sandbox here
              </p>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-300">
                This one runs in{" "}
                <span className="text-zinc-100">{m.runningIn.join(" and ")}</span>
                . It has no sandbox on this site, because the pattern only
                means anything against a real database, real roles, and real
                money. Rebuilding that as a toy would demonstrate the toy.
              </p>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-400">
                The write-up covers how it works and where it is deployed.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`https://gravixar.com/modules/${m.slug}`}
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--color-scene-1)] px-5 py-2.5 text-sm font-semibold text-[#160808] transition-[transform,filter] duration-200 hover:brightness-110 active:scale-[0.98] lg:min-h-0"
                >
                  Read the write-up
                  <span aria-hidden className="ml-1.5">
                    →
                  </span>
                </a>
                <Link
                  href="/modules"
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/15 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition-[color,border-color,transform] duration-150 hover:border-white/30 hover:text-white active:scale-[0.98] lg:min-h-0"
                >
                  ← all modules
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
              running in
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {m.runningIn.map((r) => (
                <li key={r} className="text-zinc-200">
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {m.stack.length > 0 ? (
            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
                stack
              </h2>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {m.stack.map((s) => (
                  <li
                    key={s}
                    className="rounded-sm border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-zinc-300"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
              read more
            </h2>
            <Link
              href={`https://gravixar.com/modules/${m.slug}`}
              className="mt-3 block text-sm text-zinc-300 underline-offset-4 hover:underline"
              rel="noreferrer"
            >
              Full write-up on gravixar.com →
            </Link>
            <Link
              href="/modules"
              className="mt-2 block text-sm text-zinc-400 underline-offset-4 hover:underline"
            >
              All modules →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

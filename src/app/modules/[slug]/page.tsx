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
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-md">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                coming online
              </p>
              <p className="mt-3 text-base text-zinc-300">
                The interactive sandbox for this module hasn&apos;t shipped
                yet. The pattern is running in production at{" "}
                <span className="text-zinc-100">{m.runningIn.join(" + ")}</span>
                , the demo wrapper is in build.
              </p>
              <Link
                href="/modules"
                className="mt-6 inline-block rounded-md border border-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
              >
                ← all modules
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
              running in
            </p>
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
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
                stack
              </p>
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
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-scene-1)]">
              read more
            </p>
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

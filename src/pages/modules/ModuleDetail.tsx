import { findModule } from "@/lib/modules";
import { ModulesLayout } from "@/components/demo/ModulesLayout";
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

export default function ModulePage({ slug }: { slug: string }) {
  const m = findModule(slug);
  if (!m) throw new Error(`ModuleDetail: unknown module ${slug}`);

  const Widget = WIDGETS[m.slug];
  const isInteractive = m.status === "interactive";

  return (
    <ModulesLayout>
      <nav aria-label="Breadcrumb" className="scene-rise eyebrow">
        <a href="/modules" className="link-draw hover:text-ink-100">
          Modules
        </a>
        <span aria-hidden className="mx-2 text-ink-600">
          /
        </span>
        <span className="capitalize">{m.category}</span>
      </nav>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <h1 className="display scene-rise mt-5 text-4xl text-ink-50 md:text-6xl">
            {m.title}
          </h1>
          <p className="scene-rise-2 mt-5 max-w-2xl text-lg leading-relaxed text-ink-300">
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
            <div className="surface rounded-2xl p-8 md:p-10">
              <span className="chip">in production, no sandbox here</span>
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
                  className="btn btn-primary"
                >
                  Read the write-up
                  <span aria-hidden className="btn-arrow">
                    ↗
                  </span>
                </a>
                <a
                  href="/modules"
                  className="btn btn-quiet"
                >
                  ← All modules
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="surface space-y-8 self-start rounded-2xl p-6 lg:col-span-4">
          <div>
            <h2 className="eyebrow">
              Running in
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
              <h2 className="eyebrow">
                Stack
              </h2>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {m.stack.map((s) => (
                  <li
                    key={s}
                    className="chip chip-mono"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <h2 className="eyebrow">
              Read more
            </h2>
            <a
              href={`https://gravixar.com/modules/${m.slug}`}
              className="mt-3 block text-sm text-zinc-300 underline-offset-4 hover:underline"
              rel="noreferrer"
            >
              Full write-up on gravixar.com →
            </a>
            <a
              href="/modules"
              className="mt-2 block text-sm text-zinc-400 underline-offset-4 hover:underline"
            >
              All modules →
            </a>
          </div>
        </aside>
      </div>
    </ModulesLayout>
  );
}

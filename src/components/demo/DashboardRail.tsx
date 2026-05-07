"use client";

// Persistent left-rail navigation for the demo dashboard. Visible on
// lg+ only — below that, the main pane fills the viewport and visitors
// rely on inline links + the demo banner for orientation. Active item
// is computed from the URL via usePathname.
//
// The rail is part of the polish-pass V1 (2026-05-07): the gallery
// reframes as a dashboard with this rail; in session 2, the same shell
// will wrap each scene layout so chrome stays consistent.

import Link from "next/link";
import { usePathname } from "next/navigation";

type RailItem =
  | { kind: "header"; label: string }
  | { kind: "link"; href: string; label: string; badge?: string };

const ITEMS: RailItem[] = [
  { kind: "header", label: "Demo" },
  { kind: "link", href: "/", label: "Overview" },
  { kind: "link", href: "/tour", label: "Tour", badge: "60s" },
  { kind: "header", label: "Live scenes" },
  { kind: "link", href: "/lattice", label: "Lattice Studio" },
  { kind: "link", href: "/studio-mix", label: "Studio Mix" },
  { kind: "header", label: "Library" },
  { kind: "link", href: "/modules", label: "Modules" },
];

export function DashboardRail() {
  const pathname = usePathname() ?? "/";

  return (
    <aside
      aria-label="Demo navigation"
      className="hidden w-56 flex-shrink-0 border-r border-white/5 lg:block"
    >
      <div className="sticky top-0 px-6 py-10">
        <Link href="/" className="block group">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-200 transition-colors group-hover:text-white">
            gravixar
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            demo
          </p>
        </Link>

        <nav className="mt-10 space-y-0.5" aria-label="Sections">
          {ITEMS.map((item, i) => {
            if (item.kind === "header") {
              return (
                <p
                  key={i}
                  className={`px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600 ${
                    i === 0 ? "" : "mt-6"
                  } mb-2`}
                >
                  {item.label}
                </p>
              );
            }
            const isActive = isActiveLink(pathname, item.href);
            return (
              <Link
                key={i}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "group relative flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-white/[0.06] text-zinc-50"
                    : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-100",
                ].join(" ")}
              >
                {/* Active indicator: a small accent bar on the left */}
                <span
                  aria-hidden
                  className={[
                    "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r transition-opacity",
                    isActive ? "bg-[#FF6B6B] opacity-100" : "opacity-0",
                  ].join(" ")}
                />
                <span>{item.label}</span>
                {item.badge ? (
                  <span className="ml-auto rounded-sm border border-[#FF6B6B]/30 bg-[#FF6B6B]/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#FF6B6B]">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-10 border-t border-white/5 pt-6">
          <a
            href="https://gravixar.com"
            rel="noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 hover:text-zinc-200"
          >
            gravixar.com →
          </a>
        </div>
      </div>
    </aside>
  );
}

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

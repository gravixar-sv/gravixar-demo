import type { CSSProperties } from "react";
import { Topbar } from "@/components/demo/Topbar";
import { SiteFooter } from "@/components/demo/SiteFooter";
import { SceneGlyph } from "@/components/demo/SceneLayout";
import { SCENES } from "@/lib/scenes";
import { numberWord } from "@/lib/modules";

// Catches stale inbound links, including the retired /verus and
// /coming-soon URLs. It deliberately does NOT say "maybe it's coming
// online next": that sentence used to re-promise the exact scene the
// roster dropped, to the one visitor most likely to be chasing it. It
// offers the live scenes instead.
export default function NotFound() {
  const live = SCENES.filter((s) => s.status === "live");
  return (
    <div style={{ "--color-scene-1": "#FF6B5E", "--color-scene-glow": "rgba(255,107,94,0.34)" } as CSSProperties}>
      <Topbar />
      <main id="main" className="scene-ground mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 md:py-32">
        <p className="label-mono">404</p>
        <h1 className="display mt-5 text-5xl text-ink-50 md:text-6xl">That scene doesn&apos;t exist.</h1>
        <p className="mt-5 text-lg text-ink-400">
          {numberWord(live.length)} scenes are live, and every one of them opens without a sign-in.
        </p>
        <ul className="mx-auto mt-10 grid max-w-md gap-2 text-left">
          {live.map((s) => (
            <li key={s.slug}>
              <a
                href={`/${s.slug}`}
                data-spot
                className="item group flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ "--color-scene-1": s.theme.accent } as CSSProperties}
              >
                <SceneGlyph scene={s} size="sm" />
                <span className="text-sm font-medium text-ink-100">{s.name}</span>
                <span className="text-sm text-ink-500">{s.codename}</span>
                <span aria-hidden className="ml-auto text-ink-500 transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
        <a href="/" className="btn btn-quiet mt-8">
          ← All scenes
        </a>
      </main>
      <SiteFooter />
    </div>
  );
}

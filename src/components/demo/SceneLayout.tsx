import type { CSSProperties, ReactNode } from "react";
import { SCENES, findScene, type Scene } from "@/lib/scenes";
import { ButtonLink } from "@/components/ui/Button";
import { SiteFooter } from "@/components/demo/SiteFooter";

// Every scene page renders inside this. It sets the scene's tokens
// inline on its root (there are no per-scene palette classes), draws the
// accent horizon behind the page, and carries the scene bar: the way
// back, the scene's identity, a switcher to the other four, and the one
// outward CTA.
export function SceneLayout({ slug, children }: { slug: string; children: ReactNode }) {
  const scene = findScene(slug);
  if (!scene) throw new Error(`SceneLayout: unknown scene ${slug}`);
  const vars = {
    "--color-scene-1": scene.theme.accent,
    "--color-scene-2": scene.theme.accent2,
    "--color-scene-glow": scene.theme.glow,
  } as CSSProperties;
  return (
    <div style={vars} className="scene-ground min-h-dvh">
      <SceneBar scene={scene} />
      <main id="main" className="mx-auto max-w-[1440px] px-4 pb-8 pt-8 sm:px-6 md:pt-10 lg:px-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

/** The scene's product mark: a lit square with its glyph. */
export function SceneGlyph({ scene, size = "md" }: { scene: Scene; size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-5 w-5 rounded-[6px] text-sm" : "h-7 w-7 rounded-lg text-sm";
  return (
    <span
      aria-hidden
      className={`relative inline-flex shrink-0 items-center justify-center font-semibold text-ink-950 ${box}`}
      style={{
        background: `linear-gradient(145deg, ${scene.theme.accent} 0%, color-mix(in oklab, ${scene.theme.accent} 55%, ${scene.theme.accent2}) 100%)`,
        boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.4), 0 4px 14px -4px ${scene.theme.glow}`,
      }}
    >
      {scene.glyph}
    </span>
  );
}

function SceneBar({ scene }: { scene: Scene }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink-950/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <a
          href="/"
          aria-label="All scenes"
          className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg pr-2 text-sm text-ink-300 transition-colors hover:text-ink-50"
        >
          <span
            aria-hidden
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 transition-[transform,border-color] duration-200 group-hover:-translate-x-0.5 group-hover:border-white/25"
          >
            ←
          </span>
          <span className="hidden whitespace-nowrap sm:inline xl:hidden 2xl:inline">All scenes</span>
        </a>
        <span aria-hidden className="h-5 w-px bg-line-strong" />
        <div className="flex min-w-0 items-center gap-2.5">
          <SceneGlyph scene={scene} />
          {/* One name, the product's. The sample brand's name lives in the
              workspace header below, where it is the app's own. */}
          <p className="min-w-0 truncate text-base font-semibold text-ink-50">{scene.name}</p>
        </div>

        <nav aria-label="Other scenes" className="mx-auto hidden xl:block">
          <ul className="flex items-center gap-1 rounded-full border border-line bg-white/[0.02] p-1">
            {SCENES.filter((s) => s.status === "live").map((s) => {
              const current = s.slug === scene.slug;
              return (
                <li key={s.slug}>
                  <a
                    href={`/${s.slug}`}
                    aria-current={current ? "page" : undefined}
                    className={`group flex min-h-9 items-center gap-2 whitespace-nowrap rounded-full px-3 text-sm transition-colors duration-200 ${
                      current
                        ? "bg-white/[0.08] text-ink-50"
                        : "text-ink-400 hover:bg-white/[0.04] hover:text-ink-100"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full transition-transform duration-200 group-hover:scale-150"
                      style={{ background: s.theme.accent, boxShadow: current ? `0 0 10px ${s.theme.glow}` : undefined }}
                    />
                    {s.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-0">
          <a
            href="https://gravixar.com"
            rel="noreferrer"
            className="hidden whitespace-nowrap px-2 text-sm text-ink-400 transition-colors hover:text-ink-100 md:inline xl:hidden 2xl:inline"
          >
            gravixar.com
          </a>
          <ButtonLink href="https://gravixar.com/contact" external variant="primary" arrow>
            Book a call
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}

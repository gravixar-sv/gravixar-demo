// The scene portals. One card per buyer, and one name per card: the
// product name, a one-line description, who it is for, and an Open
// button. No screenshot, no sample-brand codename, no letter badge, so
// the card is quick to read and the action is obvious. The whole card is
// the link, so a click anywhere on it opens that scene. Each card carries
// its own scene's tokens, so its light, its edge and its button speak in
// that scene's colour. Cards rise in on scroll (CSS-first reveal).

import { useRef, type CSSProperties } from "react";
import { SCENES, type Scene } from "@/lib/scenes";
import { useReveal } from "@/lib/useReveal";

// From lg up: two wide cards, then three. Registry order.
const SPANS = ["lg:col-span-3", "lg:col-span-3", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2"];

export function SceneGallery() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);

  // Only genuinely clickable scenes reach the gallery.
  const live = SCENES.filter((s) => s.status === "live");

  return (
    <section id="scenes" ref={scope} className="relative scroll-mt-16" aria-labelledby="scenes-heading">
      <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 md:py-32 lg:px-10">
        <header data-reveal className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-end">
          <div>
            <p className="eyebrow">The scenes</p>
            <h2 id="scenes-heading" className="display mt-4 max-w-[18ch] text-4xl text-ink-50 md:text-5xl">
              Five working apps. Pick the one closest to your desk.
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-ink-300 md:text-lg">
            Each one is real software on sample data, not a recording. Click in, press the buttons, and watch the
            loop run. Reload and it starts over.
          </p>
        </header>

        <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-6 lg:gap-6">
          {live.map((scene, i) => (
            <li
              key={scene.slug}
              data-reveal
              style={{ "--reveal-delay": `${(i % 3) * 70}ms` } as CSSProperties}
              className={SPANS[i] ?? "lg:col-span-2"}
            >
              <SceneCard scene={scene} wide={i < 2} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SceneCard({ scene, wide }: { scene: Scene; wide: boolean }) {
  const vars = {
    "--color-scene-1": scene.theme.accent,
    "--color-scene-2": scene.theme.accent2,
    "--color-scene-glow": scene.theme.glow,
  } as CSSProperties;

  return (
    <a
      href={`/${scene.slug}`}
      style={vars}
      data-spot
      className="card-link group surface relative flex h-full flex-col overflow-hidden rounded-[20px] p-6 transition-[border-color,box-shadow] duration-300 hover:border-[color-mix(in_oklab,var(--color-scene-1)_45%,transparent)] hover:shadow-[0_40px_80px_-40px_var(--color-scene-glow)] md:p-8"
    >
      {/* The scene's colour as a soft light along the top edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background:
            "radial-gradient(70% 100% at 30% 0%, color-mix(in oklab, var(--color-scene-1) 16%, transparent), transparent 75%)",
        }}
      />
      <h3 className={`heading text-ink-50 ${wide ? "text-2xl md:text-3xl" : "text-2xl"}`}>{scene.name}</h3>
      <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-ink-300 md:text-lg">{scene.whatItIs}.</p>
      <p className="mt-4 text-sm font-medium text-ink-400">For {scene.personaLabel}</p>
      {/* A picture of a button, not a control: the card itself is the link. */}
      <span className="mt-auto pt-8">
        <span className="btn btn-primary">
          {scene.openLabel}
          <span aria-hidden className="btn-arrow">
            →
          </span>
        </span>
      </span>
    </a>
  );
}

// The scene portals. Real captured screenshots of each scene (the
// product does the talking), one buyer per card, one concrete promise
// per card. A bento: the featured scene is wide, the rest share the
// rows. Each card carries its own scene's tokens, so its light, its
// edge and its button speak in that scene's colour; on a fine pointer
// it tilts toward the cursor and the screenshot parallaxes inside the
// frame. Cards rise in on scroll (CSS-first reveal).

import { useRef, type CSSProperties } from "react";
import { SCENES, type Scene } from "@/lib/scenes";
import { useReveal } from "@/lib/useReveal";
import { useTilt } from "@/lib/interactions";
import { SceneGlyph } from "@/components/demo/SceneLayout";
import geometry from "../../../public/scenes/geometry.json";

type Box = { x: number; y: number; w: number; h: number };
const SCENE_GEOMETRY = geometry.scenes as Record<string, { frame: Box } | null>;

// Where the card's picture window sits on the 1600x1000 capture: the
// workspace frame's top-left, measured by `pnpm capture:scenes`. Wide
// cards show more of the board, the row of three a closer two panes;
// either way the window never runs past the bottom of the capture.
// Returned as percentages of the card's own box, so the same pixels
// fill the frame at every width.
function framing(slug: string, wide: boolean, aspect: number): CSSProperties {
  const frame = SCENE_GEOMETRY[slug]?.frame ?? { x: 120, y: 400, w: 1360, h: 600 };
  const pad = 20;
  const wanted = (wide ? 1120 : 900) + pad * 2;
  const room = (geometry.viewport.h - (frame.y - pad)) * aspect;
  const regionW = Math.min(wanted, room);
  const regionH = regionW / aspect;
  const x = frame.x - pad;
  const y = frame.y - pad;
  return {
    width: `${(geometry.viewport.w / regionW) * 100}%`,
    left: `${(-x / regionW) * 100}%`,
    top: `${(-y / regionH) * 100}%`,
  };
}

// From lg up: two wide cards, then three. Registry order.
const SPANS = ["lg:col-span-3", "lg:col-span-3", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2"];

export function SceneGallery() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);

  // Only genuinely clickable scenes reach the gallery.
  const live = SCENES.filter((s) => s.status === "live");

  return (
    <section id="scenes" ref={scope} className="relative scroll-mt-14" aria-labelledby="scenes-heading">
      <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 md:py-32 lg:px-10">
        <header data-reveal className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
          <div>
            <p className="eyebrow">The scenes</p>
            <h2 id="scenes-heading" className="display mt-4 max-w-[16ch] text-4xl text-ink-50 md:text-6xl">
              Five working apps. Pick the one closest to your desk.
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-ink-400">
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
              <SceneCard scene={scene} wide={i < 2} eager={i < 2} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SceneCard({ scene, wide, eager }: { scene: Scene; wide: boolean; eager: boolean }) {
  const card = useRef<HTMLAnchorElement>(null);
  useTilt(card, wide ? 3.5 : 5);
  const vars = {
    "--color-scene-1": scene.theme.accent,
    "--color-scene-2": scene.theme.accent2,
    "--color-scene-glow": scene.theme.glow,
  } as CSSProperties;

  return (
    <a
      ref={card}
      href={`/${scene.slug}`}
      style={vars}
      data-spot
      className="group surface relative flex h-full flex-col overflow-hidden rounded-[22px] p-2 transition-[border-color,box-shadow] duration-300 hover:border-[color-mix(in_oklab,var(--color-scene-1)_45%,transparent)] hover:shadow-[0_40px_80px_-40px_var(--color-scene-glow)]"
    >
      <div
        className={`relative overflow-hidden rounded-[16px] border border-line bg-ink-925 ${
          wide ? "aspect-[16/9]" : "aspect-[16/10]"
        }`}
      >
        {/* The accent horizon behind the shot, so the frame is lit in the scene's colour. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 0%, color-mix(in oklab, var(--color-scene-1) 25%, transparent), transparent 70%)",
          }}
        />
        {/* The capture is the whole 1600x1000 scene view; the card frames
            its workspace (see framing()), so the picture is the app, not
            the scene's intro copy. The wrapper zooms on hover, the image
            inside parallaxes with the tilt (data-depth), so the two
            transforms never fight. */}
        <div className="absolute inset-0 origin-top transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.03]">
          <img
            data-depth="8"
            src={`/scenes/${scene.slug}.webp`}
            alt={`${scene.name}: ${scene.whatItIs}`}
            width={1600}
            height={1000}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            style={framing(scene.slug, wide, wide ? 16 / 9 : 16 / 10)}
            className="absolute h-auto max-w-none"
          />
        </div>
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-950/90 to-transparent" />
        <span className="chip absolute bottom-3 left-3 border-white/15 bg-ink-950/70 backdrop-blur">
          <span aria-hidden className="live-dot text-emerald-400" />
          live
        </span>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-5 md:px-4">
        <div className="flex items-center gap-2.5">
          <SceneGlyph scene={scene} size="sm" />
          <h3 className={`heading text-ink-50 ${wide ? "text-2xl md:text-[1.75rem]" : "text-xl"}`}>
            {scene.name}
          </h3>
          <span className="text-sm text-ink-500">{scene.codename}</span>
        </div>
        <p className={`mt-2.5 leading-relaxed text-ink-400 ${wide ? "max-w-[60ch] text-base" : "text-[0.9375rem]"}`}>
          {scene.whatItIs}. {scene.tryLine}.
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          <span className="chip">For {scene.personaLabel}</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-scene-soft transition-colors duration-200 group-hover:text-white">
            <span className="link-draw">{scene.openLabel}</span>
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </div>
    </a>
  );
}

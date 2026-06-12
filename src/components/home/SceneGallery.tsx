"use client";

// The four scene portals. Real captured screenshots in neutral window
// frames (the product does the talking), one buyer per card, one
// concrete promise per card. Desktop is a 2x2 grid with a broken
// vertical rhythm; cards rise in on scroll.

import { useRef } from "react";
import Link from "next/link";
import { SCENES, type Scene } from "@/lib/scenes";
import { ScenePreview } from "@/components/demo/ScenePreview";
import { useReveal } from "@/lib/useReveal";

export function SceneGallery() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);

  const live = SCENES.filter((s) => s.status === "live");
  const upcoming = SCENES.find((s) => s.status === "coming-online");

  return (
    <section
      id="scenes"
      ref={scope}
      className="relative border-t border-white/5"
      aria-labelledby="scenes-heading"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32 lg:px-12">
        <header data-reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#ff6b6b]">
              the scenes
            </p>
            <h2
              id="scenes-heading"
              className="mt-4 text-3xl font-medium leading-[1.06] tracking-[-0.03em] text-zinc-50 md:text-5xl"
            >
              Pick the scene closest to your desk.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400">
              Each one is a real app, not a recording. Click in, press the
              buttons, watch the loop run.
            </p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
            sandbox · resets every Sunday
          </p>
        </header>

        <div className="mt-14 grid gap-6 md:grid-cols-2 md:gap-x-6 md:gap-y-10">
          {live.map((scene, i) => (
            <SceneCard key={scene.slug} scene={scene} offset={i % 2 === 1} priority={i < 2} />
          ))}
        </div>

        {upcoming ? (
          <p data-reveal className="mt-12 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
            next to come online: {upcoming.name}, {upcoming.whatItIs.toLowerCase()}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function SceneCard({
  scene,
  offset,
  priority,
}: {
  scene: Scene;
  offset: boolean;
  priority: boolean;
}) {
  const accent = scene.swatches[1];

  return (
    <Link
      href={`/${scene.slug}`}
      data-reveal
      className={`group block rounded-2xl p-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff6b6b] ${
        offset ? "md:mt-8" : ""
      }`}
    >
      <ScenePreview scene={scene} priority={priority} sizes="(min-width: 768px) 50vw, 100vw" />

      <div className="px-2 pb-2 pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h3 className="text-xl font-medium tracking-[-0.015em] text-zinc-50 md:text-2xl">
            {scene.name}
            <span className="ml-3 text-sm font-normal tracking-normal text-zinc-500">
              {scene.whatItIs}
            </span>
          </h3>
          <span
            className="rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em]"
            style={{ borderColor: `${accent}40`, color: accent }}
          >
            for {scene.personaLabel}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/5 pt-4">
          <p className="text-sm leading-relaxed text-zinc-400">{scene.tryLine}</p>
          <span
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium transition-colors duration-200 group-hover:text-white"
            style={{ color: accent }}
          >
            {scene.openLabel}
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

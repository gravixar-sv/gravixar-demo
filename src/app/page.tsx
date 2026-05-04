import Link from "next/link";
import { SCENES } from "@/lib/scenes";

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Pick a scene",
    body: "Each scene is a different client + visual identity, with its own data model and persona set.",
  },
  {
    n: "02",
    title: "Sign in as a persona",
    body: "No password, no signup. Click a persona card and you drop into their view of the system.",
  },
  {
    n: "03",
    title: "Try the loop, reset anytime",
    body: "Each persona has one closed loop to try. Hit reset in the topbar to start over with fresh seed data.",
  },
] as const;

export default function GalleryLanding() {
  const live = SCENES.filter((s) => s.status === "live");
  const coming = SCENES.filter((s) => s.status === "coming-online");

  return (
    <main className="bg-gallery min-h-[calc(100dvh-40px)] pb-24">
      {/* Hero */}
      <section className="relative px-6 pb-16 pt-16 md:px-10 md:pt-24 lg:px-16 lg:pt-32">
        <div
          aria-hidden
          className="bg-dot-grid pointer-events-none absolute inset-0 opacity-40"
        />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                gravixar, demo gallery
              </p>
              <h1 className="mt-6 text-5xl font-medium leading-[0.98] tracking-[-0.02em] text-zinc-50 md:text-7xl lg:text-[80px]">
                Pick a portal.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B6B] to-[#00E1FF]">
                  Click around.
                </span>
              </h1>
            </div>
            <div className="lg:col-span-4 lg:pt-6">
              <p className="max-w-md text-lg leading-relaxed text-zinc-300 md:text-xl">
                A working showroom of the kinds of systems Gravixar builds.
                Each scene is a real running portal with personas you sign in
                as and AI that actually responds.
              </p>
              <p className="mt-4 max-w-md font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                weekly seed reset · interactive · no signup
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative px-6 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              how this demo works
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
              90-second walkthrough
            </p>
          </div>
          <ol className="grid gap-4 md:grid-cols-3 md:gap-5">
            {HOW_IT_WORKS.map((step) => (
              <li key={step.n} className="scene-card rounded-2xl p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  step {step.n}
                </p>
                <h3 className="mt-3 text-lg font-medium tracking-[-0.01em] text-zinc-100">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Live scenes */}
      <section className="relative mt-16 px-6 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-2xl font-medium tracking-[-0.015em] md:text-3xl">
              Live now
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              {live.length} scene{live.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            {live.map((scene, i) => (
              <SceneCard key={scene.slug} scene={scene} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Coming online */}
      <section className="relative mt-16 px-6 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-2xl font-medium tracking-[-0.015em] md:text-3xl">
              Coming online
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              {coming.length} in build
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            {coming.map((scene) => (
              <ComingSoonCard key={scene.slug} scene={scene} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-24 px-6 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl border-t border-white/5 pt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              gravixar, operations, ai tooling, brand &amp; visuals
            </p>
            <Link
              href="https://gravixar.com"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 hover:text-white"
            >
              gravixar.com →
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function SceneCard({
  scene,
  index,
}: {
  scene: (typeof SCENES)[number];
  index: number;
}) {
  return (
    <Link
      href={`/${scene.slug}`}
      className="scene-card group relative block overflow-hidden rounded-2xl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 transition-opacity group-hover:opacity-70"
        style={{
          background: `radial-gradient(70% 80% at 100% 0%, ${scene.swatches[1]}28 0%, transparent 60%), radial-gradient(50% 80% at 0% 100%, ${scene.swatches[2]}1a 0%, transparent 55%)`,
        }}
      />
      <div className="relative px-7 pb-7 pt-7 md:px-9 md:pt-9 md:pb-9">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            {String(index + 1).padStart(2, "0")} / {scene.bucket}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/90">
            <span
              className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 text-emerald-400"
            />
            live
          </span>
        </div>
        <h3 className="mt-8 text-3xl font-medium leading-tight tracking-[-0.015em] md:text-4xl">
          {scene.name}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-300 md:text-base">
          {scene.tagline}
        </p>
        <p className="mt-4 max-w-md text-xs leading-relaxed text-zinc-500">
          {scene.description}
        </p>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-1.5">
            {scene.swatches.map((c, i) => (
              <span
                key={`${c}-${i}`}
                className="h-5 w-5 rounded-full border border-white/15"
                style={{ background: c }}
                aria-hidden
              />
            ))}
          </div>
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-200 transition-colors group-hover:text-white">
            enter scene
            <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function ComingSoonCard({ scene }: { scene: (typeof SCENES)[number] }) {
  return (
    <div className="scene-card relative overflow-hidden rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
          {scene.bucket}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-zinc-500 text-zinc-500" />
          coming online
        </span>
      </div>
      <h3 className="mt-6 text-2xl font-medium tracking-[-0.015em] text-zinc-300 md:text-3xl">
        {scene.name}
      </h3>
      <p className="mt-2 text-sm text-zinc-500">{scene.tagline}</p>
      <div className="mt-5 flex gap-1.5">
        {scene.swatches.map((c, i) => (
          <span
            key={`${c}-${i}`}
            className="h-4 w-4 rounded-full border border-white/10 opacity-50"
            style={{ background: c }}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}

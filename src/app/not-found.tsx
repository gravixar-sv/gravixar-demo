import Link from "next/link";
import { SCENES } from "@/lib/scenes";
import { numberWord } from "@/lib/modules";

// This page catches stale inbound links, including the retired /verus and
// /coming-soon URLs. It deliberately does NOT say "maybe it's coming online
// next": that sentence used to re-promise the exact scene the roster just
// dropped, to the one visitor most likely to be chasing it.
export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
        404
      </p>
      <h1 className="mt-4 text-4xl font-medium tracking-[-0.015em] md:text-5xl">
        That scene doesn&apos;t exist.
      </h1>
      <p className="mt-3 text-zinc-400">
        {numberWord(SCENES.length)} scenes are live, and every one of them
        opens without a sign-in.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-10 items-center justify-center rounded-md border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-zinc-200 transition-[color,border-color,transform] duration-150 hover:border-white/20 active:scale-[0.98] lg:min-h-0"
      >
        ← all scenes
      </Link>
    </div>
  );
}

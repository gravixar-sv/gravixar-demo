import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
        404
      </p>
      <h1 className="mt-4 font-display-serif text-4xl font-light tracking-tight md:text-5xl">
        That scene doesn&apos;t exist.
      </h1>
      <p className="mt-3 text-zinc-400">
        Maybe it&apos;s coming online next. Head back to the gallery.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-md border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-zinc-200 hover:border-white/20"
      >
        ← gallery
      </Link>
    </div>
  );
}

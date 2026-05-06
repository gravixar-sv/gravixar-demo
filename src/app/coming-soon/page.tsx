// Public holding page shown while the demo is paused. Middleware
// rewrites every other route here. To unpause: revert the PR that
// added src/middleware.ts.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo back soon, Gravixar",
  description:
    "demo.gravixar.com is briefly offline while we polish. Visit gravixar.com in the meantime.",
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return (
    <main className="bg-gallery flex min-h-[calc(100dvh-40px)] flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
        gravixar, demo
      </p>
      <h1 className="mt-6 text-4xl font-medium leading-[1.05] tracking-[-0.02em] text-zinc-50 md:text-6xl">
        Back online soon.
      </h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-300 md:text-lg">
        We&apos;re polishing the showroom before opening it to the public.
        Check back shortly, or have a look at the marketing site in the
        meantime.
      </p>

      <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href="https://gravixar.com"
          className="inline-flex flex-1 items-center justify-center rounded-md border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium text-zinc-100 transition-colors hover:border-white/30 hover:bg-white/[0.08]"
        >
          Visit gravixar.com →
        </a>
        <a
          href="https://gravixar.com/contact"
          className="inline-flex flex-1 items-center justify-center rounded-md border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium text-zinc-100 transition-colors hover:border-white/30 hover:bg-white/[0.08]"
        >
          Get in touch →
        </a>
      </div>

      <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
        thanks for waiting
      </p>
    </main>
  );
}

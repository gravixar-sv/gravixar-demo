"use client";

// The credibility close. The demo borrows its spine from systems that
// are actually in production (Gravixar's own ops + client builds), so
// say that plainly, list the real module vocabulary, and offer the
// one next step.

import { useRef } from "react";
import { useReveal } from "@/lib/useReveal";

// Real production modules, straight from the fleet's module registry.
const MODULES = [
  "append-only audit trail",
  "human approval gates",
  "passkey + TOTP step-up",
  "lead-inbox ingestion",
  "LLM eval harness",
  "per-project QA scorecard",
];

export function ProofStrip() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);

  return (
    <section
      ref={scope}
      className="relative border-t border-white/5"
      aria-labelledby="proof-heading"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-28 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div>
            <p data-reveal className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#ff6b6b]">
              not a concept reel
            </p>
            <h2
              id="proof-heading"
              data-reveal className="mt-4 text-3xl font-medium leading-[1.08] tracking-[-0.03em] text-zinc-50 md:text-4xl"
            >
              The same loop runs Gravixar&apos;s own ops.
            </h2>
            <p data-reveal className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400">
              The scenes borrow their spine from production systems: agency
              portals, finance cockpits, and brand agents shipped for real
              clients, plus the platform Gravixar runs itself on. Same gates,
              same audit trail, same rulebook.
            </p>
            <ul data-reveal className="mt-7 flex flex-wrap gap-2.5">
              {MODULES.map((m) => (
                <li
                  key={m}
                  className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400"
                >
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal className="flex flex-col justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-8 md:p-10">
            <h3 className="text-2xl font-medium tracking-[-0.02em] text-zinc-50">
              Want this loop on{" "}
              <span className="text-[#ff6b6b]">your ops?</span>
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              One call to scope it. Most builds run 4 to 8 weeks, owned by
              you, gated by your people.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href="https://gravixar.com/contact"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#ff6b6b] px-5 py-3 text-sm font-semibold text-[#160808] transition-[transform,filter] duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b6b] active:scale-[0.98]"
              >
                Book a 30-min call
                <span aria-hidden>→</span>
              </a>
              <a
                href="https://gravixar.com"
                rel="noreferrer"
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-200"
              >
                gravixar.com →
              </a>
            </div>
          </div>
        </div>

        <p data-reveal className="mt-16 border-t border-white/5 pt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
          sandbox · sample data · resets every Sunday · no sign-in · nothing
          you press here leaves the page
        </p>
      </div>
    </section>
  );
}

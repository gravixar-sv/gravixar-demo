// The credibility close. The demo borrows its spine from systems that
// are actually in production (Gravixar's own ops and client builds), so
// say that plainly, run the real module vocabulary past as a ribbon, and
// offer the one next step.

import { useRef } from "react";
import { useReveal } from "@/lib/useReveal";
import { useMagnetic } from "@/lib/interactions";
import { INTERACTIVE_COUNT, numberWord } from "@/lib/modules";

// What the production modules do, in plain words. Each line is one of
// the fleet's real modules (audit trail, approval gates, passkey + TOTP
// step-up, provider credentialing, the HIPAA-aware AI guardrail, lead
// ingestion, the LLM eval harness, the per-project QA scorecard).
const MODULES = [
  "Every action is logged",
  "Nothing goes out without your approval",
  "Secure sign-in",
  "Provider credentials checked",
  "Healthcare-safe AI",
  "New leads land in one inbox",
  "AI answers tested before they ship",
  "Quality checks on every project",
];

export function ProofStrip() {
  const scope = useRef<HTMLElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);
  useReveal(scope);
  useMagnetic(cta, 0.22);

  return (
    <section ref={scope} className="relative border-t border-line" aria-labelledby="proof-heading">
      {/* The module ribbon. The second copy exists only to make the loop
          seamless, so it is hidden from assistive tech. */}
      <div className="marquee-wrap relative overflow-hidden border-b border-line py-5 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="marquee flex w-max gap-3">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-3">
              {MODULES.map((m) => (
                <li key={m} className="chip px-4 py-2 text-base text-ink-200">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-scene" />
                  {m}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 md:py-32 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <p data-reveal className="eyebrow">
              Not a concept reel
            </p>
            <h2 id="proof-heading" data-reveal className="display mt-4 text-4xl text-ink-50 md:text-5xl">
              The same loop runs Gravixar&apos;s own ops.
            </h2>
            <p data-reveal className="mt-6 max-w-xl text-base leading-relaxed text-ink-300 md:text-lg">
              The scenes borrow their spine from production systems: agency portals, finance cockpits, brand agents
              and a HIPAA-conscious medical-billing portal shipped for real clients, plus the platform Gravixar runs
              itself on. Same gates, same audit trail, same rulebook.
            </p>
            <p data-reveal className="mt-8">
              <a href="/modules" className="group inline-flex min-h-11 items-center gap-2 text-base font-semibold text-scene-soft hover:text-white">
                <span className="link-draw">
                  Try {numberWord(INTERACTIVE_COUNT).toLowerCase()} of the modules in isolation
                </span>
                <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </p>
          </div>

          <div data-reveal className="frame relative flex flex-col justify-center overflow-hidden rounded-[26px] p-8 md:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4"
              style={{
                background:
                  "radial-gradient(70% 100% at 50% 100%, color-mix(in oklab, var(--color-scene-1) 24%, transparent), transparent 70%)",
              }}
            />
            {/* Centred: the card is the page's last ask, one column, one button. */}
            <div className="relative flex flex-col items-center text-center">
              <h3 className="display text-3xl text-ink-50 md:text-[2.5rem]">
                Want this loop on <span className="voice text-scene-soft">your ops?</span>
              </h3>
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink-300 md:text-lg">
                One call to scope it. Most builds run 4 to 8 weeks, owned by you, gated by your people.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4">
                <a ref={cta} href="https://gravixar.com/contact" rel="noreferrer" className="btn btn-primary btn-lg">
                  Book a 30-min call
                  <span aria-hidden className="btn-arrow">
                    →
                  </span>
                </a>
                <a href="https://gravixar.com" rel="noreferrer" className="link-draw text-base text-ink-300 hover:text-ink-50">
                  gravixar.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

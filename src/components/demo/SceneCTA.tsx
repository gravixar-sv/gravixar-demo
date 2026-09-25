// The closing panel of every scene: the bridge from "I pressed the
// buttons" to a real conversation. The accent rises from the bottom
// edge like the scene's horizon, and the call button leans toward the
// pointer.

import { useRef, type ReactNode } from "react";
import { useMagnetic } from "@/lib/interactions";

export function SceneCTA({
  personaLabel,
  noun,
  headline,
  blurb,
}: {
  /** Who this is for, e.g. "Brands & DTC". */
  personaLabel: string;
  /** Word after the default "Want this for your …?" headline. */
  noun?: string;
  /** Scene-specific headline. Defaults to "Want this for your {noun}?". */
  headline?: ReactNode;
  /** Scene-specific supporting line under the headline. */
  blurb?: string;
}) {
  const cta = useRef<HTMLAnchorElement>(null);
  useMagnetic(cta, 0.22);
  const ctaNoun = noun ?? personaLabel.toLowerCase();
  return (
    <section
      aria-labelledby="scene-cta-heading"
      className="frame relative mt-16 overflow-hidden rounded-[26px] px-6 py-12 md:mt-24 md:px-12 md:py-16"
    >
      <div aria-hidden className="bg-dot-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 100%, color-mix(in oklab, var(--color-scene-1) 26%, transparent), transparent 70%)",
        }}
      />
      <div aria-hidden className="absolute inset-x-[15%] bottom-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-scene-1),transparent)]" />

      <div className="relative grid items-end gap-10 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="max-w-2xl">
          <p className="eyebrow text-scene-soft">{personaLabel}, built by Gravixar</p>
          <h2 id="scene-cta-heading" className="display mt-4 text-4xl text-ink-50 md:text-[3.25rem]">
            {headline ?? (
              <>
                Want this for your <span className="voice font-normal text-scene-soft">{ctaNoun}?</span>
              </>
            )}
          </h2>
          <p className="mt-5 max-w-[58ch] text-base leading-relaxed text-ink-400">
            {blurb ??
              "I build systems like this from scratch, scoped to your workflow and owned by you. Most engagements run 4 to 8 weeks. One call to scope it, no obligation."}
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <a
            ref={cta}
            href="https://gravixar.com/contact"
            rel="noreferrer"
            className="btn btn-primary btn-lg px-7 py-4 text-base"
          >
            Book a 30-min call
            <span aria-hidden className="btn-arrow">
              →
            </span>
          </a>
          <a href="https://gravixar.com" rel="noreferrer" className="link-draw text-sm text-ink-400 hover:text-ink-100">
            or read more at gravixar.com
          </a>
        </div>
      </div>
    </section>
  );
}

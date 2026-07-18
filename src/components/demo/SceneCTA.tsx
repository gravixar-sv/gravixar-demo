// Persistent call-to-action shown at the bottom of every scene page.
// Visitor has just seen what Gravixar builds for their context —
// this is the bridge to a real conversation.

import type { ReactNode } from "react";

export function SceneCTA({
  personaLabel,
  noun,
  headline,
  blurb,
}: {
  /** Shown in the eyebrow, e.g. "Brands & DTC". */
  personaLabel: string;
  /** Clean word after the default "Want this for your …?" headline.
   *  Defaults to the lowercased label. */
  noun?: string;
  /** Scene-specific headline. Defaults to "Want this for your {noun}?". */
  headline?: ReactNode;
  /** Scene-specific supporting line under the headline. */
  blurb?: string;
}) {
  const ctaNoun = noun ?? personaLabel.toLowerCase();
  return (
    <section className="mt-16 overflow-hidden rounded-2xl" aria-labelledby="scene-cta-heading">
      <div
        className="relative px-7 py-8 md:px-10 md:py-10"
        style={{
          // Scene-tinted wash: same 6%/4% weights as the old coral→cyan
          // hard-code, but drawn from the scene tokens so the closing CTA
          // stays on-palette in every scene.
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--color-scene-1, #FF6B6B) 6%, transparent) 0%, color-mix(in oklab, var(--color-scene-2, #00E1FF) 4%, transparent) 100%)",
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.08), 0 1px 0 0 rgba(255,255,255,0.02)",
        }}
      >
        {/* Subtle dot grid texture */}
        <div
          aria-hidden
          className="bg-dot-grid pointer-events-none absolute inset-0 opacity-[0.12]"
        />

        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Left — copy */}
          <div className="max-w-lg">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-scene-1,#FF6B6B)]">
              {personaLabel} · built by Gravixar
            </p>
            <h2
              id="scene-cta-heading"
              className="mt-3 text-2xl font-medium leading-tight tracking-[-0.02em] text-zinc-50 md:text-3xl"
            >
              {headline ?? (
                <>
                  Want this for your{" "}
                  <span style={{ color: "var(--color-scene-1, #FF6B6B)" }}>
                    {ctaNoun}?
                  </span>
                </>
              )}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              {blurb ??
                "I build systems like this from scratch, scoped to your workflow and owned by you. Most engagements run 4 to 8 weeks. One call to scope it, no obligation."}
            </p>
          </div>

          {/* Right — CTA */}
          <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
            <a
              href="https://gravixar.com/contact"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-[#0a0a0a] shadow-lg shadow-black/30 transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-scene-1, #FF6B6B) 0%, var(--color-scene-2, #FF2D95) 100%)",
              }}
            >
              Book a 30-min call
              <span aria-hidden>→</span>
            </a>
            <a
              href="https://gravixar.com"
              rel="noreferrer"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-300"
            >
              gravixar.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

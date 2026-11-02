
// "Every scene runs the same loop" — the four beats of the approval
// loop, told as a scroll-driven story. The beats scroll on the left;
// a console panel stays pinned on the right (CSS sticky, bulletproof
// across viewports) and morphs its contents as each beat activates.
// Activation is GSAP ScrollTrigger (scroll math is where it earns its
// place); the visible motion itself is CSS, so nothing is stranded
// invisible if a ticker never runs. Small screens give each beat its
// own inline panel.

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";

type Beat = {
  key: string;
  index: string;
  title: string;
  body: string;
  sceneTags: string[];
};

const BEATS: Beat[] = [
  {
    key: "arrive",
    index: "01",
    title: "Work arrives",
    body: "An inbox, a brief, a request queue. The unsorted pile every team wakes up to.",
    sceneTags: ["Founder Cockpit inbox", "Care Ledger intake", "Agency OS handoffs"],
  },
  {
    key: "draft",
    index: "02",
    title: "AI drafts the 80%",
    body: "Triage, first cuts, classifications, replies. The agent does the typing, in your tone, against your data.",
    sceneTags: ["Agent Console agents", "Founder Cockpit drafts"],
  },
  {
    key: "gate",
    index: "03",
    title: "You hold the gate",
    body: "Nothing publishes, ships, or spends without a human approve. The gate is the product, not a checkbox.",
    sceneTags: ["Agent Console queue", "Care Ledger claims gate", "Agency OS review loop"],
  },
  {
    key: "learn",
    index: "04",
    title: "It learns your rules",
    body: "Every approve and send-back becomes a house rule. The agent gets more yours every week, and the rulebook is yours to read.",
    sceneTags: ["Brand Guardian memory", "Every scene's rulebook"],
  },
];

export function LoopSection() {
  const scope = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useReveal(scope);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const triggers = BEATS.map((beat, i) =>
          ScrollTrigger.create({
            trigger: `[data-beat="${beat.key}"]`,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (self) => self.isActive && setActive(i),
          }),
        );
        // The rail fills as the beats scroll past (scrubbed scaleY).
        const fill = gsap.fromTo(
          "[data-rail-fill]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: "[data-beats]", start: "top 55%", end: "bottom 55%", scrub: 0.3 },
          },
        );
        return () => {
          triggers.forEach((t) => t.kill());
          fill.scrollTrigger?.kill();
          fill.kill();
        };
      });
    },
    { scope },
  );

  return (
    <section id="loop" ref={scope} className="relative scroll-mt-14 border-t border-line" aria-labelledby="loop-heading">
      <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 md:py-32 lg:px-10">
        <header data-reveal className="max-w-3xl">
          <p className="eyebrow">The loop</p>
          <h2 id="loop-heading" className="display mt-4 text-4xl text-ink-50 md:text-5xl">
            Every scene runs the same loop.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-300 md:text-lg">
            Different buyers, different workflows, one spine. Scroll it once here, then go run it for real in any
            scene.
          </p>
        </header>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <ol data-beats className="relative">
            <div aria-hidden className="absolute bottom-10 left-[13.5px] top-3 hidden w-px bg-white/[0.08] lg:block">
              <div data-rail-fill className="h-full w-full origin-top scale-y-0 bg-scene" />
            </div>
            {BEATS.map((beat, i) => (
              <li key={beat.key} data-beat={beat.key} data-reveal className="relative py-8 first:pt-0 lg:py-16 lg:pl-16 lg:first:pt-0">
                <span
                  aria-hidden
                  className={`absolute left-0 hidden h-7 w-7 items-center justify-center rounded-full border text-sm font-semibold transition-[background-color,border-color,color] duration-300 lg:flex ${
                    i === 0 ? "-top-1" : "top-[3.75rem]"
                  } ${
                    active === i
                      ? "border-[var(--color-scene-1)] bg-scene text-ink-950"
                      : active > i
                        ? "border-[var(--color-scene-1)] bg-ink-950 text-scene-soft"
                        : "border-ink-700 bg-ink-950 text-ink-500"
                  }`}
                >
                  {i + 1}
                </span>
                <p className={`label-mono transition-colors duration-300 ${active === i ? "!text-scene-soft" : ""}`}>
                  Beat {beat.index}
                </p>
                <h3
                  className={`heading mt-3 text-3xl transition-colors duration-300 md:text-4xl ${
                    active === i ? "text-ink-50" : "text-ink-400"
                  }`}
                >
                  {beat.title}
                </h3>
                <p className="mt-4 max-w-md text-base leading-relaxed text-ink-300 md:text-lg">{beat.body}</p>
                <p className="mt-5 flex flex-wrap gap-2">
                  {beat.sceneTags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </p>

                {/* Small screens: the beat carries its own panel */}
                <div className="mt-6 lg:hidden">
                  <LoopConsole step={i} />
                </div>
              </li>
            ))}
          </ol>

          <div className="relative hidden lg:block">
            <div className="sticky top-28">
              <LoopConsole step={active} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── The console panel ──────────────────────────────────────────────
// One framed panel whose contents morph per beat. All transitions are
// opacity/transform via CSS so they stay cheap and interruptible. The
// rows inside a panel land one at a time (`.loop-rows`, globals.css)
// so each beat reads as the console filling up, not a slide swap.

function LoopConsole({ step }: { step: number }) {
  return (
    <div className="frame overflow-hidden rounded-[22px]">
      <div className="flex items-center gap-3 border-b border-line bg-white/[0.015] px-5 py-3.5">
        <span aria-hidden className="live-dot text-scene" />
        <span className="text-base font-semibold text-ink-100">The loop</span>
        <span className="label-mono ml-auto">Beat {String(step + 1).padStart(2, "0")} of 04</span>
      </div>
      <div aria-hidden className="flex gap-1 px-5 pt-4">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <span
              className="block h-full origin-left rounded-full bg-scene transition-transform duration-500"
              style={{ transform: `scaleX(${i <= step ? 1 : 0})` }}
            />
          </span>
        ))}
      </div>

      {/* The four panels share one grid cell, so the console is as tall
          as its tallest panel and the text can never be clipped. */}
      <div className="grid p-5 md:p-6">
        <ConsoleArrive on={step === 0} />
        <ConsoleDraft on={step === 1} />
        <ConsoleGate on={step === 2} />
        <ConsoleLearn on={step === 3} />
      </div>
    </div>
  );
}

function Panel({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <div
      aria-hidden={!on}
      data-on={on ? "true" : "false"}
      className={`col-start-1 row-start-1 transition-[opacity,transform] duration-500 ${
        on
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
      style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
    >
      {children}
    </div>
  );
}

function Row({
  tone,
  label,
  meta,
}: {
  tone: "neutral" | "accent" | "ok";
  label: string;
  meta: string;
}) {
  const toneCls =
    tone === "accent"
      ? "border-[color-mix(in_oklab,var(--color-scene-1)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-scene-1)_7%,transparent)]"
      : tone === "ok"
        ? "border-emerald-400/25 bg-emerald-400/[0.05]"
        : "border-line bg-white/[0.02]";
  return (
    <div className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${toneCls}`}>
      <span className="min-w-0 text-base leading-snug text-ink-100">{label}</span>
      <span className="label-mono shrink-0">{meta}</span>
    </div>
  );
}

function ConsoleArrive({ on }: { on: boolean }) {
  return (
    <Panel on={on}>
      <p className="label-mono">
        Overnight · unsorted
      </p>
      <div className="loop-rows mt-4 space-y-2.5">
        <Row tone="neutral" label="Re: invoice #0042, payment date?" meta="email" />
        <Row tone="neutral" label="Brief: spring drop launch copy" meta="request" />
        <Row tone="neutral" label="Homepage hero, v2 uploaded" meta="handoff" />
        <Row tone="neutral" label="9 newsletters, 3 receipts" meta="noise" />
        <Row tone="neutral" label="New lead: agency, 12 seats" meta="form" />
      </div>
      <p className="mt-5 text-base leading-relaxed text-ink-300">
        Nothing triaged yet. This is the pile.
      </p>
    </Panel>
  );
}

function ConsoleDraft({ on }: { on: boolean }) {
  return (
    <Panel on={on}>
      <p className="label-mono">
        Agent pass · 06:00
      </p>
      <div className="loop-rows mt-4 space-y-2.5">
        <Row tone="accent" label="Reply drafted: payment nudge, your tone" meta="draft" />
        <Row tone="accent" label="Launch copy drafted on-brand, 3 variants" meta="draft" />
        <Row tone="neutral" label="Hero v2 routed to PM review" meta="routed" />
        <Row tone="neutral" label="Noise auto-filed, 12 items" meta="filed" />
        <Row tone="accent" label="Lead qualified + summary written" meta="draft" />
      </div>
      <p className="mt-5 text-base leading-relaxed text-ink-300">
        The 80% is done. None of it has shipped.
      </p>
    </Panel>
  );
}

function ConsoleGate({ on }: { on: boolean }) {
  return (
    <Panel on={on}>
      <p className="label-mono">
        Waiting on you · 3 items
      </p>
      <div className="loop-rows mt-4 space-y-2.5">
        <Row tone="accent" label="Payment nudge → Greenfield Studio" meta="approve?" />
        <Row tone="accent" label="Launch copy, variant B" meta="approve?" />
        <Row tone="accent" label="Lead reply + calendar link" meta="approve?" />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {/* Pictures of the scenes' buttons, not controls: this console is
            a diagram, so they are spans and nothing can be pressed. */}
        <span className="btn btn-positive btn-sm pointer-events-none">Approve</span>
        <span className="btn btn-quiet btn-sm pointer-events-none">Send back</span>
      </div>
      <p className="mt-5 text-base leading-relaxed text-ink-300">
        Outbound, money, and publishing all stop here. Every decision lands
        in an append-only audit trail.
      </p>
    </Panel>
  );
}

function ConsoleLearn({ on }: { on: boolean }) {
  return (
    <Panel on={on}>
      <p className="label-mono">
        Rulebook · learned from you
      </p>
      <div className="loop-rows mt-4 space-y-2.5">
        <Row tone="ok" label="✓ Chase overdue invoices at 12+ days" meta="new" />
        <Row tone="ok" label="✓ Launch copy: variant-B voice wins" meta="new" />
        <Row tone="neutral" label="✓ Writer agents never auto-publish" meta="house" />
        <Row tone="neutral" label="✗ No discount language in spring drop" meta="house" />
      </div>
      <p className="mt-5 text-base leading-relaxed text-ink-300">
        Two new rules from today&apos;s approvals. Tomorrow&apos;s drafts
        start from them.
      </p>
    </Panel>
  );
}

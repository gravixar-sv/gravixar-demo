"use client";

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
    sceneTags: ["Driftwood inbox", "Northbeam briefs", "Lattice handoffs"],
  },
  {
    key: "draft",
    index: "02",
    title: "AI drafts the 80%",
    body: "Triage, first cuts, classifications, replies. The agent does the typing, in your tone, against your data.",
    sceneTags: ["Studio Mix agents", "Driftwood drafts"],
  },
  {
    key: "gate",
    index: "03",
    title: "You hold the gate",
    body: "Nothing publishes, ships, or spends without a human approve. The gate is the product, not a checkbox.",
    sceneTags: ["Studio Mix approval queue", "Lattice review loop"],
  },
  {
    key: "learn",
    index: "04",
    title: "It learns your rules",
    body: "Every approve and send-back becomes a house rule. The agent gets more yours every week, and the rulebook is yours to read.",
    sceneTags: ["Northbeam brand memory", "Every scene's rulebook"],
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
        return () => triggers.forEach((t) => t.kill());
      });
    },
    { scope },
  );

  return (
    <section
      id="loop"
      ref={scope}
      className="relative border-t border-white/5"
      aria-labelledby="loop-heading"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32 lg:px-12">
        <header data-reveal className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#ff6b6b]">
            the loop
          </p>
          <h2
            id="loop-heading"
            className="mt-4 text-3xl font-medium leading-[1.06] tracking-[-0.03em] text-zinc-50 md:text-5xl"
          >
            Every scene runs the same loop.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400">
            Different buyers, different workflows, one spine. Scroll it once
            here, then go run it for real in any scene.
          </p>
        </header>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          {/* Beats */}
          <ol className="relative">
            {/* progress rail */}
            <div
              aria-hidden
              className="absolute bottom-6 left-[7px] top-2 hidden w-px bg-white/8 lg:block"
            />
            {BEATS.map((beat, i) => (
              <li
                key={beat.key}
                data-beat={beat.key}
                data-reveal className="relative py-8 first:pt-0 lg:py-14 lg:pl-12"
              >
                <span
                  aria-hidden
                  className={`absolute left-0 top-9 hidden h-[15px] w-[15px] rounded-full border transition-colors duration-300 first:top-1 lg:block ${
                    active === i
                      ? "border-[#ff6b6b] bg-[#ff6b6b]/20"
                      : "border-zinc-700 bg-[#050508]"
                  }`}
                  style={i === 0 ? { top: "0.35rem" } : undefined}
                />
                <p
                  className={`font-mono text-[10px] uppercase tracking-[0.22em] transition-colors duration-300 ${
                    active === i ? "text-[#ff6b6b]" : "text-zinc-600"
                  }`}
                >
                  {beat.index}
                </p>
                <h3
                  className={`mt-2 text-2xl font-medium tracking-[-0.02em] transition-colors duration-300 md:text-3xl ${
                    active === i ? "text-zinc-50" : "text-zinc-400"
                  }`}
                >
                  {beat.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400 md:text-base">
                  {beat.body}
                </p>
                <p className="mt-4 flex flex-wrap gap-2">
                  {beat.sceneTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500"
                    >
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

          {/* Sticky console, desktop only */}
          <div className="relative hidden lg:block">
            <div className="sticky top-24">
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
// opacity/transform via CSS so they stay cheap and interruptible.

function LoopConsole({ step }: { step: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a10] shadow-[0_32px_64px_-28px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-3.5">
        <span className="flex items-center gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/85" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/85" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/85" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          the loop · beat {String(step + 1).padStart(2, "0")} of 04
        </span>
      </div>

      <div className="relative min-h-[330px] p-5 md:min-h-[360px]">
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
      className={`absolute inset-0 p-5 transition-[opacity,transform] duration-500 ${
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
      ? "border-[#ff6b6b]/35 bg-[#ff6b6b]/[0.06]"
      : tone === "ok"
        ? "border-emerald-400/25 bg-emerald-400/[0.05]"
        : "border-white/8 bg-white/[0.02]";
  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 ${toneCls}`}>
      <span className="truncate text-xs text-zinc-200">{label}</span>
      <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">
        {meta}
      </span>
    </div>
  );
}

function ConsoleArrive({ on }: { on: boolean }) {
  return (
    <Panel on={on}>
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
        overnight · unsorted
      </p>
      <div className="mt-3 space-y-2">
        <Row tone="neutral" label="Re: invoice #0042, payment date?" meta="email" />
        <Row tone="neutral" label="Brief: spring drop launch copy" meta="request" />
        <Row tone="neutral" label="Homepage hero, v2 uploaded" meta="handoff" />
        <Row tone="neutral" label="9 newsletters, 3 receipts" meta="noise" />
        <Row tone="neutral" label="New lead: agency, 12 seats" meta="form" />
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-zinc-500">
        Nothing triaged yet. This is the pile.
      </p>
    </Panel>
  );
}

function ConsoleDraft({ on }: { on: boolean }) {
  return (
    <Panel on={on}>
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
        agent pass · 06:00
      </p>
      <div className="mt-3 space-y-2">
        <Row tone="accent" label="Reply drafted: payment nudge, your tone" meta="draft" />
        <Row tone="accent" label="Launch copy drafted on-brand, 3 variants" meta="draft" />
        <Row tone="neutral" label="Hero v2 routed to PM review" meta="routed" />
        <Row tone="neutral" label="Noise auto-filed, 12 items" meta="filed" />
        <Row tone="accent" label="Lead qualified + summary written" meta="draft" />
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-zinc-500">
        The 80% is done. None of it has shipped.
      </p>
    </Panel>
  );
}

function ConsoleGate({ on }: { on: boolean }) {
  return (
    <Panel on={on}>
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
        waiting on you · 3 items
      </p>
      <div className="mt-3 space-y-2">
        <Row tone="accent" label="Payment nudge → Greenfield Studio" meta="approve?" />
        <Row tone="accent" label="Launch copy, variant B" meta="approve?" />
        <Row tone="accent" label="Lead reply + calendar link" meta="approve?" />
      </div>
      <div className="mt-4 flex gap-2">
        <span className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
          Approve
        </span>
        <span className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400">
          Send back
        </span>
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-zinc-500">
        Outbound, money, and publishing all stop here. Every decision lands
        in an append-only audit trail.
      </p>
    </Panel>
  );
}

function ConsoleLearn({ on }: { on: boolean }) {
  return (
    <Panel on={on}>
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
        rulebook · learned from you
      </p>
      <div className="mt-3 space-y-2">
        <Row tone="ok" label="✓ Chase overdue invoices at 12+ days" meta="new" />
        <Row tone="ok" label="✓ Launch copy: variant-B voice wins" meta="new" />
        <Row tone="neutral" label="✓ Writer agents never auto-publish" meta="house" />
        <Row tone="neutral" label="✗ No discount language in spring drop" meta="house" />
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-zinc-500">
        Two new rules from today&apos;s approvals. Tomorrow&apos;s drafts
        start from them.
      </p>
    </Panel>
  );
}

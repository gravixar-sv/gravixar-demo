// Studio Mix — operator console. Four agents you can poke. ECHO is the
// only one wired through real Anthropic via AI Gateway in MVP. PULSE,
// RIVER, ATLAS are partly mocked at launch and progressively wired.

import Link from "next/link";
import { GlassPanel } from "@/components/demo/GlassPanel";
import { WindowDots } from "@/components/demo/WindowChrome";

const AGENTS = [
  {
    id: "echo",
    name: "ECHO",
    role: "SEO drafter",
    status: "live",
    description:
      "Drafts blog posts on-demand via Anthropic. Streams tokens straight into the panel. Drafts land in a review queue, never auto-published.",
    color: "#00E1FF",
  },
  {
    id: "pulse",
    name: "PULSE",
    role: "Anomaly cron",
    status: "scheduled",
    description:
      "Sweeps the audit log every night for spikes, DELETE bursts, lockout cascades, stuck states. Emails a digest if anything trips.",
    color: "#FFC857",
  },
  {
    id: "river",
    name: "RIVER",
    role: "Suspicion classifier",
    status: "live",
    description:
      "Takes inbound submissions and classifies them as legit / suspicious / spam, with the reasoning surfaced for human override.",
    color: "#FF2D95",
  },
  {
    id: "atlas",
    name: "ATLAS",
    role: "Content reviewer",
    status: "preview",
    description:
      "Reads a draft against your style guide, flags voice mismatches, suggests edits inline. Designed as a second opinion, not a publish gate.",
    color: "#7C7CFF",
  },
];

export default function StudioMixConsole() {
  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-12 md:px-10 lg:px-16">
      {/* Operator header — mono-styled, terminal-flavored */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-scene-1)]">
            scene 02 — ai tooling
          </p>
          <h1 className="mt-5 font-display-mono text-3xl font-medium leading-tight tracking-tight text-zinc-50 md:text-5xl lg:text-[60px]">
            <span className="text-[var(--color-scene-1)]">$</span> studio-mix &mdash;
            <span className="text-[var(--color-scene-2)]"> agents.online</span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-300">
            Four agents you can poke. Each runs the same way I&apos;d wire one
            into a client&apos;s system: human-in-the-loop, no auto-publish,
            provider-agnostic via AI Gateway.
          </p>
        </div>
        <div className="lg:col-span-4 lg:pt-6">
          <GlassPanel variant="strong" className="px-5 py-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <WindowDots />
              <span className="ml-1 text-[10px] uppercase tracking-widest text-zinc-400">
                console / status
              </span>
            </div>
            <dl className="mt-4 space-y-2.5 text-[11px]">
              <Row k="agents" v="4 registered" />
              <Row k="provider" v="anthropic via gateway" />
              <Row k="rate limit" v="unlocked for demo" />
              <Row k="reset" v="sunday 03:00 utc" />
            </dl>
          </GlassPanel>
        </div>
      </div>

      {/* Agents grid */}
      <div className="mt-16">
        <h2 className="mb-6 text-xl uppercase tracking-widest text-zinc-300">
          / agents
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
          {AGENTS.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      <p className="mt-12 text-[10px] uppercase tracking-widest text-zinc-600">
        ⚠ ECHO wires up live after AI_GATEWAY_API_KEY is set · others run mocked at MVP
      </p>

      <div className="mt-16 border-t border-white/5 pt-8">
        <Link
          href="/"
          className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-200"
        >
          ← back to gallery
        </Link>
      </div>
    </div>
  );
}

function AgentCard({
  agent,
}: {
  agent: (typeof AGENTS)[number];
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/50 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-white/20">
      {/* Edge glow per agent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-50 transition-opacity group-hover:opacity-90"
        style={{
          background: `radial-gradient(60% 60% at 100% 0%, ${agent.color}33 0%, transparent 60%)`,
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
          <div className="flex items-center gap-3">
            <WindowDots />
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              agent / {agent.id}
            </span>
          </div>
          <StatusPill status={agent.status} color={agent.color} />
        </div>
        <div className="px-5 pb-6 pt-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3
              className="text-2xl font-medium tracking-tight"
              style={{ color: agent.color }}
            >
              {agent.name}
            </h3>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              {agent.role}
            </span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-300 font-sans">
            {agent.description}
          </p>
          <button
            type="button"
            disabled
            className="mt-6 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            title="wires up after AI Gateway key is set"
          >
            <span style={{ color: agent.color }}>▸</span> run agent
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status, color }: { status: string; color: string }) {
  const styles: Record<string, string> = {
    live: "border-emerald-400/40 text-emerald-300",
    scheduled: "border-amber-400/40 text-amber-300",
    preview: "border-zinc-600 text-zinc-400",
  };
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-widest ${
        styles[status] ?? styles.preview
      }`}
    >
      <span
        className="pulse-dot inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: color, color }}
      />
      {status}
    </span>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-zinc-500">{k}</dt>
      <dd className="text-zinc-200">{v}</dd>
    </div>
  );
}

// Recent agent runs, server component. Pulls last 8 AgentRun rows
// across all agents and displays them as a feed. Re-renders on every
// page load so it picks up any runs from ECHO/PULSE.

import { prisma } from "@/lib/db";
import { WindowDots } from "@/components/demo/WindowChrome";

const AGENT_COLORS: Record<string, string> = {
  ECHO: "#00E1FF",
  PULSE: "#FFC857",
  RIVER: "#FF2D95",
  ATLAS: "#7C7CFF",
};

export async function AgentRunFeed() {
  const runs = await prisma.agentRun.findMany({
    take: 8,
    orderBy: { ranAt: "desc" },
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-3">
          <WindowDots />
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            console / activity
          </span>
        </div>
        <span className="text-[9px] uppercase tracking-widest text-zinc-500">
          last {runs.length}
        </span>
      </div>
      {runs.length === 0 ? (
        <p className="px-5 py-6 text-xs text-zinc-600 font-sans">
          no agent runs yet.
        </p>
      ) : (
        <ul className="divide-y divide-white/5">
          {runs.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-center gap-3">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: AGENT_COLORS[r.agent] ?? "#888" }}
                />
                <span
                  className="font-mono text-xs"
                  style={{ color: AGENT_COLORS[r.agent] ?? "#cbd5e1" }}
                >
                  {r.agent}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  {r.status}
                </span>
                <RunSummary output={r.output} />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                {timeAgo(r.ranAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RunSummary({ output }: { output: unknown }) {
  if (!output || typeof output !== "object") return null;
  const obj = output as Record<string, unknown>;
  // Compact summary line, show the most relevant key per agent
  let summary = "";
  if (typeof obj.tokens === "number") summary = `${obj.tokens} tokens`;
  else if (typeof obj.findingsCount === "number") summary = `${obj.findingsCount} findings`;
  else if (typeof obj.classification === "string") summary = String(obj.classification);
  else if (typeof obj.preview === "string") summary = `"${obj.preview.slice(0, 30)}..."`;
  if (!summary) return null;
  return <span className="truncate text-[11px] text-zinc-400 font-sans">{summary}</span>;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

"use client";

import { useState } from "react";
import { WindowDots } from "@/components/demo/WindowChrome";

type Severity = "info" | "warn" | "critical";
type Finding = {
  severity: Severity;
  rule: string;
  description: string;
  count?: number;
};
type PulseResponse = {
  scannedAt: string;
  elapsedMs: number;
  findings: Finding[];
  scanned: Record<string, number>;
};

export function PulseRunner() {
  const [data, setData] = useState<PulseResponse | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/agents/pulse", { method: "POST" });
      if (!res.ok) throw new Error(`http ${res.status}`);
      const json = (await res.json()) as PulseResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-3">
          <WindowDots />
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            agent / pulse · live
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-amber-300">
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-amber-300 text-amber-300" />
          ready
        </span>
      </div>

      <div className="px-5 pt-5">
        <p className="text-xs leading-relaxed text-zinc-400 font-sans">
          Runs the same anomaly sweep that fires nightly in production. No AI —
          pure SQL over the audit log, leave requests, inquiries, and tasks.
        </p>
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-xs uppercase tracking-widest text-amber-300 transition-colors hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? (
            <>
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-amber-300 text-amber-300" />
              scanning…
            </>
          ) : (
            <>
              <span style={{ color: "#FFC857" }}>▸</span> run scan
            </>
          )}
        </button>
      </div>

      <div className="px-5 pb-5 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            findings
          </span>
          {data ? (
            <span className="text-[10px] text-zinc-600">
              {data.elapsedMs}ms · {new Date(data.scannedAt).toLocaleTimeString()}
            </span>
          ) : null}
        </div>

        {error ? (
          <p className="mt-3 text-xs text-rose-300">error: {error}</p>
        ) : !data ? (
          <p className="mt-3 text-xs text-zinc-600 font-sans">
            click run scan to sweep the last 24h.
          </p>
        ) : data.findings.length === 0 ? (
          <p className="mt-3 text-xs text-emerald-300">all clear</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {data.findings.map((f, i) => (
              <FindingRow key={`${f.rule}-${i}`} finding={f} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FindingRow({ finding }: { finding: Finding }) {
  const tone =
    finding.severity === "critical"
      ? "border-rose-400/40 bg-rose-400/10 text-rose-200"
      : finding.severity === "warn"
        ? "border-amber-300/40 bg-amber-300/10 text-amber-100"
        : "border-white/10 bg-white/[0.03] text-zinc-300";
  return (
    <li className={`rounded-md border px-3 py-2 text-[11px] ${tone}`}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono uppercase tracking-widest text-[9px] opacity-70">
          {finding.rule}
        </span>
        <span className="font-mono uppercase tracking-widest text-[9px] opacity-70">
          {finding.severity}
        </span>
      </div>
      <p className="mt-1 font-sans text-xs leading-relaxed">
        {finding.description}
      </p>
    </li>
  );
}

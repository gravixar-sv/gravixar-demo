"use client";

import { useState } from "react";
import { WindowDots } from "@/components/demo/WindowChrome";

const SAMPLES = [
  {
    label: "real-looking inquiry",
    text: "Hi, we're a 12-person agency in Toronto looking to replace our patchwork of Notion + Slack + email with a real client portal. Need delivery review flow, audit log, the works. Saw your bs-hub case study and wanted to know turnaround for something similar.",
  },
  {
    label: "spam: SEO outreach",
    text: "Hello dear, I am writing to inform you that I can rank your website on the first page of Google with my advanced SEO services and high-quality backlinks. Please reply with WhatsApp number for more details. Thanks and regards.",
  },
  {
    label: "ambiguous",
    text: "interested in your services. please send pricing.",
  },
];

type Result = {
  classification: "legit" | "suspicious" | "spam";
  confidence: number;
  reason: string;
  mocked?: boolean;
};

export function RiverRunner() {
  const [sample, setSample] = useState(SAMPLES[0]?.text ?? "");
  const [result, setResult] = useState<Result | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/agents/river", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sample }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `http ${res.status}`);
      setResult(json as Result);
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
            agent / river · live
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-fuchsia-300">
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-fuchsia-400 text-fuchsia-400" />
          ready
        </span>
      </div>

      <div className="px-5 pt-5">
        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            sample text
          </span>
          <textarea
            value={sample}
            onChange={(e) => setSample(e.target.value)}
            disabled={running}
            rows={4}
            className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-fuchsia-400/50 font-sans"
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SAMPLES.map((s) => (
            <button
              key={s.label}
              type="button"
              disabled={running}
              onClick={() => setSample(s.text)}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-zinc-300 hover:border-fuchsia-400/40 hover:text-fuchsia-300 disabled:opacity-50"
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={run}
          disabled={running || sample.length < 10}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-fuchsia-400/40 bg-fuchsia-400/10 px-3 py-2 text-xs uppercase tracking-widest text-fuchsia-300 transition-colors hover:bg-fuchsia-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? (
            <>
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-fuchsia-400 text-fuchsia-400" />
              classifying…
            </>
          ) : (
            <>
              <span style={{ color: "#FF2D95" }}>▸</span> classify
            </>
          )}
        </button>
      </div>

      <div className="px-5 pb-5 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            verdict
          </span>
          {result?.mocked ? (
            <span className="text-[10px] text-zinc-600 font-sans">
              mock, needs key
            </span>
          ) : null}
        </div>

        {error ? (
          <p className="mt-3 text-xs text-rose-300">error: {error}</p>
        ) : !result ? (
          <p className="mt-3 text-xs text-zinc-600 font-sans">
            paste or pick a sample, then classify.
          </p>
        ) : (
          <ResultPanel result={result} />
        )}
      </div>
    </div>
  );
}

function ResultPanel({ result }: { result: Result }) {
  const tone =
    result.classification === "legit"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
      : result.classification === "spam"
        ? "border-rose-400/40 bg-rose-400/10 text-rose-200"
        : "border-amber-300/40 bg-amber-300/10 text-amber-100";
  const pct = Math.round(result.confidence * 100);
  return (
    <div className={`mt-3 rounded-md border px-4 py-3 ${tone}`}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-sm uppercase tracking-widest">
          {result.classification}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">
          {pct}% confidence
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed font-sans">
        {result.reason}
      </p>
    </div>
  );
}

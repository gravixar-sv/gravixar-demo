"use client";

import { useState } from "react";
import { WindowDots } from "@/components/demo/WindowChrome";

const SAMPLE_DRAFTS = [
  {
    label: "fluff-heavy",
    text: `In today's fast-paced world, our team helps businesses leverage cutting-edge AI to unlock their full potential and transform their operations. We deliver best-in-class solutions that drive 10x growth through synergy between human creativity and machine intelligence. Various tools could potentially help you achieve next-level performance.`,
  },
  {
    label: "passive + hedged",
    text: `It is felt that the implementation could potentially be improved by stakeholders. Various challenges may be encountered. The system was designed to be helpful, and various users have stated that it is generally fine. Things might possibly need to be reviewed at some point.`,
  },
  {
    label: "Qamar-style draft",
    text: `I built bs-hub for one agency and rebuilt it three times before the state machine clicked. The first version had implicit status — admins typed "approved" in a free-text field. That broke twice in the first month. The second version had explicit states but no audit trail. That broke once when a deliverable disappeared. Third version has 12 hard-transitioned states and an audit row per mutation. It's been quiet since.`,
  },
];

type Flag = {
  severity: "info" | "warn";
  rule: string;
  excerpt: string;
  issue: string;
  suggestion?: string;
};
type Result = {
  flags: Flag[];
  summary: string;
  mocked?: boolean;
};

export function AtlasRunner() {
  const [draft, setDraft] = useState(SAMPLE_DRAFTS[0]?.text ?? "");
  const [result, setResult] = useState<Result | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/agents/atlas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ draft }),
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
            agent / atlas · live
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-indigo-300">
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 text-indigo-400" />
          ready
        </span>
      </div>

      <div className="px-5 pt-5">
        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            draft
          </span>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={running}
            rows={6}
            className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-indigo-400/50 font-sans"
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SAMPLE_DRAFTS.map((s) => (
            <button
              key={s.label}
              type="button"
              disabled={running}
              onClick={() => setDraft(s.text)}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-zinc-300 hover:border-indigo-400/40 hover:text-indigo-300 disabled:opacity-50"
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={run}
          disabled={running || draft.length < 40}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-indigo-400/40 bg-indigo-400/10 px-3 py-2 text-xs uppercase tracking-widest text-indigo-300 transition-colors hover:bg-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? (
            <>
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 text-indigo-400" />
              reviewing…
            </>
          ) : (
            <>
              <span style={{ color: "#7C7CFF" }}>▸</span> review draft
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
            <span className="text-[10px] text-zinc-600 font-sans">mock — needs key</span>
          ) : null}
        </div>

        {error ? (
          <p className="mt-3 text-xs text-rose-300">error: {error}</p>
        ) : !result ? (
          <p className="mt-3 text-xs text-zinc-600 font-sans">
            paste or pick a draft, then review.
          </p>
        ) : (
          <ResultPanel result={result} />
        )}
      </div>
    </div>
  );
}

function ResultPanel({ result }: { result: Result }) {
  const warnCount = result.flags.filter((f) => f.severity === "warn").length;
  return (
    <div className="mt-3 space-y-3">
      <div className="rounded-md border border-indigo-400/30 bg-indigo-400/5 px-4 py-3">
        <p className="text-xs leading-relaxed text-zinc-200 font-sans">
          {result.summary}
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-indigo-300">
          {result.flags.length} flag{result.flags.length === 1 ? "" : "s"} · {warnCount} warn · {result.flags.length - warnCount} info
        </p>
      </div>
      {result.flags.length > 0 ? (
        <ul className="space-y-2">
          {result.flags.map((f, i) => (
            <FlagRow key={`${f.rule}-${i}`} flag={f} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function FlagRow({ flag }: { flag: Flag }) {
  const tone =
    flag.severity === "warn"
      ? "border-amber-300/40 bg-amber-300/5"
      : "border-white/10 bg-white/[0.02]";
  return (
    <li className={`rounded-md border px-3 py-2 ${tone}`}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
          {flag.rule}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
          {flag.severity}
        </span>
      </div>
      <p className="mt-1 text-xs italic text-zinc-400 font-sans">&ldquo;{flag.excerpt}&rdquo;</p>
      <p className="mt-1 text-xs text-zinc-200 font-sans">{flag.issue}</p>
      {flag.suggestion ? (
        <p className="mt-1 text-xs text-indigo-200 font-sans">→ {flag.suggestion}</p>
      ) : null}
    </li>
  );
}

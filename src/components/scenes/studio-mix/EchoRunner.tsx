"use client";

import { useState } from "react";
import { WindowDots } from "@/components/demo/WindowChrome";

const SAMPLE_TOPICS = [
  "the case against auto-publish AI content",
  "what an honest project portal actually requires",
  "why 'agentic' is doing too much work as a word",
  "AI in the loop, not the driver, three patterns",
];

export function EchoRunner() {
  const [topic, setTopic] = useState(SAMPLE_TOPICS[0] ?? "");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokensSeen, setTokensSeen] = useState(0);

  async function run() {
    setRunning(true);
    setOutput("");
    setError(null);
    setTokensSeen(0);

    try {
      const res = await fetch("/api/agents/echo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!res.ok || !res.body) {
        const errBody = await res.text().catch(() => "");
        throw new Error(`http ${res.status}${errBody ? `, ${errBody}` : ""}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setOutput((prev) => prev + chunk);
        setTokensSeen((n) => n + chunk.length);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md">
      {/* Window chrome */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-3">
          <WindowDots />
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            agent / echo · live
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-emerald-300">
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 text-emerald-400" />
          ready
        </span>
      </div>

      {/* Topic picker */}
      <div className="px-5 pt-5">
        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            topic
          </span>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={running}
            className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-400/50"
            placeholder="What should ECHO draft?"
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SAMPLE_TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              disabled={running}
              onClick={() => setTopic(t)}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-zinc-300 hover:border-cyan-400/40 hover:text-cyan-300 disabled:opacity-50"
            >
              {t}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={run}
          disabled={running || topic.length < 3}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-xs uppercase tracking-widest text-cyan-300 transition-colors hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? (
            <>
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 text-cyan-400" />
              streaming…
            </>
          ) : (
            <>
              <span style={{ color: "#00E1FF" }}>▸</span> run echo
            </>
          )}
        </button>
      </div>

      {/* Output */}
      <div className="px-5 pb-5 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            stream
          </span>
          <span className="text-[10px] text-zinc-600">
            {tokensSeen > 0 ? `${tokensSeen} chars` : ""}
          </span>
        </div>
        <pre
          className={`mt-2 min-h-[180px] whitespace-pre-wrap break-words rounded-md border border-white/5 bg-black/30 p-4 font-sans text-sm leading-relaxed ${
            output ? "text-zinc-200" : "text-zinc-600"
          }`}
        >
          {output || (running ? "waiting for first token…" : "click run echo to draft")}
        </pre>
        {error ? (
          <p className="mt-2 text-xs text-rose-300">error: {error}</p>
        ) : null}
      </div>
    </div>
  );
}

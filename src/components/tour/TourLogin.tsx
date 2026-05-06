"use client";

// Fake login screen shown for ~1s. Pre-filled with Mira's email so the
// visitor sees the agency-portal frame, then fades into Mira's view.

import { useState } from "react";
import { GlassPanel } from "@/components/demo/GlassPanel";
import { TOUR_COPY, TOUR_PERSONAS } from "@/lib/tour/script";

type Props = {
  onLoginDone: () => void;
};

export function TourLogin({ onLoginDone }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const mira = TOUR_PERSONAS.mira;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    window.setTimeout(onLoginDone, 1000);
  }

  return (
    <div className="tour-step-enter mx-auto flex min-h-[calc(100dvh-8rem)] max-w-md flex-col items-center justify-center px-6 py-16">
      <GlassPanel variant="strong" className="w-full p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-scene-1)]">
          {TOUR_COPY.login.eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-medium tracking-[-0.015em] text-zinc-50">
          {TOUR_COPY.login.title}
        </h2>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Field label="Email">
            <input
              type="email"
              defaultValue={mira.email}
              readOnly
              className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[var(--color-scene-1)]/50"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              defaultValue="hunter2hunter2"
              readOnly
              className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm tracking-widest text-zinc-100 outline-none focus:border-[var(--color-scene-1)]/50"
            />
          </Field>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[var(--color-scene-1)]/40 bg-[var(--color-scene-1)]/15 px-4 py-2.5 text-sm font-medium text-[var(--color-scene-1)] transition-colors hover:bg-[var(--color-scene-1)]/25 disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Spinner /> {TOUR_COPY.login.submitting}
              </>
            ) : (
              <>{TOUR_COPY.login.submitLabel} →</>
            )}
          </button>
        </form>
        <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
          demo only · no real auth
        </p>
      </GlassPanel>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--color-scene-1)]/40 border-t-[var(--color-scene-1)]"
    />
  );
}

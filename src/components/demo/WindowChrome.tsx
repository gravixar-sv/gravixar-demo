// Subtle window-chrome treatment, three traffic-light dots in the
// top-left of a glass panel. Adds OS-app feel without being interactive.

import { cn } from "@/lib/cn";

export function WindowDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-hidden>
      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/85" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/85" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/85" />
    </div>
  );
}

export function WindowBar({
  title,
  trailing,
}: {
  title?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
      <WindowDots />
      {title ? (
        <span className="ml-1 font-mono text-[11px] uppercase tracking-widest text-zinc-400">
          {title}
        </span>
      ) : null}
      {trailing ? <div className="ml-auto">{trailing}</div> : null}
    </div>
  );
}

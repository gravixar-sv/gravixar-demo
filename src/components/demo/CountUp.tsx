"use client";

// A number that counts up to its value the first time it scrolls into
// view. "1,284", "£412k", "94%" and "$612k" all work: the prefix and
// suffix are kept verbatim and only the digits move, with the same
// grouping and decimals as the final value.
//
// CSS-first rule, applied to text: the server renders the FINAL value,
// so with scripting off, reduced motion, or a throttled rAF the real
// number is what's on the page. The count is a flourish layered on top
// and a rescue timer snaps to the final value if the ticker stalls.
//
// A value that CHANGES after that first count is the visitor's own
// click landing (the outcome tiles are derived from the scene's
// reducer). It pops rather than counting again: tweening 1,284 to
// 1,285 is invisible for most of a second and then steps, which reads
// as a glitch, and `.pop-in` is already how a count that changed
// announces itself everywhere else in a scene.

import { useEffect, useLayoutEffect, useRef } from "react";

import { cn } from "@/lib/cn";

const DURATION_MS = 1100;

// useLayoutEffect so a changed value pops from the frame it lands on,
// with no flash of the settled number first. It has no server pass, so
// fall back to useEffect there to keep React quiet.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function parse(value: string) {
  const m = /^([^\d]*)(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(value);
  if (!m) return null;
  const [, prefix = "", digits = "", suffix = ""] = m;
  const grouped = digits.includes(",");
  const decimals = digits.includes(".") ? digits.split(".")[1]!.length : 0;
  const n = Number(digits.replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  return { prefix, suffix, n, grouped, decimals };
}

function format(n: number, grouped: boolean, decimals: number) {
  const fixed = n.toFixed(decimals);
  if (!grouped) return fixed;
  const [int, frac] = fixed.split(".");
  const withCommas = int!.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${withCommas}.${frac}` : withCommas;
}

/** Restart `.pop-in` on an element that may already be carrying it. */
function pop(el: HTMLElement) {
  el.classList.remove("pop-in");
  el.getBoundingClientRect(); // reflow, so a repeat bump animates again
  el.classList.add("pop-in");
}

export function CountUp({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  /** The value the element has settled on, once it has counted up. */
  const counted = useRef<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already counted once: React has written the new number, so the
    // page is correct either way. Just draw attention to it.
    if (counted.current !== null) {
      if (counted.current === value) return;
      counted.current = value;
      el.textContent = value;
      pop(el);
      return;
    }

    const parsed = parse(value);
    if (!parsed || parsed.n === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const { prefix, suffix, n, grouped, decimals } = parsed;
    let raf = 0;
    let rescue = 0;
    let started = false;

    const settle = () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(rescue);
      el.textContent = value;
    };

    const run = () => {
      if (started) return;
      started = true;
      // From here on the element owns its own text, and a later change
      // to `value` pops instead of counting.
      counted.current = value;
      const t0 = performance.now();
      const frame = (now: number) => {
        const t = Math.min(1, (now - t0) / DURATION_MS);
        // ease-out quint, matches --ease-out's feel
        const e = 1 - Math.pow(1 - t, 5);
        el.textContent = `${prefix}${format(n * e, grouped, decimals)}${suffix}`;
        if (t < 1) raf = requestAnimationFrame(frame);
        else settle();
      };
      raf = requestAnimationFrame(frame);
      // If rAF is throttled (background tab, capture tools) the final
      // value lands anyway.
      rescue = window.setTimeout(settle, DURATION_MS + 400);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      settle();
    };
  }, [value]);

  // inline-block so the pop's transform applies, and so a formatted
  // number never breaks across two lines.
  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {value}
    </span>
  );
}

"use client";

// Viewport reveal, CSS-first. Elements marked [data-reveal] start
// hidden via CSS; an IntersectionObserver adds .is-in as they enter
// and the compositor runs the transition. Crucially the motion never
// depends on a JS ticker: in rAF-throttled contexts (screenshots,
// background tabs, low-power webviews) the class still lands and the
// content is never stranded invisible. Reduced motion is handled in
// CSS (elements simply render visible).

import { useEffect, type RefObject } from "react";

export function useReveal(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (els.length === 0) return;

    if (typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    els.forEach((el) => io.observe(el));

    // Rescue path: if the observer never fires (throttled webviews,
    // capture tools), force anything on or near the viewport visible.
    // Inline styles skip the transition so a frozen animation clock
    // can't strand the content mid-fade.
    const rescue = window.setTimeout(() => {
      for (const el of els) {
        if (el.classList.contains("is-in")) continue;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 1.1 && r.bottom > -60) {
          el.style.transition = "none";
          el.classList.add("is-in");
        }
      }
    }, 1400);

    return () => {
      io.disconnect();
      window.clearTimeout(rescue);
    };
  }, [scope]);
}

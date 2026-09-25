// Single GSAP registration point. Everything imports gsap, ScrollTrigger
// and useGSAP from here so plugins register exactly once. Registration
// is skipped on the server (the prerender), where there is no window.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };

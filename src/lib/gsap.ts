"use client";

// Single GSAP registration point. Every home/scene component imports
// gsap + ScrollTrigger + useGSAP from here so plugins register exactly
// once and the import surface stays consistent.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

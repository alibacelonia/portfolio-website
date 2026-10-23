"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig } from "motion/react";
import { SmoothScroll } from "./SmoothScroll";

// Animation features load after hydration so they never block first paint.
const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}>
        <SmoothScroll />
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

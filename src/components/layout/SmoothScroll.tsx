"use client";

import { usePathname } from "next/navigation";
import { ReactLenis } from "lenis/react";

/** Smooth the document without adding a wrapper around sticky or fixed elements. */
export function SmoothScroll() {
  const pathname = usePathname();

  return (
    <ReactLenis
      key={pathname}
      root
      options={{
        autoRaf: true,
        duration: 1.1,
        anchors: true,
        stopInertiaOnNavigate: true,
        respectReducedMotion: true,
      }}
    />
  );
}

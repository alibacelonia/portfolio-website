"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Reconnect on route changes to observe each page's new [data-reveal] and [data-reveal-group]
 * elements.
 * CSS only hides them under `html.js`
 * with motion allowed, so without JS or with reduced motion content is simply visible.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-group]");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => (el.dataset.revealed = "true"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.revealed = "true";
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}

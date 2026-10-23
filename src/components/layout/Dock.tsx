"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { navigation } from "@/lib/site";
import { useActiveSection } from "@/hooks/useActiveSection";

const sectionIds = navigation.map((item) => item.id);

interface Indicator {
  x: number;
  width: number;
}

/** Primary navigation from `md` up: a floating glass dock with a sliding active indicator. */
export function Dock() {
  const active = useActiveSection(sectionIds);
  const listRef = useRef<HTMLUListElement>(null);
  const [indicator, setIndicator] = useState<Indicator | null>(null);

  // Measure the active link so the indicator can slide with a GPU-friendly transform.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const link = list.querySelector<HTMLElement>(`[data-section="${active}"]`);
      if (!link) return;
      const offset = link.getBoundingClientRect().left - list.getBoundingClientRect().left;
      setIndicator({ x: offset, width: link.offsetWidth });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [active]);

  return (
    <nav
      aria-label="Sections"
      className="glass fixed bottom-5 left-1/2 z-40 hidden -translate-x-1/2 rounded-full p-1 md:block"
    >
      {indicator ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1 bottom-1 left-1 rounded-full border border-border bg-surface shadow-card transition-[transform,width] duration-300 ease-out-soft motion-reduce:transition-none dark:bg-surface-2"
          style={{ width: indicator.width, transform: `translateX(${indicator.x}px)` }}
        />
      ) : null}
      <ul ref={listRef} className="flex items-center gap-0.5">
        {navigation.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id} className="relative">
              <a
                href={`#${item.id}`}
                data-section={item.id}
                aria-current={isActive ? "location" : undefined}
                className={`relative flex h-9 items-center rounded-full px-3.5 text-[13px] transition-colors duration-200 lg:px-4 ${
                  isActive ? "font-medium text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

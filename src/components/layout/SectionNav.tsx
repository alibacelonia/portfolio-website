"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { navigation } from "@/lib/site";

interface Indicator {
  x: number;
  width: number;
}

/** Desktop section links with a sliding active indicator (CSS transform, no layout animation). */
export function SectionNav({ active, className = "" }: { active: string; className?: string }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [indicator, setIndicator] = useState<Indicator | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const link = list.querySelector<HTMLElement>(`[data-section="${active}"]`);
      if (!link) {
        setIndicator(null);
        return;
      }
      const offset = link.getBoundingClientRect().left - list.getBoundingClientRect().left;
      setIndicator({ x: offset, width: link.offsetWidth });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [active]);

  return (
    <nav aria-label="Sections" className={`relative ${className}`}>
      {indicator ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 rounded-full border border-border bg-surface shadow-card transition-[transform,width] duration-300 ease-out-soft motion-reduce:transition-none dark:bg-surface-2"
          style={{ width: indicator.width, transform: `translateX(${indicator.x}px)` }}
        />
      ) : null}
      <ul ref={listRef} className="relative flex items-center gap-0.5">
        {navigation.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <Link
                href={`/#${item.id}`}
                data-section={item.id}
                aria-current={isActive ? "location" : undefined}
                className={`flex h-8 items-center rounded-full px-3 text-[13px] transition-colors duration-200 xl:px-3.5 ${
                  isActive ? "font-medium text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

"use client";

import type { RefObject } from "react";
import { AnimatePresence, m } from "motion/react";
import { navigation } from "@/lib/site";

interface MobileMenuPanelProps {
  open: boolean;
  id: string;
  active: string;
  panelRef: RefObject<HTMLDivElement | null>;
  onNavigate: () => void;
}

/** Loaded on first interaction, so Motion's presence animations never ship to desktop visitors. */
export default function MobileMenuPanel({
  open,
  id,
  active,
  panelRef,
  onNavigate,
}: MobileMenuPanelProps) {
  return (
    <AnimatePresence>
      {open ? (
        <m.div
          ref={panelRef}
          id={id}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-x-0 top-full border-b border-border bg-bg shadow-raised"
        >
          <nav aria-label="Sections" className="container-fluid py-2">
            <ul className="grid gap-0.5">
              {navigation.map((item) => {
                const isActive = active === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={isActive ? "location" : undefined}
                      onClick={onNavigate}
                      className={`flex min-h-11 items-center justify-between rounded-lg px-3 text-sm transition-colors ${
                        isActive
                          ? "bg-surface-2 font-medium text-fg"
                          : "text-fg-soft hover:bg-surface-2 hover:text-fg"
                      }`}
                    >
                      {item.label}
                      {isActive ? (
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-blue-fg" />
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}

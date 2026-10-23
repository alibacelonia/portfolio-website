"use client";

import Link from "next/link";
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
          className="glass absolute inset-x-0 top-full mt-2 rounded-2xl p-1.5"
        >
          <nav aria-label="Sections">
            <ul className="grid gap-0.5">
              {navigation.map((item) => {
                const isActive = active === item.id;
                return (
                  <li key={item.id}>
                    <Link
                      href={`/#${item.id}`}
                      aria-current={isActive ? "location" : undefined}
                      onClick={onNavigate}
                      className={`flex min-h-11 items-center justify-between rounded-xl px-3 text-sm transition-colors ${
                        isActive
                          ? "bg-surface-2 font-medium text-fg"
                          : "text-fg-soft hover:bg-surface-2 hover:text-fg"
                      }`}
                    >
                      {item.label}
                      {isActive ? (
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-blue-fg" />
                      ) : null}
                    </Link>
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { useEffect, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "motion/react";
import { BadgeCheck, BriefcaseBusiness, CodeXml, FolderKanban, House, Mail, X } from "lucide-react";
import { navigation } from "@/lib/site";
import { dockProps } from "@/lib/dock";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface MobileMenuPanelProps {
  open: boolean;
  id: string;
  active: string;
  panelRef: RefObject<HTMLDivElement | null>;
  onNavigate: () => void;
  onClose: () => void;
}

const sectionIcons = [House, FolderKanban, BriefcaseBusiness, CodeXml, BadgeCheck, Mail];

/** Loaded on first interaction, so Motion's presence animations never ship to desktop visitors. */
export default function MobileMenuPanel({
  open,
  id,
  active,
  panelRef,
  onNavigate,
  onClose,
}: MobileMenuPanelProps) {
  const onHome = usePathname() === "/";
  const lenis = useLenis();
  useEffect(() => {
    if (open) {
      const panel = panelRef.current;
      const link =
        panel?.querySelector<HTMLAnchorElement>('a[aria-current="location"]') ??
        panel?.querySelector<HTMLAnchorElement>("a");
      link?.focus({ preventScroll: true });
    }
  }, [open, panelRef]);

  // Portaled to <body> so the fixed panel sits outside the sticky header (its stacking context
  // and pointer-events: none).
  return createPortal(
    <AnimatePresence>
      {open ? (
        <m.div
          ref={panelRef}
          id={id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.18 }}
          {...dockProps(
            "pointer-events-auto fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+16px)] z-[60] mx-auto max-w-sm rounded-3xl p-2 sm:hidden",
          )}
        >
          <nav aria-label="Sections">
            <div className="flex items-center justify-between pl-3">
              <span className="type-label tracking-widest text-muted uppercase">Navigation</span>
              <span className="ml-auto" />
              <ThemeToggle />
              <button
                type="button"
                aria-label="Close navigation"
                onClick={onClose}
                className="flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-fg/5 hover:text-fg"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
            <ul className="grid grid-cols-3 gap-1">
              {navigation.map((item, index) => {
                const isActive = active === item.id;
                const Icon = sectionIcons[index] ?? House;
                return (
                  <li key={item.id}>
                    <Link
                      href={`/#${item.id}`}
                      scroll={!onHome}
                      onNavigate={() => lenis?.scrollTo(lenis.actualScroll, { immediate: true })}
                      aria-current={isActive ? "location" : undefined}
                      onClick={onNavigate}
                      className={`flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-2xl px-1 text-xs transition-colors ${
                        isActive
                          ? "nav-indicator font-medium text-fg"
                          : "text-fg-soft hover:bg-fg/5 hover:text-fg"
                      }`}
                    >
                      <Icon aria-hidden="true" className="size-[18px]" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </m.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

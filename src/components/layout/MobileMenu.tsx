"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Menu, X } from "lucide-react";
import { navigation } from "@/lib/site";
import { useActiveSection } from "@/hooks/useActiveSection";

const sectionIds = navigation.map((item) => item.id);
const loadPanel = () => import("./MobileMenuPanel");
const MobileMenuPanel = dynamic(loadPanel, { ssr: false });

/** Section navigation for small screens (the dock takes over from `md`). */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(sectionIds);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) close(false);
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 768px)").matches) close(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onPointerEnter={loadPanel}
        onFocus={loadPanel}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-10 items-center justify-center rounded-lg text-fg-soft transition-colors hover:bg-surface-2 hover:text-fg"
      >
        {open ? (
          <X aria-hidden="true" className="size-5" />
        ) : (
          <Menu aria-hidden="true" className="size-5" />
        )}
      </button>
      <MobileMenuPanel
        open={open}
        id={panelId}
        active={active}
        panelRef={panelRef}
        onNavigate={() => close(false)}
      />
    </div>
  );
}

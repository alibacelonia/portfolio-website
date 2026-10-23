"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import dynamic from "next/dynamic";
const loadPanel = () => import("./MobileMenuPanel");
const MobileMenuPanel = dynamic(loadPanel, { ssr: false });

/** Section navigation below `sm`, where the inline links do not fit. */
export function MobileMenu({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus({ preventScroll: true });
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
      if (window.matchMedia("(min-width: 640px)").matches) close(false);
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
    <div className="w-full sm:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`<A/B> ALI, ${open ? "Close menu" : "Open menu"}`}
        onPointerEnter={loadPanel}
        onFocus={loadPanel}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-full items-center justify-between rounded-full px-4 text-fg transition-colors hover:bg-fg/5"
      >
        <span className="font-mono text-sm font-medium tracking-tight">{"<A/B>"}</span>
        <span className="text-xs font-semibold tracking-[0.2em]">ALI</span>
      </button>
      <MobileMenuPanel
        open={open}
        id={panelId}
        active={active}
        panelRef={panelRef}
        onNavigate={() => close(true)}
        onClose={() => close(true)}
      />
    </div>
  );
}

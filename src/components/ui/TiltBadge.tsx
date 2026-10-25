"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

/** Largest lean, in degrees, when the pointer is at the badge's edge. */
const MAX_TILT = 14;

/**
 * Leans its badge toward the mouse pointer in 3D, with a sheen that follows the pointer and is
 * clipped to the badge's own shape (`maskSrc`), then eases back flat when the pointer leaves.
 * Mouse only: touch and pen input, and reduced motion, leave the badge still. The pointer only
 * sets CSS variables, so nothing re-renders.
 */
export function TiltBadge({
  children,
  maskSrc,
  className = "",
}: {
  children: ReactNode;
  maskSrc: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = el.getBoundingClientRect();
    // Pointer position across the badge, from -0.5 (left/top) to 0.5 (right/bottom).
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.dataset.tilting = "";
      el.style.setProperty("--tilt-x", `${(-y * 2 * MAX_TILT).toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${(x * 2 * MAX_TILT).toFixed(2)}deg`);
      el.style.setProperty("--glare-x", `${((x + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--glare-y", `${((y + 0.5) * 100).toFixed(1)}%`);
    });
  };

  const onPointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    delete el.dataset.tilting;
    el.style.removeProperty("--tilt-x");
    el.style.removeProperty("--tilt-y");
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={`tilt-badge ${className}`}
      style={{ "--badge-mask": `url("${maskSrc}")` } as CSSProperties}
    >
      <div className="tilt-badge-inner">
        {children}
        <span aria-hidden="true" className="tilt-badge-glare" />
      </div>
    </div>
  );
}

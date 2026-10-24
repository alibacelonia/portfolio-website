"use client";

import { useEffect, useId, useRef } from "react";
import { Eye } from "lucide-react";

const LABEL = "VIEW · EXPLORE · DISCOVER · ";
/** Radius of the circle the label runs along, in the 100-unit SVG box. */
const TEXT_RADIUS = 42;
/** Share of the remaining distance the cursor closes each frame (a soft, lagging follow). */
const FOLLOW = 0.22;

/**
 * Custom cursor over project cards, modeled on the owner's reference: a light disc with slowly
 * rotating text around an eye, inside a dotted ring. Mouse only (`hover: hover` and
 * `pointer: fine`); touch, keyboard and forced-colors users keep the native behavior. Purely
 * decorative: the cards' links and the details panel carry the meaning.
 */
export function ProjectCursor({ selector }: { selector: string }) {
  const root = useRef<HTMLDivElement>(null);
  const pathId = useId();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const html = document.documentElement;
    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;
    let frame = 0;
    let shown = false;
    let seen = false;

    // Hides the native cursor over cards only while this component can replace it.
    const enable = () => html.toggleAttribute("data-project-cursor", fine.matches);
    const place = () => {
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    };
    const tick = () => {
      cx += (x - cx) * FOLLOW;
      cy += (y - cy) * FOLLOW;
      if (Math.abs(x - cx) + Math.abs(y - cy) < 0.3) {
        cx = x;
        cy = y;
        frame = 0;
      } else {
        frame = requestAnimationFrame(tick);
      }
      place();
    };
    const update = (target: Element | null) => {
      const over = fine.matches && Boolean(target?.closest(selector));
      if (over && !shown) {
        // Appear under the pointer rather than sliding in from the last position.
        cx = x;
        cy = y;
        place();
      }
      if (over !== shown) {
        shown = over;
        el.toggleAttribute("data-visible", over);
      }
      if (!over) return;
      if (reduce.matches) {
        cx = x;
        cy = y;
        place();
      } else if (!frame) {
        frame = requestAnimationFrame(tick);
      }
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      seen = true;
      x = event.clientX;
      y = event.clientY;
      update(event.target as Element);
    };
    // Scrolling moves cards under a still pointer without a pointermove.
    const onScroll = () => {
      if (seen) update(document.elementFromPoint(x, y));
    };
    const onOut = (event: PointerEvent) => {
      if (!event.relatedTarget) update(null);
    };

    enable();
    fine.addEventListener("change", enable);
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      fine.removeEventListener("change", enable);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("scroll", onScroll);
      html.removeAttribute("data-project-cursor");
    };
  }, [selector]);

  return (
    <div ref={root} aria-hidden="true" className="project-cursor">
      <div className="project-cursor-ring">
        <div className="project-cursor-disc">
          <svg viewBox="0 0 100 100" className="size-full overflow-visible">
            <defs>
              <path
                id={pathId}
                d={`M 50,50 m -${TEXT_RADIUS},0 a ${TEXT_RADIUS},${TEXT_RADIUS} 0 1,1 ${2 * TEXT_RADIUS},0 a ${TEXT_RADIUS},${TEXT_RADIUS} 0 1,1 -${2 * TEXT_RADIUS},0`}
              />
            </defs>
            <text dominantBaseline="hanging">
              <textPath
                href={`#${pathId}`}
                textLength={Math.round(2 * Math.PI * TEXT_RADIUS)}
                lengthAdjust="spacing"
              >
                {LABEL}
              </textPath>
            </text>
          </svg>
        </div>
        <span className="project-cursor-eye">
          <Eye strokeWidth={1.75} className="size-6" />
        </span>
      </div>
    </div>
  );
}

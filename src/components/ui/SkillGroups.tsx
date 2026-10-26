"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * A discipline's skill groups. Below `lg`, groups after the first (`.skill-group-extra`) stay folded
 * behind one button so the section stays short on phones. Desktop, and every width without
 * JavaScript, show everything (the folding CSS needs `html.js`).
 */
export function SkillGroups({
  children,
  hiddenCount,
  discipline,
}: {
  children: ReactNode;
  hiddenCount: number;
  discipline: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return (
    <>
      <div id={id} data-expanded={expanded || undefined} className="skill-groups mt-5 space-y-5">
        {children}
      </div>
      {hiddenCount > 0 ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((value) => !value)}
          className="skill-more mt-4 min-h-10 items-center gap-1.5 type-action text-muted transition-colors hover:text-fg"
        >
          <ChevronDown
            aria-hidden="true"
            className={`size-3.5 transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Show fewer" : `Show ${hiddenCount} more`}
          <span className="sr-only"> {discipline} tools</span>
        </button>
      ) : null}
    </>
  );
}

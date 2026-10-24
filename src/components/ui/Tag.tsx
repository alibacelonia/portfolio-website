import type { SkillLevel } from "@/types/content";
import { stagger } from "@/lib/motion";

interface TagProps {
  children: string;
  level?: SkillLevel;
  /** Position in a "ripple" entrance cascade, when the list is a [data-reveal-group]. */
  index?: number;
}

export function Tag({ children, level = "hands-on", index }: TagProps) {
  const working = level === "working";
  return (
    <li
      style={index === undefined ? undefined : stagger(index)}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs leading-5 text-fg-soft ${
        working ? "border-dashed border-border-strong bg-transparent" : "border-border bg-surface-2"
      }`}
    >
      {children}
      {working ? (
        <>
          {" "}
          <span className="sr-only">(working knowledge)</span>
        </>
      ) : null}
    </li>
  );
}

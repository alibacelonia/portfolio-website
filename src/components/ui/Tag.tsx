import type { SkillLevel } from "@/types/content";
import { stagger } from "@/lib/motion";

interface TagProps {
  children: string;
  level?: SkillLevel;
  /** Position in a "ripple" entrance cascade, when the list is a [data-reveal-group]. */
  index?: number;
  /** "pill": the rounded, faint key-technology chip of the case-study panels (after the reference). */
  shape?: "square" | "pill";
}

export function Tag({ children, level = "hands-on", index, shape = "square" }: TagProps) {
  const working = level === "working";
  const look =
    shape === "pill"
      ? "rounded-full glass-chip px-2.5 text-fg-soft"
      : `rounded-md px-2 text-fg-soft ${
          working ? "border-dashed border-border-strong bg-transparent" : "glass-chip"
        }`;
  return (
    <li
      style={index === undefined ? undefined : stagger(index)}
      className={`inline-flex items-center border py-0.5 text-xs leading-5 ${look}`}
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

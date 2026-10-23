import type { SkillLevel } from "@/types/content";

interface TagProps {
  children: string;
  level?: SkillLevel;
}

export function Tag({ children, level = "hands-on" }: TagProps) {
  const working = level === "working";
  return (
    <li
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs leading-5 text-fg-soft ${
        working ? "border-dashed border-border-strong bg-transparent" : "border-border bg-surface-2"
      }`}
    >
      {children}
      {working ? <span className="sr-only"> (working knowledge)</span> : null}
    </li>
  );
}

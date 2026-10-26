import { ArrowUpRight, ChevronDown } from "lucide-react";
import type { Skill } from "@/types/content";
import type { SkillEvidence } from "@/lib/skill-evidence";
import { stagger } from "@/lib/motion";
import { TechnologyIcon } from "./TechnologyIcon";
import { Tag } from "./Tag";

/** Native disclosure: works with touch, keyboard and no JavaScript, without a tooltip bundle. */
export function SkillTag({
  skill,
  evidence,
  index,
  group,
}: {
  skill: Skill;
  evidence: SkillEvidence[];
  index: number;
  group: string;
}) {
  const icon = <TechnologyIcon name={skill.name} />;
  if (!evidence.length)
    return (
      <Tag level={skill.level} index={index} icon={icon}>
        {skill.name}
      </Tag>
    );
  const working = skill.level === "working";
  return (
    <li className="skill-item" style={stagger(index)}>
      <details name={group} className="skill-disclosure">
        <summary
          className={`inline-flex min-h-8 cursor-pointer list-none items-center gap-1.5 rounded-md border px-2 text-xs leading-5 text-fg-soft transition-colors hover:border-blue-fg hover:text-fg [&::-webkit-details-marker]:hidden ${working ? "border-dashed border-border-strong" : "glass-chip"}`}
        >
          {icon}
          <span>
            {skill.name}
            {working ? <span className="sr-only"> (working knowledge)</span> : null}
          </span>
          <ChevronDown aria-hidden="true" className="skill-chevron size-3 shrink-0 text-muted" />
        </summary>
        <div className="mt-2 rounded-lg glass-chip p-3">
          <p className="type-label text-muted">In the documented stack for</p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            {evidence.slice(0, 2).map((project) => (
              <li key={project.href}>
                {project.external ? (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-8 items-center gap-1 type-action text-fg hover:underline"
                  >
                    {project.name}
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <a
                    href={project.href}
                    className="inline-flex min-h-8 items-center gap-1 type-action text-fg hover:underline"
                  >
                    {project.name}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </details>
    </li>
  );
}

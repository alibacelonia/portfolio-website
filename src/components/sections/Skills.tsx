import { skills } from "@/data/skills";
import { disciplineDot } from "@/lib/disciplines";
import { Section } from "@/components/ui/Section";
import { SkillTag } from "@/components/ui/SkillTag";
import { SkillGroups } from "@/components/ui/SkillGroups";
import { findSkillProjects } from "@/lib/skill-evidence";
import { stagger } from "@/lib/motion";

function Legend() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 type-small text-muted"
    >
      <span className="inline-flex items-center gap-2">
        <span className="inline-block h-4 w-6 rounded glass-chip" />
        Hands-on
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="inline-block h-4 w-6 rounded border border-dashed border-border-strong" />
        Working knowledge
      </span>
    </div>
  );
}

export function Skills() {
  return (
    <Section id="skills" label="Tech Stack" title="Tools I build with" aside={<Legend />}>
      <div data-reveal-group className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        {skills.map((discipline, index) => (
          <article
            key={discipline.id}
            style={stagger(index)}
            aria-labelledby={`skills-${discipline.id}`}
            className="card"
          >
            <h3
              id={`skills-${discipline.id}`}
              className="flex items-center gap-2.5 type-card-title"
            >
              <span
                aria-hidden="true"
                className={`size-2 rounded-full ${disciplineDot[discipline.id]}`}
              />
              {discipline.title}
            </h3>
            <p className="mt-2 type-body text-muted">{discipline.description}</p>

            <SkillGroups
              discipline={discipline.title}
              hiddenCount={discipline.groups
                .slice(1)
                .reduce((sum, group) => sum + group.skills.length, 0)}
            >
              {discipline.groups.map((group, groupIndex) => (
                <div key={group.label} className={groupIndex > 0 ? "skill-group-extra" : undefined}>
                  <h4 className="type-label text-muted">{group.label}</h4>
                  <ul data-reveal-group="ripple" className="mt-2 flex flex-wrap gap-1.5">
                    {group.skills.map((skill, tagIndex) => (
                      <SkillTag
                        key={skill.name}
                        skill={skill}
                        evidence={findSkillProjects(skill.name)}
                        index={tagIndex}
                        group={`skill-evidence-${discipline.id}`}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </SkillGroups>
          </article>
        ))}
      </div>
    </Section>
  );
}

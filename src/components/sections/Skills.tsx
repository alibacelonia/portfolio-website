import { skills } from "@/data/skills";
import { disciplineDot } from "@/lib/disciplines";
import { Section } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";

function Legend() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 type-small text-muted"
    >
      <span className="inline-flex items-center gap-2">
        <span className="inline-block h-4 w-6 rounded border border-border bg-surface-2" />
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
    <Section
      id="skills"
      index="04"
      title="Skills"
      lead={
        <>
          Grouped by discipline. Solid tags are tools used in production roles or public projects;
          dashed tags mark working knowledge.
        </>
      }
      aside={<Legend />}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        {skills.map((discipline) => (
          <article
            key={discipline.id}
            data-reveal
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

            <div className="mt-5 space-y-5">
              {discipline.groups.map((group) => (
                <div key={group.label}>
                  <h4 className="type-label text-muted">{group.label}</h4>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {group.skills.map((skill) => (
                      <Tag key={skill.name} level={skill.level}>
                        {skill.name}
                      </Tag>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

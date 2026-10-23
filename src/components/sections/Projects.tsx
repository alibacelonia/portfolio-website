import { Fragment } from "react";
import { projects } from "@/data/projects";
import { site } from "@/lib/site";
import type { Project, ProjectCategory } from "@/types/content";
import { Section } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";
import { ExternalLink } from "@/components/ui/Links";

const categoryDot: Record<ProjectCategory, string> = {
  "Full-Stack": "bg-blue",
  "DevOps / Cloud": "bg-sage",
  "AI Engineering": "bg-lavender",
  Automation: "bg-border-strong",
};

export function ProjectCard({ project }: { project: Project }) {
  const headingId = `project-${project.id}`;
  return (
    <article
      aria-labelledby={headingId}
      data-reveal
      className="group flex h-full min-w-0 flex-col rounded-xl border border-border bg-surface p-5 shadow-card transition-[border-color,box-shadow,transform] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-border-strong hover:shadow-raised sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <ul aria-label="Categories" className="flex flex-wrap gap-x-3 gap-y-1">
          {project.categories.map((category) => (
            <li key={category} className="inline-flex items-center gap-1.5 text-xs text-fg-soft">
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-full ${categoryDot[category]}`}
              />
              {category}
            </li>
          ))}
        </ul>
        <p className="font-mono text-[11px] text-muted">{project.status}</p>
      </div>

      <h3 id={headingId} className="mt-4 text-[17px] font-semibold tracking-tight text-fg">
        {project.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{project.purpose}</p>

      <p className="mt-4 rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-[11.5px] leading-relaxed text-fg-soft">
        <span className="sr-only">Architecture: </span>
        {project.architecture.map((step, index) => (
          <Fragment key={step}>
            {index > 0 ? (
              <>
                {" "}
                <span aria-hidden="true" className="text-muted">
                  →
                </span>
                <span className="sr-only">, then</span>{" "}
              </>
            ) : null}
            <span className="whitespace-nowrap">{step}</span>
          </Fragment>
        ))}
      </p>

      <ul className="mt-5 space-y-2.5 text-[13.5px] leading-relaxed text-fg-soft">
        {project.highlights.map((highlight) => (
          <li key={highlight} className="flex gap-2.5">
            <span aria-hidden="true" className="mt-[9px] h-px w-2.5 shrink-0 bg-border-strong" />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>

      <ul aria-label="Technologies" className="mt-5 mb-5 flex flex-wrap gap-1.5">
        {project.stack.map((tech) => (
          <Tag key={tech}>{tech}</Tag>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4 text-[13px] font-medium">
        {[project.repository, ...project.links].map((link) => (
          <ExternalLink
            key={link.href}
            href={link.href}
            className="min-h-8 text-fg-soft hover:text-fg"
            aria-label={`${project.name} on ${link.label} (opens in a new tab)`}
          >
            {link.label}
          </ExternalLink>
        ))}
      </div>
    </article>
  );
}

export function Projects() {
  return (
    <Section
      id="projects"
      index="02"
      title="Projects"
      tone="surface"
      lead="Open-source work across application development, cloud delivery and applied AI. Each one is tested, documented and kept deliberately small."
      aside={
        <ExternalLink href={site.github} className="font-mono text-xs text-muted hover:text-fg">
          github.com/alibacelonia
        </ExternalLink>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 2xl:grid-cols-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </Section>
  );
}

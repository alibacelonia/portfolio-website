import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { projects } from "@/data/projects";
import { site } from "@/lib/site";
import type { Project } from "@/types/content";
import { disciplineDot } from "@/lib/disciplines";
import { Section } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";
import { ExternalLink } from "@/components/ui/Links";

export function projectHref(project: Pick<Project, "id">): string {
  return `/projects/${project.id}/`;
}

/** External links for a project, in a fixed order: repository, live demo, extras. */
export function projectLinks(project: Project) {
  return [project.repository, ...(project.demo ? [project.demo] : []), ...project.links];
}

export function ProjectCard({ project }: { project: Project }) {
  const headingId = `project-${project.id}`;
  return (
    <article
      aria-labelledby={headingId}
      data-reveal
      className="flex h-full min-w-0 flex-col rounded-xl border border-border bg-surface p-5 shadow-card transition-[border-color,box-shadow,transform] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-border-strong hover:shadow-raised sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5">
        <p className="inline-flex min-w-0 items-center gap-2 text-xs text-fg-soft">
          <span
            aria-hidden="true"
            className={`size-1.5 shrink-0 rounded-full ${disciplineDot[project.discipline]}`}
          />
          {project.category}
        </p>
        <p className="font-mono text-[11px] text-muted">{project.status}</p>
      </div>

      <h3 id={headingId} className="mt-4 text-[17px] font-semibold tracking-tight text-fg">
        {project.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{project.summary}</p>

      <ul aria-label="Key technologies" className="mt-5 mb-6 flex flex-wrap gap-1.5">
        {project.keyTech.map((tech) => (
          <Tag key={tech}>{tech}</Tag>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-border pt-4 text-[13px] font-medium">
        <Link
          href={projectHref(project)}
          className="group inline-flex min-h-8 items-center gap-1.5 text-fg hover:underline"
        >
          View details <span className="sr-only">about {project.name}</span>
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {projectLinks(project).map((link) => (
            <ExternalLink
              key={link.href}
              href={link.href}
              className="min-h-8 text-muted hover:text-fg"
              aria-label={`${project.name} on ${link.label} (opens in a new tab)`}
            >
              {link.label}
            </ExternalLink>
          ))}
        </div>
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
      lead="Open-source work across application development, cloud delivery and applied AI. Each project page covers the problem, the solution, the stack and how it is built and shipped."
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

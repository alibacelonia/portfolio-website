import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { projects } from "@/data/projects";
import type { ClientWork, Project } from "@/types/content";
import { publishedClientWork } from "@/data/clientWork";
import { disciplineDot } from "@/lib/disciplines";
import { stagger } from "@/lib/motion";
import { Section } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";
import { ExternalLink } from "@/components/ui/Links";
import { ActionStrip } from "@/components/ui/ActionStrip";
import { CaseStudies } from "./CaseStudies";
import { buildCaseStudies } from "@/lib/caseStudies";

export function projectHref(project: Pick<Project, "id">): string {
  return `/projects/${project.id}/`;
}

/** External links for a project, in a fixed order: repository, live demo, extras. */
export function projectLinks(project: Project) {
  return [project.repository, ...(project.demo ? [project.demo] : []), ...project.links];
}

export function ProjectCard({
  project,
  headingLevel = 3,
  index = 0,
}: {
  project: Project;
  headingLevel?: 2 | 3 | 4;
  /** Position in the grid's entrance cascade. */
  index?: number;
}) {
  const headingId = `project-${project.id}`;
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <article
      aria-labelledby={headingId}
      data-project-discipline={project.discipline}
      style={stagger(index)}
      className="flex h-full min-w-0 flex-col card transition-[border-color,box-shadow,transform] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-border-strong hover:shadow-raised"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5">
        <p className="inline-flex min-w-0 items-center gap-2 text-xs text-fg-soft">
          <span
            aria-hidden="true"
            className={`size-1.5 shrink-0 rounded-full ${disciplineDot[project.discipline]}`}
          />
          {project.category}
        </p>
        <p className="type-label text-muted">{project.status}</p>
      </div>

      <Heading id={headingId} className="mt-3 type-project-title">
        {project.name}
      </Heading>
      <p className="mt-2 type-body text-muted">{project.summary}</p>

      <ul aria-label="Key technologies" className="mt-5 mb-6 flex flex-wrap gap-1.5">
        {project.keyTech.map((tech) => (
          <Tag key={tech}>{tech}</Tag>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-border pt-4 type-action">
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

export function ProjectGrid({ headingLevel = 3 }: { headingLevel?: 2 | 3 | 4 }) {
  return (
    <div
      data-reveal-group
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 2xl:grid-cols-4"
    >
      {projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} headingLevel={headingLevel} index={index} />
      ))}
    </div>
  );
}

/**
 * A wide card for commercial client work. With a screenshot: the image on the left and every
 * detail on the right. Without one: details on the left, contributions and technologies right.
 */
export function ClientWorkCard({
  work,
  headingLevel = 4,
}: {
  work: ClientWork;
  headingLevel?: 3 | 4;
}) {
  const headingId = `client-${work.id}`;
  const Heading = `h${headingLevel}` as "h3" | "h4";
  const contributions = work.contributions ?? [];

  const header = (
    <>
      {/* Shown under the "Professional work" heading, so it isn't labelled "Client work" again. */}
      <p className="inline-flex items-center gap-2 text-xs text-fg-soft">
        <span
          aria-hidden="true"
          className={`size-1.5 shrink-0 rounded-full ${disciplineDot[work.discipline]}`}
        />
        {work.category}
      </p>
      <Heading id={headingId} className="mt-3 type-project-title">
        {work.name}
      </Heading>
      <p className="mt-2 type-body text-muted">{work.summary}</p>
      <dl className="mt-4 space-y-1">
        <div>
          <dt className="sr-only">Role</dt>
          <dd className="type-body text-fg-soft">{work.role}</dd>
        </div>
        <div>
          <dt className="sr-only">Period</dt>
          <dd className="type-mono text-muted">{work.period}</dd>
        </div>
      </dl>
    </>
  );

  const contributionList = contributions.length ? (
    <>
      <p className="type-label text-muted">What I built</p>
      <ul className="mt-3 space-y-2.5 type-body text-fg-soft">
        {contributions.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span aria-hidden="true" className="mt-[11px] h-px w-2.5 shrink-0 bg-sage" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </>
  ) : null;

  const technologies = (
    <>
      <p className="mb-3 type-label text-muted">Technologies</p>
      <ul aria-label="Technologies" className="flex flex-wrap gap-1.5">
        {work.tech.map((tech) => (
          <Tag key={tech}>{tech}</Tag>
        ))}
      </ul>
    </>
  );

  // The wrapper's padding keeps a gap above the divider even when pushed down with mt-auto.
  const productLink = (
    <div className="pt-5 lg:mt-auto">
      <div className="border-t border-border pt-4 type-action">
        <ExternalLink
          href={work.link.href}
          className="min-h-8 text-fg hover:underline"
          aria-label={`${work.link.label}: ${work.name} product site (opens in a new tab)`}
        >
          {work.link.label}
        </ExternalLink>
      </div>
    </div>
  );

  if (work.screenshot) {
    return (
      <article
        aria-labelledby={headingId}
        data-project-discipline={work.discipline}
        data-reveal
        className="grid grid-cols-1 gap-6 card lg:grid-cols-12 lg:gap-8"
      >
        {/* Centered beside the details when they run taller than the image (around 1024px). */}
        <div className="min-w-0 lg:col-span-7 lg:self-center">
          <Image
            src={work.screenshot.src}
            alt={work.screenshot.alt}
            width={work.screenshot.width}
            height={work.screenshot.height}
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="h-auto w-full rounded-lg border border-border"
          />
        </div>
        <div className="flex min-w-0 flex-col lg:col-span-5">
          {header}
          {contributionList ? <div className="mt-5">{contributionList}</div> : null}
          <div className="mt-5">{technologies}</div>
          {productLink}
        </div>
      </article>
    );
  }

  return (
    <article
      aria-labelledby={headingId}
      data-project-discipline={work.discipline}
      data-reveal
      className="grid grid-cols-1 gap-6 card lg:grid-cols-12 lg:gap-10"
    >
      <div
        className={`flex min-w-0 flex-col ${contributions.length ? "lg:col-span-5" : "lg:col-span-7"}`}
      >
        {header}
        {productLink}
      </div>
      <div className={`min-w-0 ${contributions.length ? "lg:col-span-7" : "lg:col-span-5"}`}>
        {contributionList ? <div className="mb-5">{contributionList}</div> : null}
        {technologies}
      </div>
    </article>
  );
}

function GroupHeading({ level, children }: { level: 2 | 3; children: string }) {
  const Heading = `h${level}` as "h2" | "h3";
  return (
    <Heading className="mb-4 flex items-center gap-3 type-mono text-muted after:h-px after:flex-1 after:bg-border lg:mb-5">
      {children}
    </Heading>
  );
}

/**
 * Projects, optionally preceded by published client work. Without client work this is just the
 * open-source grid at `level`; with it, group headings take `level` and cards move one below.
 */
export function ProjectCollection({
  level,
  work = publishedClientWork,
}: {
  level: 2 | 3;
  work?: ClientWork[];
}) {
  if (work.length === 0) return <ProjectGrid headingLevel={level} />;
  const cardLevel = (level + 1) as 3 | 4;
  return (
    <div className="space-y-10 sm:space-y-12">
      <div
        data-project-group
        data-project-disciplines={[...new Set(work.map((item) => item.discipline))].join(" ")}
      >
        <GroupHeading level={level}>Professional work</GroupHeading>
        <div className="space-y-4 lg:space-y-5">
          {work.map((item) => (
            <ClientWorkCard key={item.id} work={item} headingLevel={cardLevel} />
          ))}
        </div>
      </div>
      <div
        data-project-group
        data-project-disciplines={[...new Set(projects.map((item) => item.discipline))].join(" ")}
      >
        <GroupHeading level={level}>Open source</GroupHeading>
        <ProjectGrid headingLevel={cardLevel} />
      </div>
    </div>
  );
}

export function Projects() {
  return (
    <Section
      id="projects"
      label="Case Studies"
      title="Curated work"
      flush
      footer={<ActionStrip href="/projects/">View all projects</ActionStrip>}
    >
      <CaseStudies studies={buildCaseStudies()} />
    </Section>
  );
}

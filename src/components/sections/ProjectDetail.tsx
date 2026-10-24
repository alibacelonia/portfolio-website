import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { projects } from "@/data/projects";
import type { Project } from "@/types/content";
import { Tag } from "@/components/ui/Tag";
import { ExternalLink } from "@/components/ui/Links";
import { Section } from "@/components/ui/Section";
import { ActionStrip } from "@/components/ui/ActionStrip";
import { OverviewStrip } from "@/components/ui/OverviewStrip";
import { disciplineDot, disciplineLabel } from "@/lib/disciplines";
import { stagger } from "@/lib/motion";
import { projectHref, projectLinks } from "./Projects";

/** A small left-to-right flow; wraps on narrow screens. */
export function FlowDiagram({ steps, label }: { steps: string[]; label: string }) {
  return (
    <ol
      aria-label={label}
      className="flex flex-wrap items-center gap-x-2 gap-y-2 card type-mono text-fg-soft"
    >
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-2">
          {index > 0 ? (
            <span aria-hidden="true" className="text-muted">
              →
            </span>
          ) : null}
          <span className="rounded-md border border-border bg-surface-2 px-2 py-1 whitespace-nowrap">
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}

/**
 * A project page built from the same framed bands as the home page: a header band closed by an
 * "at a glance" strip, then Overview, Solution and Architecture bands, ending in a strip that
 * leads to the next project.
 */
export function ProjectDetail({ project }: { project: Project }) {
  const position = projects.findIndex((p) => p.id === project.id);
  const next = projects[(position + 1) % projects.length]!;
  const links = [...projectLinks(project), ...(project.docs ? [project.docs] : [])];

  return (
    <>
      <Section
        id="project"
        first
        headingLevel={1}
        title={project.name}
        eyebrow={
          <span className="inline-flex items-center gap-2 text-fg-soft">
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full ${disciplineDot[project.discipline]}`}
            />
            {project.category}
          </span>
        }
        lead={project.summary}
        before={
          <Link
            href="/projects/"
            className="mb-4 inline-flex min-h-10 items-center gap-1.5 type-action text-muted transition-colors hover:text-fg"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            All projects
          </Link>
        }
        aside={
          <ul className="flex flex-wrap gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <ExternalLink
                  href={link.href}
                  className="min-h-10 rounded-lg border border-border-strong bg-surface px-3.5 type-action text-fg transition-colors hover:bg-surface-2"
                  aria-label={`${project.name}: ${link.label} (opens in a new tab)`}
                >
                  {link.label}
                </ExternalLink>
              </li>
            ))}
          </ul>
        }
        footer={
          <OverviewStrip
            label="Project at a glance"
            cells={[
              { label: "Status", value: project.status },
              {
                label: "Discipline",
                value: disciplineLabel[project.discipline],
                accent: disciplineDot[project.discipline],
              },
              { label: "Key stack", value: project.keyTech.slice(0, 2).join(", ") },
              {
                label: "Repository",
                value: "View on GitHub",
                href: project.repository.href,
                external: true,
                linkLabel: `View on GitHub: ${project.name}`,
              },
            ]}
          />
        }
      />

      <Section id="overview" index="01" title="Overview">
        <div data-reveal-group className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <article style={stagger(0)} className="card lg:col-span-7">
            <h3 className="type-card-title">What it does</h3>
            <div className="mt-3 max-w-[68ch] space-y-4 type-prose text-fg-soft">
              {project.overview.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
          <article style={stagger(1)} className="flex flex-col card lg:col-span-5">
            <h3 className="type-card-title">Problem</h3>
            <p className="mt-3 type-prose text-fg-soft">{project.problem}</p>
            <div className="mt-5 rounded-lg border border-border bg-surface-2 p-4 lg:mt-auto">
              <h4 className="type-label text-fg-soft">Who it helps</h4>
              <p className="mt-1.5 type-body text-fg-soft">{project.audience}</p>
            </div>
          </article>
        </div>
      </Section>

      <Section id="solution" index="02" title="Solution">
        <div data-reveal-group className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <ul
            style={stagger(0)}
            aria-label="Implemented features"
            className="divide-y divide-border overflow-hidden card-shell lg:col-span-7"
          >
            {project.solution.map((item) => (
              <li key={item} className="flex gap-3 p-5 type-body text-fg-soft sm:px-6">
                <span aria-hidden="true" className="mt-[11px] h-px w-3 shrink-0 bg-sage" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <article style={stagger(1)} className="card lg:col-span-5">
            <h3 className="type-card-title">Technology stack</h3>
            <dl className="mt-4 space-y-5">
              {project.stack.map((group) => (
                <div key={group.group}>
                  <dt className="type-label text-muted">{group.group}</dt>
                  <dd className="mt-2">
                    <ul className="flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <Tag key={item}>{item}</Tag>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        </div>
      </Section>

      <Section
        id="infrastructure"
        index="03"
        title="Infrastructure & architecture"
        lead={project.infrastructure.summary}
        footer={
          <ActionStrip href={projectHref(next)} label={`Next project: ${next.name}`}>
            Next project: <span className="text-fg">{next.name}</span>
          </ActionStrip>
        }
      >
        <div data-reveal className="space-y-4 lg:space-y-5">
          {project.infrastructure.diagram ? (
            <FlowDiagram steps={project.infrastructure.diagram} label={`${project.name} flow`} />
          ) : null}
          <dl className="divide-y divide-border overflow-hidden card-shell type-body">
            {project.infrastructure.items.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-1 gap-1 p-5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6 sm:px-6"
              >
                <dt className="flex flex-wrap items-center gap-2 font-medium text-fg">
                  {item.label}
                  {item.status === "planned" ? (
                    <span className="rounded-md border border-dashed border-border-strong px-1.5 py-px type-label font-normal text-muted">
                      planned
                    </span>
                  ) : null}
                </dt>
                <dd className="text-fg-soft">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>
    </>
  );
}

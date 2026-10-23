import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { projects } from "@/data/projects";
import type { Project } from "@/types/content";
import { Tag } from "@/components/ui/Tag";
import { ExternalLink } from "@/components/ui/Links";
import { disciplineDot } from "@/lib/disciplines";
import { projectHref, projectLinks } from "./Projects";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "stack", label: "Technology stack" },
  { id: "infrastructure", label: "Infrastructure & architecture" },
  { id: "links", label: "Links" },
] as const;

function DetailSection({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-border pt-8">
      <p aria-hidden="true" className="font-mono text-[11px] text-muted">
        {String.fromCharCode(65 + index)}
      </p>
      <h2 id={`${id}-title`} className="mt-1 text-lg font-semibold tracking-tight text-fg">
        {title}
      </h2>
      <div className="mt-4 text-[15px] leading-relaxed text-fg-soft">{children}</div>
    </section>
  );
}

/** A small left-to-right flow; wraps on narrow screens. */
export function FlowDiagram({ steps, label }: { steps: string[]; label: string }) {
  return (
    <ol
      aria-label={label}
      className="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-xl border border-border bg-surface-2 p-3 font-mono text-[12px] text-fg-soft sm:p-4"
    >
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-2">
          {index > 0 ? (
            <span aria-hidden="true" className="text-muted">
              →
            </span>
          ) : null}
          <span className="rounded-md border border-border bg-surface px-2 py-1 whitespace-nowrap">
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function ProjectDetail({ project }: { project: Project }) {
  const position = projects.findIndex((p) => p.id === project.id);
  const next = projects[(position + 1) % projects.length]!;
  const links = [...projectLinks(project), ...(project.docs ? [project.docs] : [])];

  return (
    <article className="container-fluid pt-[calc(var(--nav-offset)+40px)] pb-20 sm:pb-24">
      <Link
        href="/projects/"
        className="inline-flex min-h-10 items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5" />
        All projects
      </Link>

      <header className="mt-6 pb-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <p className="inline-flex items-center gap-2 text-xs text-fg-soft">
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full ${disciplineDot[project.discipline]}`}
            />
            {project.category}
          </p>
          <p className="font-mono text-[11px] text-muted">{project.status}</p>
        </div>
        <h1 className="mt-4 text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] leading-tight font-semibold tracking-tight text-fg">
          {project.name}
        </h1>
        <p className="mt-4 max-w-[68ch] text-base leading-relaxed text-muted">{project.summary}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {links.map((link) => (
            <li key={link.href}>
              <ExternalLink
                href={link.href}
                className="min-h-10 rounded-lg border border-border-strong bg-surface px-3.5 text-[13px] font-medium text-fg transition-colors hover:bg-surface-2"
                aria-label={`${project.name}: ${link.label} (opens in a new tab)`}
              >
                {link.label}
              </ExternalLink>
            </li>
          ))}
        </ul>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <nav aria-label="On this page" className="hidden lg:col-span-3 lg:block">
          <ol className="sticky top-[calc(var(--nav-offset)+32px)] space-y-1 border-l border-border font-mono text-[12px]">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="-ml-px flex min-h-8 items-center gap-2 border-l border-transparent pl-4 text-muted transition-colors hover:border-fg hover:text-fg"
                >
                  <span aria-hidden="true">{String.fromCharCode(65 + index)}</span>
                  {section.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 space-y-10 lg:col-span-9 xl:col-span-8">
          <DetailSection id="overview" index={0} title="Overview">
            <div className="max-w-[68ch] space-y-4">
              {project.overview.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </DetailSection>

          <DetailSection id="problem" index={1} title="Problem">
            <p className="max-w-[68ch]">{project.problem}</p>
            <div className="mt-5 max-w-[68ch] rounded-xl border border-border bg-surface p-4">
              <h3 className="font-mono text-[11px] text-muted">Who it helps</h3>
              <p className="mt-1.5 text-sm">{project.audience}</p>
            </div>
          </DetailSection>

          <DetailSection id="solution" index={2} title="Solution">
            <ul className="max-w-[72ch] space-y-3 text-[14.5px]">
              {project.solution.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-[11px] h-px w-3 shrink-0 bg-border-strong"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection id="stack" index={3} title="Technology stack">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              {project.stack.map((group) => (
                <div key={group.group}>
                  <dt className="font-mono text-[11px] text-muted">{group.group}</dt>
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
          </DetailSection>

          <DetailSection id="infrastructure" index={4} title="Infrastructure & architecture">
            <p className="max-w-[68ch]">{project.infrastructure.summary}</p>
            {project.infrastructure.diagram ? (
              <div className="mt-5">
                <FlowDiagram
                  steps={project.infrastructure.diagram}
                  label={`${project.name} flow`}
                />
              </div>
            ) : null}
            <dl className="mt-6 divide-y divide-border border-y border-border text-sm">
              {project.infrastructure.items.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-1 gap-1 py-3.5 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6"
                >
                  <dt className="flex items-center gap-2 font-medium text-fg">
                    {item.label}
                    {item.status === "planned" ? (
                      <span className="rounded-md border border-dashed border-border-strong px-1.5 py-px font-mono text-[10.5px] font-normal text-muted">
                        planned
                      </span>
                    ) : null}
                  </dt>
                  <dd className="text-fg-soft">{item.detail}</dd>
                </div>
              ))}
            </dl>
          </DetailSection>

          <DetailSection id="links" index={5} title="Links">
            <ul className="space-y-2 text-sm">
              {links.map((link) => (
                <li key={link.href}>
                  <ExternalLink
                    href={link.href}
                    className="min-h-8 font-medium break-all text-blue-fg hover:underline"
                  >
                    {link.label}
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </DetailSection>

          <div className="border-t border-border pt-8">
            <Link
              href={projectHref(next)}
              className="group inline-flex min-h-10 items-center gap-2 text-sm font-medium text-fg"
            >
              <span className="text-muted">Next project</span>
              {next.name}
              <ArrowRight
                aria-hidden="true"
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

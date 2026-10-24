import { ChevronDown } from "lucide-react";
import { experience, formatDuration, formatYearMonth, overlapsNext } from "@/data/experience";
import type { Role } from "@/types/content";
import { Section } from "@/components/ui/Section";

function RoleItem({ role, next }: { role: Role; next?: Role }) {
  const current = role.end === null;
  const duration = formatDuration(role);
  const concurrent = overlapsNext(role, next);
  return (
    <li
      id={`role-${role.id}`}
      data-reveal="slide"
      className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-y-2 md:grid-cols-[11rem_3.5rem_minmax(0,1fr)] md:gap-y-0"
    >
      {/* Dates stay pinned beside the card while it scrolls past (tablet and up). */}
      <div className="col-start-2 row-start-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 md:sticky md:top-[calc(var(--nav-offset)+24px)] md:col-start-1 md:block md:self-start md:pt-6">
        <p className="type-mono text-fg-soft">
          <time dateTime={role.start}>{formatYearMonth(role.start)}</time>
          {" – "}
          {role.end ? (
            <time dateTime={role.end} title={role.endDetail}>
              {formatYearMonth(role.end)}
            </time>
          ) : (
            "Present"
          )}
        </p>
        <p className="type-label text-muted md:mt-1.5">{duration ?? "Current role"}</p>
        {role.employment ? (
          <p className="type-label text-muted md:mt-1">{role.employment}</p>
        ) : null}
      </div>

      <div
        aria-hidden="true"
        className="relative col-start-1 row-span-2 row-start-1 md:col-start-2 md:row-span-1"
      >
        <span className="exp-node" data-current={current || undefined} />
        {next ? (
          <span className="exp-segment">
            <span className="exp-segment-fill" />
          </span>
        ) : null}
        {concurrent ? <span className="exp-branch" /> : null}
      </div>

      <article className="col-start-2 row-start-2 card md:col-start-3 md:row-start-1">
        <h3 className="type-card-title">{role.title}</h3>
        <p className="mt-1 type-body text-fg-soft">
          {role.organization}
          <span className="text-muted">, {role.location}</span>
        </p>

        {role.note ? (
          <p className="mt-3 flex max-w-[72ch] gap-2.5 rounded-lg border border-border bg-surface-2 px-3 py-2 type-small text-fg-soft">
            <span aria-hidden="true" className="mt-[7px] size-1.5 shrink-0 rounded-full bg-sage" />
            {role.note}
          </p>
        ) : null}

        <ul className="mt-4 grid gap-x-6 gap-y-1.5 type-body text-fg-soft lg:grid-cols-2">
          {role.summary.map((item) => (
            <li key={item} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-[11px] h-px w-2.5 shrink-0 bg-border-strong" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <details className="group mt-4 border-t border-border pt-3">
          <summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-1.5 rounded type-action text-muted transition-colors hover:text-fg [&::-webkit-details-marker]:hidden">
            <ChevronDown
              aria-hidden="true"
              className="size-3.5 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
            />
            <span className="group-open:hidden">Show details</span>
            <span className="hidden group-open:inline">Hide details</span>{" "}
            <span className="sr-only">for {role.title}</span>
          </summary>
          <ul className="mt-3 max-w-[72ch] space-y-2 type-body text-muted">
            {role.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </details>
      </article>
    </li>
  );
}

export function Experience() {
  return (
    <Section
      id="experience"
      index="03"
      title="Experience"
      lead="More than seven years across enterprise applications, government systems and cloud engineering, moving steadily from building software to automating how it is delivered and run."
    >
      <ol className="exp-timeline relative grid grid-cols-1">
        {experience.map((role, index) => (
          <RoleItem key={role.id} role={role} next={experience[index + 1]} />
        ))}
      </ol>
    </Section>
  );
}

import { ChevronDown } from "lucide-react";
import { experience, formatYearMonth } from "@/data/experience";
import type { Role } from "@/types/content";
import { Section } from "@/components/ui/Section";

function RoleItem({ role }: { role: Role }) {
  const current = role.end === null;
  return (
    <li
      data-reveal
      className="relative grid grid-cols-1 gap-3 md:grid-cols-[180px_minmax(0,1fr)] md:gap-8"
    >
      <div className="md:pt-5">
        <p className="font-mono text-xs text-fg-soft">
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
        {role.employment ? (
          <p className="mt-1.5 font-mono text-[11px] text-muted">{role.employment}</p>
        ) : null}
      </div>

      <article className="relative rounded-xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <span
          aria-hidden="true"
          className={`absolute top-6 -left-[5px] hidden size-[9px] rounded-full border md:block ${
            current ? "border-sage-fg bg-sage" : "border-border-strong bg-surface"
          }`}
        />
        <h3 className="text-base font-semibold tracking-tight text-fg">{role.title}</h3>
        <p className="mt-1 text-sm text-fg-soft">
          {role.organization}
          <span className="text-muted"> · {role.location}</span>
        </p>

        {role.note ? (
          <p className="mt-3 rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] text-fg-soft">
            {role.note}
          </p>
        ) : null}

        <ul className="mt-4 grid gap-x-6 gap-y-1.5 text-[13.5px] text-fg-soft sm:grid-cols-2">
          {role.summary.map((item) => (
            <li key={item} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-[10px] h-px w-2.5 shrink-0 bg-border-strong" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <details className="group mt-4 border-t border-border pt-3">
          <summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-1.5 rounded text-[13px] font-medium text-muted transition-colors hover:text-fg [&::-webkit-details-marker]:hidden">
            <ChevronDown
              aria-hidden="true"
              className="size-3.5 transition-transform duration-200 group-open:rotate-180"
            />
            <span className="group-open:hidden">Show details</span>
            <span className="hidden group-open:inline">Hide details</span>{" "}
            <span className="sr-only">for {role.title}</span>
          </summary>
          <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-muted">
            {role.details.map((detail) => (
              <li key={detail} className="measure">
                {detail}
              </li>
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
      lead="Eight years across enterprise applications, government systems and cloud engineering, moving steadily from building software to automating how it is delivered and run."
    >
      <ol className="relative grid grid-cols-1 gap-6 md:before:absolute md:before:top-0 md:before:bottom-0 md:before:left-[212px] md:before:w-px md:before:bg-border">
        {experience.map((role) => (
          <RoleItem key={role.id} role={role} />
        ))}
      </ol>
    </Section>
  );
}

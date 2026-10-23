import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  index: string;
  title: string;
  lead?: ReactNode;
  /** Right-aligned header content (legend, counts). */
  aside?: ReactNode;
  tone?: "bg" | "surface";
  children: ReactNode;
}

/** Full-width band with a consistent header. The heading id labels the region. */
export function Section({ id, index, title, lead, aside, tone = "bg", children }: SectionProps) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`border-t border-border py-16 sm:py-20 lg:py-24 ${tone === "surface" ? "bg-surface" : "bg-bg"}`}
    >
      <div className="container-fluid">
        <header
          data-reveal
          className="mb-10 flex flex-col gap-5 sm:mb-12 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="min-w-0">
            <p className="mb-3 font-mono text-xs tracking-wide text-muted">
              <span aria-hidden="true">{index} / </span>
              {title}
            </p>
            <h2
              id={headingId}
              className="text-[clamp(1.5rem,1.2rem+1vw,2rem)] leading-tight font-semibold tracking-tight text-fg"
            >
              {title}
            </h2>
            {lead ? <p className="mt-3 measure text-[15px] text-muted">{lead}</p> : null}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </header>
        {children}
      </div>
    </section>
  );
}

import type { ReactNode } from "react";
import { SectionFrame } from "./SectionFrame";

interface SectionProps {
  id: string;
  index: string;
  title: string;
  lead?: ReactNode;
  /** Right-aligned header content (legend, counts). */
  aside?: ReactNode;
  /** Optional full-width action row below the padded section content. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Full-width band with a consistent header. Every section shares the same background and
 * spacing; cards inside use the `card` utility. The heading id labels the region.
 */
export function Section({ id, index, title, lead, aside, footer, children }: SectionProps) {
  const headingId = `${id}-title`;
  return (
    <SectionFrame
      id={id}
      aria-labelledby={headingId}
      className={`bg-bg pt-16 sm:pt-20 lg:pt-24 ${footer ? "" : "pb-16 sm:pb-20 lg:pb-24"}`}
    >
      <div className="container-fluid">
        <header
          data-reveal
          className="section-panel mb-10 flex flex-col gap-5 p-5 sm:mb-12 sm:p-7 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="min-w-0">
            <p className="mb-3 type-eyebrow">
              <span aria-hidden="true">{index} / </span>
              {title}
            </p>
            <h2 id={headingId} className="type-section-title">
              {title}
            </h2>
            {lead ? <p className="mt-3 measure type-lead">{lead}</p> : null}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </header>
        {children}
      </div>
      {footer}
    </SectionFrame>
  );
}

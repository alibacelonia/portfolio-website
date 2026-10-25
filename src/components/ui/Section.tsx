import type { ReactNode } from "react";
import { SectionFrame } from "./SectionFrame";

interface SectionProps {
  id: string;
  /** Section number shown in the eyebrow ("02"). Ignored when `eyebrow` is set. */
  index?: string;
  /**
   * Section name after the number ("06 / Connect"), only when the title doesn't already name the
   * section; otherwise the eyebrow is just the number, so nothing is said twice.
   */
  label?: string;
  /** Custom eyebrow content, e.g. a project category. */
  eyebrow?: ReactNode;
  title: string;
  /** Page-level bands render the title as the page's h1. */
  headingLevel?: 1 | 2;
  /**
   * First band of a page: no divider above it (like the hero), room for the dock, and no
   * entrance animation so the largest text paints immediately.
   */
  first?: boolean;
  lead?: ReactNode;
  /** Right-aligned header content (legend, counts, links). */
  aside?: ReactNode;
  /** Content above the header panel, e.g. a back link. */
  before?: ReactNode;
  /** Optional full-width action row below the padded section content. */
  footer?: ReactNode;
  children?: ReactNode;
}

/**
 * Full-width band with a consistent header. Every section shares the same background and
 * spacing; cards inside use the `card` utility. The heading id labels the region.
 */
export function Section({
  id,
  index,
  label,
  eyebrow,
  title,
  headingLevel = 2,
  first = false,
  lead,
  aside,
  before,
  footer,
  children,
}: SectionProps) {
  const headingId = `${id}-title`;
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const top = first
    ? "section-frame--top pt-[calc(var(--nav-offset)+32px)]"
    : "pt-16 sm:pt-20 lg:pt-24";
  const bottom = footer ? "" : "pb-16 sm:pb-20 lg:pb-24";
  return (
    <SectionFrame id={id} aria-labelledby={headingId} className={`bg-bg ${top} ${bottom}`}>
      <div className="container-fluid">
        {before}
        <header
          data-reveal={first ? undefined : true}
          className={`section-panel flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between ${
            children || footer ? "mb-10 sm:mb-12" : ""
          }`}
        >
          <div className="min-w-0">
            <p className="mb-3 type-eyebrow">
              {eyebrow ?? <SectionIndex index={index} label={label} />}
            </p>
            <Heading
              id={headingId}
              className={headingLevel === 1 ? "type-page-title" : "type-section-title"}
            >
              {title}
            </Heading>
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

/** "02" or "06 / Connect": the number is decorative for screen readers; the name is read. */
export function SectionIndex({ index, label }: { index?: string; label?: string }) {
  return (
    <>
      <span aria-hidden="true">
        {index}
        {index && label ? " / " : null}
      </span>
      {label}
    </>
  );
}

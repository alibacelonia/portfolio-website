import type { ReactNode } from "react";
import { SectionFrame } from "./SectionFrame";

interface SectionProps {
  id: string;
  /** Section number in the overline ("02"). */
  index?: string;
  /** Section name in the overline ("Case Studies" → "02 — Case Studies"). */
  label?: string;
  /**
   * Custom eyebrow, e.g. a project category. Gives the boxed page-header layout (project pages)
   * instead of the centered display title used by numbered sections.
   */
  eyebrow?: ReactNode;
  /** Display title ("Curated work"); its last word is set in italic. */
  title: string;
  /** Page-level bands render the title as the page's h1. */
  headingLevel?: 1 | 2;
  /**
   * First band of a page: no divider above it (like the hero), room for the dock, and no
   * entrance animation so the largest text paints immediately.
   */
  first?: boolean;
  /** Page-header summary (boxed layout only); numbered sections have no description. */
  lead?: ReactNode;
  /** Header extras (legend, counts): beside the title in the boxed layout, below it otherwise. */
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
        {eyebrow !== undefined ? (
          <header
            data-reveal={first ? undefined : true}
            className={`section-panel flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between ${
              children || footer ? "mb-10 sm:mb-12" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="mb-3 type-eyebrow">{eyebrow}</p>
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
        ) : (
          <header
            data-reveal={first ? undefined : true}
            className={`mx-auto flex max-w-3xl flex-col items-center text-center ${
              children || footer ? "mb-12 sm:mb-14" : ""
            }`}
          >
            <p className="mb-4 type-overline text-muted">
              <SectionIndex index={index} label={label} />
            </p>
            <Heading id={headingId} className="type-display text-fg">
              <DisplayTitle text={title} />
            </Heading>
            {aside ? <div className="mt-6">{aside}</div> : null}
          </header>
        )}
        {children}
      </div>
      {footer}
    </SectionFrame>
  );
}

/** "02 — Case Studies": the number is decorative for screen readers; the name is read. */
export function SectionIndex({ index, label }: { index?: string; label?: string }) {
  return (
    <>
      <span aria-hidden="true">
        {index}
        {index && label ? " — " : null}
      </span>
      {label}
    </>
  );
}

/** A display title with its last word in italic ("Curated *work*"), after the reference. */
function DisplayTitle({ text }: { text: string }) {
  const split = text.lastIndexOf(" ");
  if (split < 0) return <em className="italic">{text}</em>;
  return (
    <>
      {text.slice(0, split + 1)}
      <em className="italic">{text.slice(split + 1)}</em>
    </>
  );
}

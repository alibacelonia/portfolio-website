import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export interface OverviewCell {
  label: string;
  value: ReactNode;
  /** Discipline dot color class, e.g. "bg-sage". */
  accent?: string;
  /** Turns the whole tile into a link. External links open in a new tab. */
  href?: string;
  external?: boolean;
  /** Accessible name for a linked tile when the visible value needs context. */
  linkLabel?: string;
}

const valueClassName =
  "mt-3 flex min-h-11 items-center text-sm leading-relaxed font-medium text-fg sm:text-base";
const tileLinkClassName =
  "group flex min-h-11 w-full items-center justify-between gap-2 before:absolute before:inset-0 before:transition-colors hover:before:bg-fg/5 focus-visible:before:outline-2 focus-visible:before:outline-offset-[-4px] focus-visible:before:outline-blue-fg";

/** Solid arrow shared by every linked tile so they stay identical. */
export function TileArrow({ external = false }: { external?: boolean }) {
  const Icon = external ? ArrowUpRight : ArrowRight;
  return (
    <span
      aria-hidden="true"
      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-fg text-bg transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
    >
      <Icon className="size-4" />
    </span>
  );
}

function CellLink({ cell }: { cell: OverviewCell }) {
  const content = (
    <>
      <span>{cell.value}</span>
      <TileArrow external={cell.external} />
    </>
  );
  if (cell.external) {
    return (
      <a
        href={cell.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={cell.linkLabel ? `${cell.linkLabel} (opens in a new tab)` : undefined}
        className={tileLinkClassName}
      >
        {content}
      </a>
    );
  }
  // In-page anchors stay plain links; routes use next/link for client-side navigation.
  return cell.href!.startsWith("#") ? (
    <a href={cell.href} aria-label={cell.linkLabel} className={tileLinkClassName}>
      {content}
    </a>
  ) : (
    <Link href={cell.href!} aria-label={cell.linkLabel} className={tileLinkClassName}>
      {content}
    </Link>
  );
}

/**
 * Four equal cells spanning the section rails, closing a band like the hero's "At a glance"
 * strip. Values must stay short (one or two lines): cell heights are fixed so the frame
 * junction markers line up.
 */
export function OverviewStrip({ cells, label }: { cells: OverviewCell[]; label: string }) {
  return (
    <div className="section-action hero-overview">
      <div aria-hidden="true" className="section-action-guides" />
      <dl aria-label={label} className="hero-overview-grid">
        {cells.map((cell) => (
          <div key={cell.label} className="hero-overview-cell">
            <dt className="flex items-center gap-2 type-label tracking-wide text-muted uppercase">
              {cell.accent ? (
                <span
                  aria-hidden="true"
                  className={`size-1.5 shrink-0 rounded-full ${cell.accent}`}
                />
              ) : null}
              {cell.label}
            </dt>
            <dd className={valueClassName}>{cell.href ? <CellLink cell={cell} /> : cell.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

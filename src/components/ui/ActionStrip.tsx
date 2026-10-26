import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { buttonStyles } from "./Links";

const linkClassName =
  "group inline-flex min-h-11 items-center gap-2 px-4 type-action text-muted transition-colors hover:text-fg";

function Arrow({ external }: { external: boolean }) {
  const Icon = external ? ArrowUpRight : ArrowRight;
  return (
    <span className="flex size-7 items-center justify-center rounded-full bg-fg/5 transition-colors group-hover:bg-fg/10">
      <Icon aria-hidden="true" className="size-3.5" />
    </span>
  );
}

/**
 * A hatched, full-width strip that closes a band with one centered action
 * (“View all projects”, “Next project”). The next band starts flush against it.
 * `prominent` makes it the page's closing call to action: a solid button (home Connect).
 */
export function ActionStrip({
  href,
  children,
  external = false,
  label,
  prominent = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  /** Accessible name when the visible text needs more context. */
  label?: string;
  prominent?: boolean;
}) {
  if (prominent && !external) {
    return (
      <div className="section-action mt-10 sm:mt-12">
        <div aria-hidden="true" className="section-action-guides" />
        <Link href={href} aria-label={label} className={`group ${buttonStyles.solid}`}>
          {children}
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
      </div>
    );
  }
  return (
    <div className="section-action mt-10 sm:mt-12">
      <div aria-hidden="true" className="section-action-guides" />
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label ? `${label} (opens in a new tab)` : undefined}
          className={linkClassName}
        >
          {children}
          {label ? null : <span className="sr-only">(opens in a new tab)</span>}
          <Arrow external />
        </a>
      ) : (
        <Link href={href} aria-label={label} className={linkClassName}>
          {children}
          <Arrow external={false} />
        </Link>
      )}
    </div>
  );
}

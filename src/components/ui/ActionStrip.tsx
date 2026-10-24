import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

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
 */
export function ActionStrip({
  href,
  children,
  external = false,
  label,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  /** Accessible name when the visible text needs more context. */
  label?: string;
}) {
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

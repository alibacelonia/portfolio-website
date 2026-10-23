"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";
import { navigation, site } from "@/lib/site";
import { useActiveSection } from "@/hooks/useActiveSection";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SectionNav } from "./SectionNav";
import { MobileMenu } from "./MobileMenu";

const sectionIds = navigation.map((item) => item.id);
const noSections: string[] = [];

/**
 * The single primary navigation: a sticky, floating glass bar. It overlaps the top of the page
 * (negative bottom margin) so the hero background runs behind it; content offsets use --nav-offset.
 */
export function Header() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const tracked = useActiveSection(onHome ? sectionIds : noSections);
  const active = onHome ? tracked : pathname.startsWith("/projects/") ? "projects" : "";

  return (
    <header className="pointer-events-none sticky top-0 z-50 -mb-[var(--nav-offset)] pt-[var(--nav-top)]">
      <div className="container-fluid">
        <div className="glass pointer-events-auto relative flex h-[var(--nav-h)] items-center justify-between gap-2 rounded-2xl pr-1.5 pl-2 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/#home"
            className="inline-flex size-10 items-center justify-center justify-self-start rounded-lg text-fg transition-colors hover:bg-surface-2"
            aria-label={`${site.name}, home`}
          >
            <Logo className="h-[17px] w-auto" />
          </Link>

          <SectionNav active={active} className="hidden lg:block" />

          <div className="flex items-center gap-1 justify-self-end">
            <ThemeToggle />
            <a
              href={site.resume.href}
              download={site.resume.fileName}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-[13px] font-medium text-fg transition-colors hover:border-border-strong hover:bg-surface-2"
            >
              <Download aria-hidden="true" className="size-3.5" />
              Resume <span className="sr-only">(PDF)</span>
            </a>
            <MobileMenu active={active} />
          </div>
        </div>
      </div>
    </header>
  );
}

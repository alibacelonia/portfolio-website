"use client";

import { usePathname } from "next/navigation";
import { navigation } from "@/lib/site";
import { useActiveSection } from "@/hooks/useActiveSection";
import { dockProps } from "@/lib/dock";
import { SectionNav } from "./SectionNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MobileMenu } from "./MobileMenu";

const sectionIds = navigation.map((item) => item.id);
const noSections: string[] = [];

/**
 * The single primary navigation: a sticky, floating glass dock (see src/lib/dock.ts). It overlaps the top of the page
 * (negative bottom margin) so the hero background runs behind it; content offsets use --nav-offset.
 */
export function Header() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const tracked = useActiveSection(onHome ? sectionIds : noSections);
  const active = onHome
    ? tracked
    : pathname === "/projects" || pathname.startsWith("/projects/")
      ? "projects"
      : "";

  return (
    <header className="pointer-events-none sticky top-0 z-50 -mb-[var(--nav-offset)] pt-[var(--nav-top)]">
      <div className="flex justify-end px-4 sm:justify-center">
        <div
          {...dockProps(
            "pointer-events-auto relative flex h-[var(--nav-h)] w-[var(--nav-h)] max-w-full items-center justify-between gap-2 rounded-full p-1 sm:w-auto",
          )}
        >
          <SectionNav active={active} className="hidden sm:block" />
          <span aria-hidden="true" className="hidden h-5 w-px bg-border-strong sm:block" />
          <ThemeToggle className="hidden size-[calc(var(--nav-h)-0.5rem)] sm:inline-flex" />
          <MobileMenu active={active} />
        </div>
      </div>
    </header>
  );
}

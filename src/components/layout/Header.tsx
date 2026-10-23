"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { site } from "@/lib/site";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 h-[var(--header-h)] border-b backdrop-blur-md transition-colors duration-200 ${
        scrolled
          ? "border-border bg-[var(--header-bg)]"
          : "border-transparent bg-[var(--header-bg)]"
      }`}
    >
      <div className="container-fluid flex h-full items-center justify-between gap-3">
        <a
          href="#home"
          className="inline-flex min-h-10 items-center text-sm font-semibold tracking-[0.18em] text-fg"
          aria-label={`${site.brand} — back to top`}
        >
          {site.brand}
        </a>

        <div className="flex items-center gap-1">
          <a
            href={site.resume.href}
            download={site.resume.fileName}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-fg-soft transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <Download aria-hidden="true" className="size-3.5" />
            Resume
            <span className="sr-only"> (PDF)</span>
          </a>
          <ThemeToggle />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

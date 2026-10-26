"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const icon =
  "absolute size-[18px] transition-[opacity,transform] duration-200 ease-out-soft motion-reduce:transition-none";

/** `className` sets the size and display (e.g. hidden on phones), which the button leaves to its caller. */
export function ThemeToggle({ className = "inline-flex size-10" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const label = theme ? `Switch to ${theme === "dark" ? "light" : "dark"} theme` : "Toggle theme";

  // Icons follow the applied theme through CSS, so they are correct before hydration too.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`relative shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-fg/5 hover:text-fg ${className}`}
    >
      <Moon
        aria-hidden="true"
        className={`${icon} rotate-0 opacity-100 dark:-rotate-45 dark:opacity-0`}
      />
      <Sun
        aria-hidden="true"
        className={`${icon} rotate-45 opacity-0 dark:rotate-0 dark:opacity-100`}
      />
    </button>
  );
}

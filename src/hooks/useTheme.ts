"use client";

import { useCallback, useSyncExternalStore } from "react";
import { applyTheme, getAppliedTheme, type Theme } from "@/lib/theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/** Returns the applied theme (null during pre-rendering) and a toggle that persists the choice. */
export function useTheme() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, getAppliedTheme, () => null);

  const toggle = useCallback(() => {
    applyTheme(getAppliedTheme() === "dark" ? "light" : "dark", { persist: true, animate: true });
  }, []);

  return { theme, toggle };
}

"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  applyTheme,
  getAppliedTheme,
  getSystemTheme,
  readStoredTheme,
  type Theme,
} from "@/lib/theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/** Returns the applied theme (null during pre-rendering) and a toggle that persists the choice. */
export function useTheme() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, getAppliedTheme, () => null);

  // Follow the operating system until the user makes an explicit choice.
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;
    const onSystemChange = () => {
      if (!readStoredTheme()) applyTheme(getSystemTheme(), { animate: true });
    };
    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  const toggle = useCallback(() => {
    applyTheme(getAppliedTheme() === "dark" ? "light" : "dark", { persist: true, animate: true });
  }, []);

  return { theme, toggle };
}

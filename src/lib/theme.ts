export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "alibacelonia-theme";
export const DEFAULT_THEME: Theme = "dark";

/**
 * Runs in <head> before first paint: enforces dark mode while light mode is disabled,
 * and marks the document as JS-enabled so progressive enhancements (entrances) can apply.
 */
export const themeBootstrapScript = `(function(){var d=document.documentElement;d.classList.add('js');d.dataset.theme='${DEFAULT_THEME}'})();`;

export function readStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function getAppliedTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : DEFAULT_THEME;
}

/** Applies a theme; `persist` stores it as the user's explicit choice. */
export function applyTheme(theme: Theme, { persist = false, animate = false } = {}): void {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  if (animate && !reduceMotion) {
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 250);
  }

  root.dataset.theme = theme;

  if (persist) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
  }
}

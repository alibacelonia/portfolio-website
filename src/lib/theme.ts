export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "alibacelonia-theme";
export const DEFAULT_THEME: Theme = "dark";
export const THEME_COLORS: Record<Theme, string> = { light: "#fafafa", dark: "#0d0d0f" };

/**
 * Runs in <head> before first paint: applies the saved theme, or the device's color scheme when
 * nothing is saved (dark when unknown), and marks the document as JS-enabled so progressive
 * enhancements (entrances) can apply.
 */
export const themeBootstrapScript = `(function(){var d=document.documentElement;d.classList.add('js');var t;try{t=localStorage.getItem('${THEME_STORAGE_KEY}')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}d.dataset.theme=t;d.querySelectorAll('meta[name=theme-color]').forEach(function(m){m.removeAttribute('media');m.content=t==='light'?'${THEME_COLORS.light}':'${THEME_COLORS.dark}'})})();`;

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
  // Browser chrome must follow the explicit site choice, even when the OS prefers the opposite.
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.removeAttribute("media");
    meta.content = THEME_COLORS[theme];
  });

  if (persist) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
  }
}

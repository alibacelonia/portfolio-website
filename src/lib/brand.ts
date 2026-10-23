/**
 * The A/B mark, drawn as strokes on a 32×32 grid so it renders identically everywhere
 * (no font dependency). Shared by the header logo, the Open Graph image and src/app/icon.svg.
 */
export const LOGO_PATH =
  "M5 23 8 9l3 14M6 18.5h4M16.5 9 14 23M19.5 9v14M19.5 9h3a3.25 3.25 0 0 1 0 6.5h-3m0 0h3.5a3.75 3.75 0 0 1 0 7.5h-3.5";

/** Tight crop around the glyphs for inline use (the favicon uses the full 32×32 grid). */
export const LOGO_VIEWBOX = "4 8 24 16";

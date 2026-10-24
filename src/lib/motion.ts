import type { CSSProperties } from "react";

/** Position of a child within a [data-reveal-group] cascade (see globals.css). */
export function stagger(index: number): CSSProperties {
  return { "--i": index } as CSSProperties;
}

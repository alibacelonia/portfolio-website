import { site, type DockStyle } from "@/lib/site";

/**
 * Props that give an element the navigation dock surface (clay, glass or neo) plus its own
 * classes. A .nav-indicator inside it takes the matching active-link style.
 */
export function dockProps(className: string, style: DockStyle = site.dockStyle) {
  return { "data-dock": style, className: `dock ${className}` } as const;
}

import { site, type DockStyle } from "@/lib/site";

/**
 * Props that give an element the shared glass navigation surface plus its own
 * classes. A .nav-indicator inside it takes the matching active-link style.
 */
export function dockProps(className: string, style: DockStyle = site.dockStyle) {
  return { "data-dock": style, className: `dock glass ${className}` } as const;
}

import type { NavItem } from "@/types/content";

const DEFAULT_SITE_URL = "https://alibacelonia.dev";

/** Normalizes an origin: https only (http allowed for localhost), no trailing slash, no path. */
export function normalizeSiteUrl(value: string | undefined): string {
  if (!value || !value.trim()) return DEFAULT_SITE_URL;
  try {
    const url = new URL(value.trim());
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "https:" && !(isLocal && url.protocol === "http:")) {
      return DEFAULT_SITE_URL;
    }
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

/** HTTPS endpoint (or http://localhost) for the contact API; anything else is unconfigured. */
export function normalizeApiUrl(value: string | undefined): string | null {
  try {
    const url = new URL(value?.trim() ?? "");
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    return url.protocol === "https:" || (isLocal && url.protocol === "http:") ? url.href : null;
  } catch {
    return null;
  }
}

/** Cal.com links look like `user/event`; anything else hides the booking tab. */
export function normalizeCalLink(value: string | undefined): string | null {
  const link = value
    ?.trim()
    .replace(/^https?:\/\/(app\.)?cal\.com\//, "")
    .replace(/^\/+|\/+$/g, "");
  return link && /^[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)?$/.test(link) ? link : null;
}

export const DOCK_STYLES = ["glass"] as const;
export type DockStyle = (typeof DOCK_STYLES)[number];

/** Glass is the shared material; legacy or invalid settings resolve to glass too. */
export function normalizeDockStyle(value: string | undefined): DockStyle {
  const style = value?.trim().toLowerCase();
  return DOCK_STYLES.find((option) => option === style) ?? "glass";
}

export const site = {
  /** Typographic logo text; the drawn mark lives in src/lib/brand.ts. */
  brand: "A/B",
  name: "Mohammed Ali B. Abdullah",
  roles: ["Full-Stack Developer", "DevOps Engineer", "AI Engineer"],
  description:
    "Mohammed Ali B. Abdullah — Full-Stack Developer, DevOps Engineer and AI Engineer in Baguio City, Philippines. AWS-certified, with 7+ years building applications, CI/CD pipelines and cloud infrastructure.",
  /** Single source of truth for the canonical origin (NEXT_PUBLIC_SITE_URL). */
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  location: "Baguio City, Philippines",
  /** Short form for the hero ("Based in the Philippines"). */
  basedIn: "the Philippines",
  experienceYears: "7+",
  email: "alibacelonia1234@gmail.com",
  github: "https://github.com/alibacelonia",
  linkedin: "https://www.linkedin.com/in/alibacelonia",
  resume: {
    href: "/documents/mohammed-ali-abdullah-cv.pdf",
    fileName: "Mohammed-Ali-Abdullah-CV.pdf",
  },
  /** Contact API (API Gateway → Lambda → SES); the only way the form sends. */
  contactApiUrl: normalizeApiUrl(process.env.NEXT_PUBLIC_CONTACT_API_URL),
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null,
  /** Cal.com `user/event` for the Book a call tab. */
  calLink: normalizeCalLink(process.env.NEXT_PUBLIC_CAL_LINK),
  /** Navigation dock surface: glass (legacy style values also resolve to glass) (see src/lib/dock.ts). */
  dockStyle: normalizeDockStyle(process.env.NEXT_PUBLIC_DOCK_STYLE),
} as const;

/** Host name shown as the site name, e.g. "alibacelonia.dev". */
export const siteHost = new URL(site.url).host;

/** Section links. Hrefs are root-relative so they also work from project pages. */
export const navigation: NavItem[] = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Tech Stack" },
  { id: "certifications", label: "Certifications" },
  { id: "connect", label: "Connect" },
];

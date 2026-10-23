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

/** Formspree IDs are short alphanumeric strings. Anything else is treated as unconfigured. */
export function normalizeFormId(value: string | undefined): string | null {
  const id = value?.trim();
  return id && /^[A-Za-z0-9]{4,32}$/.test(id) ? id : null;
}

export const site = {
  /** Typographic logo text; the drawn mark lives in src/lib/brand.ts. */
  brand: "A/B",
  name: "Mohammed Ali B. Abdullah",
  roles: ["Full-Stack Developer", "DevOps Engineer", "AI Engineer"],
  tagline:
    "I build scalable applications, automate cloud infrastructure, and develop AI-powered solutions that solve real-world problems.",
  description:
    "Mohammed Ali B. Abdullah — Full-Stack Developer, DevOps Engineer and AI Engineer in Baguio City, Philippines. AWS-certified, with 8+ years building applications, CI/CD pipelines and cloud infrastructure.",
  /** Single source of truth for the canonical origin (NEXT_PUBLIC_SITE_URL). */
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  location: "Baguio City, Philippines",
  experienceYears: "8+",
  email: "alibacelonia1234@gmail.com",
  github: "https://github.com/alibacelonia",
  linkedin: "https://www.linkedin.com/in/alibacelonia",
  resume: {
    href: "/documents/mohammed-ali-abdullah-resume.pdf",
    fileName: "Mohammed-Ali-Abdullah-Resume.pdf",
  },
  formspreeId: normalizeFormId(process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID),
} as const;

/** Host name shown as the site name, e.g. "alibacelonia.dev". */
export const siteHost = new URL(site.url).host;

/** Section links. Hrefs are root-relative so they also work from project pages. */
export const navigation: NavItem[] = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "certifications", label: "Certifications" },
  { id: "contact", label: "Contact" },
];

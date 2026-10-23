export type Discipline = "full-stack" | "devops" | "ai";

export type ProjectCategory = "Full-Stack" | "DevOps / Cloud" | "AI Engineering" | "Automation";

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  id: string;
  name: string;
  /** One or two sentences: what it is and why it exists. */
  purpose: string;
  categories: ProjectCategory[];
  /** Short, factual status, e.g. "v0.2.0 on PyPI". */
  status: string;
  /** Simplified data flow rendered in monospace, e.g. ["CLI", "preflight", "write"]. */
  architecture: string[];
  highlights: string[];
  stack: string[];
  repository: ProjectLink;
  /** Additional verified links (package registry, live demo). Leave empty when none exist. */
  links: ProjectLink[];
  /** Only a genuine screenshot under /public/projects. */
  screenshot?: { src: string; alt: string; width: number; height: number };
  /** Where the content was verified, for maintainers. Not rendered. */
  source: string;
}

/** ISO year-month, e.g. "2024-08". */
export type YearMonth = `${number}-${number}`;

export interface Role {
  id: string;
  title: string;
  organization: string;
  location: string;
  start: YearMonth;
  /** `null` means present. */
  end: YearMonth | null;
  /** Exact end date when the resume states one. */
  endDetail?: string;
  employment?: string;
  /** Explains overlapping roles in plain language. */
  note?: string;
  summary: string[];
  details: string[];
}

export type SkillLevel = "hands-on" | "working";

export interface Skill {
  name: string;
  level: SkillLevel;
}

export interface SkillGroup {
  label: string;
  skills: Skill[];
}

export interface SkillDiscipline {
  id: Discipline;
  title: string;
  description: string;
  groups: SkillGroup[];
}

export interface Certification {
  id: string;
  name: string;
  code: string;
  issuer: string;
  /** Verified public credential URL, or null until verified. */
  credentialUrl: string | null;
  discipline: Discipline;
  /** Authorized badge image under /public/certifications. */
  badge?: { src: string; alt: string };
}

export interface NavItem {
  id: string;
  label: string;
}

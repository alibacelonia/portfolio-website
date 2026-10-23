export type Discipline = "full-stack" | "devops" | "ai";

export interface ProjectLink {
  label: string;
  href: string;
}

export interface StackGroup {
  /** e.g. "Frontend", "Backend", "AI / LLM", "Cloud services". Only groups actually used. */
  group: string;
  items: string[];
}

export interface InfrastructureItem {
  label: string;
  detail: string;
  /** Omitted = implemented. "planned" is shown with a badge so it is never mistaken for live. */
  status?: "planned";
}

export interface Project {
  id: string;
  name: string;
  /** Display category, e.g. "DevOps Tooling · CLI". */
  category: string;
  /** Drives the accent dot color. */
  discipline: Discipline;
  /** Short, factual status, e.g. "v0.2.0 · PyPI". */
  status: string;
  /** One or two sentences for the card. */
  summary: string;
  /** At most six technologies for the card. */
  keyTech: string[];
  repository: ProjectLink;
  demo?: ProjectLink;
  docs?: ProjectLink;
  /** Other verified links, e.g. a package registry. */
  links: ProjectLink[];

  /** A. What it does. */
  overview: string[];
  /** B. Why it was built and what limitation it addresses. */
  problem: string;
  /** B. Who benefits. */
  audience: string;
  /** C. How it solves the problem: implemented features only. */
  solution: string[];
  /** D. Technologies by layer. */
  stack: StackGroup[];
  /** E. Hosting, CI/CD, IaC, security, monitoring: only what exists. */
  infrastructure: {
    summary: string;
    items: InfrastructureItem[];
    /** Simplified data or delivery flow, rendered as a small diagram. */
    diagram?: string[];
  };

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

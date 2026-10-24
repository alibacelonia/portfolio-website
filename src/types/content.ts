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

/** One service in an architecture lane, with a short note on what it does there. */
export interface ArchitectureNode {
  name: string;
  note?: string;
}

/** A path through the system (e.g. deploy, serve, contact), read left to right. */
export interface ArchitectureLane {
  label: string;
  /** One sentence for assistive technology, e.g. "how a push reaches production". */
  summary: string;
  /** Accent dot: sage for DevOps, blue for serving, lavender for application paths. */
  accent: "sage" | "blue" | "lavender";
  nodes: ArchitectureNode[];
}

/** A case card's background: a linear gradient as an angle plus color stops (dark to light). */
export interface StageGradient {
  /** CSS angle in degrees, e.g. 145. */
  angle: number;
  /** Color stops, `at` in percent along the gradient. */
  stops: { color: string; at: number }[];
}

export interface Project {
  id: string;
  name: string;
  /** Display category, e.g. "DevOps Tooling · CLI". */
  category: string;
  /** Short type shown beside the name in case studies, e.g. "CLI", "AI service". */
  kind: string;
  /** One-line hook shown on the case-study preview card. */
  tagline: string;
  /** Three or four short highlights for the case-study panel. */
  highlights: string[];
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
    /** Cloud architecture as lanes of services; shown instead of the flow on the project page. */
    graph?: ArchitectureLane[];
  };

  /** Only a genuine screenshot under /public/projects. */
  screenshot?: { src: string; alt: string; width: number; height: number };
  /** Case-card background; its second-lightest stop frames the screenshot. */
  stageGradient?: StageGradient;
  /** Where the content was verified, for maintainers. Not rendered. */
  source: string;
}

/** Commercial work for a client: no public repository, so it links to the product instead. */
export interface ClientWork {
  id: string;
  name: string;
  /** Short product category, e.g. "Compliance automation SaaS". */
  category: string;
  /** Short type shown beside the name in case studies, e.g. "CLI", "AI service". */
  kind: string;
  /** One-line hook shown on the case-study preview card. */
  tagline: string;
  /** Three or four short highlights for the case-study panel. */
  highlights: string[];
  discipline: Discipline;
  /** Public description of the product, from its own website. */
  summary: string;
  /** Role and engagement, e.g. "Product Engineer · Freelance via Buzzerboy". */
  role: string;
  period: string;
  /** What I built: never broader than my own work. Optional; omitted when not shown. */
  contributions?: string[];
  tech: string[];
  link: ProjectLink;
  /** A genuine product screenshot under /public/projects, shown on the left of the card. */
  screenshot?: { src: string; alt: string; width: number; height: number };
  /** Case-card background; its second-lightest stop frames the screenshot. */
  stageGradient?: StageGradient;
  /**
   * Publish only after the client has confirmed the product may be named and described.
   * Unpublished entries are never rendered.
   */
  published: boolean;
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
  /** Certification level as printed on the official badge. */
  level: "Foundational" | "Associate" | "Professional" | "Specialty";
  issuer: string;
  /** Verified public credential URL, or null until verified. */
  credentialUrl: string | null;
  discipline: Discipline;
  /**
   * Official badge image under /public/certifications. Only the earner's own Credly badge
   * artwork, shown unaltered; never a standalone AWS logo.
   */
  badge?: { src: string; alt: string };
}

export interface NavItem {
  id: string;
  label: string;
}

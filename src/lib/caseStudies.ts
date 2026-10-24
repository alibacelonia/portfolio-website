import { projects } from "@/data/projects";
import { publishedClientWork } from "@/data/clientWork";
import type { Discipline, ProjectLink, StageGradient } from "@/types/content";

/** One entry in the home page's case-study list, built from a project or from client work. */
export interface CaseStudy {
  id: string;
  name: string;
  kind: string;
  tagline: string;
  summary: string;
  tech: string[];
  highlights: string[];
  discipline: Discipline;
  /** Role and period, for client work. */
  role?: string;
  screenshot?: { src: string; alt: string; width: number; height: number };
  /** Card gradient override; the discipline tint is used when absent. */
  stageGradient?: StageGradient;
  /** Architecture flow, shown on the stage until a screenshot exists. */
  flow?: string[];
  primary: { label: string; href: string; external: boolean };
  secondary: ProjectLink[];
}

/** Published client work first, then open-source projects, in data order. */
export function buildCaseStudies(): CaseStudy[] {
  const client: CaseStudy[] = publishedClientWork.map((work) => ({
    id: work.id,
    name: work.name,
    kind: work.kind,
    tagline: work.tagline,
    summary: work.summary,
    tech: work.tech,
    highlights: work.highlights,
    discipline: work.discipline,
    role: `${work.role} · ${work.period}`,
    screenshot: work.screenshot,
    stageGradient: work.stageGradient,
    primary: { label: "Visit site", href: work.link.href, external: true },
    secondary: [],
  }));
  const open: CaseStudy[] = projects.map((project) => ({
    id: project.id,
    name: project.name,
    kind: project.kind,
    tagline: project.tagline,
    summary: project.summary,
    tech: project.keyTech,
    highlights: project.highlights,
    discipline: project.discipline,
    screenshot: project.screenshot,
    flow: project.infrastructure.diagram,
    primary: { label: "Read case study", href: `/projects/${project.id}/`, external: false },
    secondary: [project.repository, ...(project.demo ? [project.demo] : []), ...project.links],
  }));
  return [...client, ...open];
}

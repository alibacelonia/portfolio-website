import { projects } from "@/data/projects";
import { publishedClientWork } from "@/data/clientWork";

export interface SkillEvidence {
  name: string;
  href: string;
  external: boolean;
}

const aliases: Record<string, string[]> = {
  "Anthropic API": ["Anthropic Messages API"],
  "Docker Compose": ["Docker Compose"],
};

/** Preserve C#/C++ and match whole terms, so Pydantic AI never inherits Pydantic's evidence. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}#+]+/gu, " ")
    .trim();
}

/** Only documented stack/technology entries count; planned infrastructure is never inferred. */
export function findSkillProjects(name: string): SkillEvidence[] {
  const terms = [name.replace(/\s*\([^)]*\)/g, ""), ...(aliases[name] ?? [])]
    .map(normalize)
    .filter(Boolean);
  const matches = (items: string[]) =>
    items.some((item) => terms.some((term) => ` ${normalize(item)} `.includes(` ${term} `)));
  return [
    ...publishedClientWork
      .filter((work) => matches(work.tech))
      .map((work) => ({
        name: work.name,
        href: work.link.href,
        external: true,
      })),
    ...projects
      .filter((project) =>
        matches([...project.keyTech, ...project.stack.flatMap(({ items }) => items)]),
      )
      .map((project) => ({
        name: project.name,
        href: `/projects/${project.id}/`,
        external: false,
      })),
  ];
}

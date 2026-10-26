import { site } from "@/lib/site";
import { projects } from "@/data/projects";
import { ExternalLink } from "@/components/ui/Links";

const portfolioRepo = projects.find((project) => project.id === "website-portfolio")?.repository;

export function Footer() {
  return (
    <footer className="section-frame section-frame--footer bg-bg py-8">
      <div aria-hidden="true" className="section-guides" />
      <div className="container-fluid flex flex-col gap-3 type-small text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>Static Next.js site on AWS</span>
          {portfolioRepo ? (
            <ExternalLink href={portfolioRepo.href} className="min-h-10 text-fg-soft hover:text-fg">
              Source
            </ExternalLink>
          ) : null}
        </p>
      </div>
    </footer>
  );
}

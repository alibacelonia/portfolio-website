import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectCollection } from "@/components/sections/Projects";
import { Section } from "@/components/ui/Section";
import { ActionStrip } from "@/components/ui/ActionStrip";
import { projects } from "@/data/projects";
import { site, siteHost } from "@/lib/site";

const description =
  "Client work and open-source projects across application development, cloud delivery and applied AI.";

export const metadata: Metadata = {
  title: "All projects",
  description,
  alternates: { canonical: "/projects/" },
  openGraph: {
    type: "website",
    url: "/projects/",
    siteName: siteHost,
    title: "All projects",
    description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image", title: "All projects", description },
};

export default function ProjectsPage() {
  return (
    <Section
      id="all-projects"
      first
      headingLevel={1}
      index="02"
      title="All projects"
      lead={description}
      aside={<p className="type-mono text-muted">{projects.length} projects</p>}
      before={
        <Link
          href="/#projects"
          className="mb-4 inline-flex min-h-10 items-center gap-1.5 type-action text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Back to portfolio
        </Link>
      }
      footer={
        <ActionStrip href={site.github} external label="Browse every repository on GitHub">
          Browse every repository on GitHub
        </ActionStrip>
      }
    >
      <ProjectCollection level={2} />
    </Section>
  );
}

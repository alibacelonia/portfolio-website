import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/data/projects";
import { ProjectDetail } from "@/components/sections/ProjectDetail";
import { site, siteHost } from "@/lib/site";

interface Params {
  params: Promise<{ slug: string }>;
}

// Every project page is generated at build time; unknown slugs are a static 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  const path = `/projects/${project.id}/`;
  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: path },
    // Page-level openGraph replaces the root object, so repeat the shared fields.
    openGraph: {
      type: "article",
      url: path,
      siteName: siteHost,
      title: project.name,
      description: project.summary,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.name }],
    },
    twitter: { card: "summary_large_image", title: project.name, description: project.summary },
  };
}

export default async function ProjectPage({ params }: Params) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}

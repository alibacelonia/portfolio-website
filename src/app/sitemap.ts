import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { projects } from "@/data/projects";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${site.url}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/projects/`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/connect/`, lastModified, changeFrequency: "yearly", priority: 0.6 },
    ...projects.map((project) => ({
      url: `${site.url}/projects/${project.id}/`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

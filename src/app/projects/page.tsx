import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectGrid } from "@/components/sections/Projects";
import { site, siteHost } from "@/lib/site";

const description =
  "Open-source work across application development, cloud delivery and applied AI. Explore the problem, solution, stack and architecture behind each project.";

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
    <div className="container-fluid pt-[calc(var(--nav-offset)+40px)] pb-20 sm:pb-24">
      <Link
        href="/#projects"
        className="inline-flex min-h-10 items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5" />
        Back to portfolio
      </Link>
      <header className="mt-6 mb-10 sm:mb-12">
        <h1 className="text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] leading-tight font-semibold tracking-tight text-fg">
          All projects
        </h1>
        <p className="mt-4 max-w-[68ch] text-base leading-relaxed text-muted">{description}</p>
      </header>
      <ProjectGrid headingLevel={2} />
    </div>
  );
}

import { ArrowRight, Download } from "lucide-react";
import Image from "next/image";
import { site } from "@/lib/site";
import { ExternalLink } from "@/components/ui/Links";
import { SectionFrame } from "@/components/ui/SectionFrame";

const roleDots = ["bg-blue", "bg-sage", "bg-lavender"] as const;

const focusAreas = [
  { label: "Building", value: "Full-stack applications" },
  { label: "Shipping", value: "Automated cloud delivery" },
  { label: "Exploring", value: "Applied AI" },
];

export function Hero() {
  return (
    <SectionFrame
      id="home"
      aria-labelledby="home-title"
      className="section-frame--hero relative isolate flex min-h-viewport items-center bg-bg pt-[calc(var(--nav-offset)+40px)] pb-16 sm:pb-20"
    >
      <div aria-hidden="true" className="hero-pattern absolute inset-0 -z-10" />
      <div className="container-fluid">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-x-12 gap-y-8 lg:grid-cols-12 xl:gap-x-20">
          <div className="lg:col-span-7 lg:col-start-6 lg:row-start-1">
            <h1
              id="home-title"
              className="font-mono text-[clamp(1.75rem,1.15rem+2.3vw,3rem)] leading-[1.15] font-medium tracking-tight text-fg"
            >
              {site.name}
            </h1>

            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-medium text-fg-soft sm:text-base">
              {site.roles.map((role, index) => (
                <span key={role} className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className={`size-1.5 rounded-full ${roleDots[index]}`} />
                  {role}
                  {index < site.roles.length - 1 ? <span className="sr-only">,</span> : null}
                </span>
              ))}
            </p>

            <p className="mt-6 max-w-[52ch] text-base leading-[1.8] text-muted sm:text-lg">
              {site.tagline}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-medium">
              <a
                href="#projects"
                className="group inline-flex min-h-11 items-center gap-2 text-fg hover:underline"
              >
                View My Work
                <ArrowRight aria-hidden="true" className="size-4" />
              </a>
              <a
                href={site.resume.href}
                download={site.resume.fileName}
                className="inline-flex min-h-11 items-center gap-2 text-fg-soft hover:text-fg hover:underline"
              >
                <Download aria-hidden="true" className="size-4" />
                Download Resume <span className="sr-only">(PDF)</span>
              </a>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs text-muted sm:mt-5">
              <ExternalLink href={site.github} className="min-h-10 hover:text-fg">
                github
              </ExternalLink>
              <ExternalLink href={site.linkedin} className="min-h-10 hover:text-fg">
                linkedin
              </ExternalLink>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex min-h-10 items-center gap-1 hover:text-fg"
              >
                email <ArrowRight aria-hidden="true" className="size-3.5 -rotate-45" />
              </a>
            </div>
          </div>

          <div className="row-start-1 lg:col-span-5 lg:col-start-1">
            <div className="hero-portrait relative aspect-square w-60 sm:w-80 lg:w-full">
              <Image
                src="/images/mohammed-ali-abdullah.webp"
                alt={`Portrait of ${site.name}`}
                width={800}
                height={800}
                preload
                className="size-full object-cover contrast-[1.08] grayscale"
              />
            </div>
          </div>

          <div className="mt-2 min-w-0 lg:col-span-12 lg:mt-4">
            <dl className="grid grid-cols-3 divide-x divide-border border-y border-border">
              {focusAreas.map((area, index) => (
                <div
                  key={area.label}
                  className="min-w-0 px-2.5 py-5 first:pl-0 last:pr-0 sm:px-6 sm:py-6"
                >
                  <dt className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-muted uppercase">
                    <span
                      aria-hidden="true"
                      className={`size-1.5 shrink-0 rounded-full ${roleDots[index]}`}
                    />
                    {area.label}
                  </dt>
                  <dd className="mt-2 text-xs leading-relaxed font-medium wrap-break-word text-fg sm:text-base">
                    {area.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}

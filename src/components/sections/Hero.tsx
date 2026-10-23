import { ArrowRight, Download } from "lucide-react";
import Image from "next/image";
import { site } from "@/lib/site";
import { ExternalLink } from "@/components/ui/Links";
import { EmailLink } from "@/components/ui/EmailLink";
import { SectionFrame } from "@/components/ui/SectionFrame";
import { HeroOverview } from "./HeroOverview";

const roleDots = ["bg-blue", "bg-sage", "bg-lavender"] as const;

export function Hero() {
  return (
    <SectionFrame
      id="home"
      aria-labelledby="home-title"
      className="section-frame--hero relative isolate flex min-h-viewport flex-col bg-bg pt-[calc(var(--nav-offset)+24px)]"
    >
      <div className="container-fluid flex flex-1 items-center pt-6 pb-14 sm:py-20 lg:py-16">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-x-12 gap-y-10 lg:grid-cols-[auto_minmax(0,1fr)] xl:gap-x-16">
          <div className="min-w-0 text-center lg:col-start-2 lg:row-start-1 lg:text-left">
            <h1
              id="home-title"
              className="font-mono text-[clamp(1.875rem,1rem+2.2vw,3rem)] leading-[1.1] font-medium tracking-tight text-balance text-fg"
            >
              {site.name}
            </h1>

            <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[15px] font-medium text-fg-soft sm:text-base lg:justify-start">
              {site.roles.map((role, index) => (
                <span key={role} className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className={`size-1.5 rounded-full ${roleDots[index]}`} />
                  {role}
                  {index < site.roles.length - 1 ? <span className="sr-only">,</span> : null}
                </span>
              ))}
            </p>

            <p className="mx-auto mt-6 max-w-[54ch] text-base leading-[1.75] text-muted sm:text-lg lg:mx-0">
              {site.tagline}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm font-medium lg:justify-start">
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

            <div className="mx-auto mt-5 flex w-fit flex-wrap items-center justify-center gap-x-6 gap-y-1 border-t border-border px-2 pt-4 font-mono text-xs text-muted lg:mx-0 lg:justify-start lg:pl-0">
              <ExternalLink href={site.github} className="min-h-10 hover:text-fg">
                github
              </ExternalLink>
              <ExternalLink href={site.linkedin} className="min-h-10 hover:text-fg">
                linkedin
              </ExternalLink>
              <EmailLink email={site.email} />
            </div>
          </div>

          <div className="row-start-1 flex justify-center lg:col-start-1 lg:justify-start">
            <div className="hero-portrait relative aspect-square w-56 max-w-full overflow-hidden sm:w-72 lg:w-[19rem] xl:w-[22rem] 2xl:w-96">
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
        </div>
      </div>
      <HeroOverview />
    </SectionFrame>
  );
}

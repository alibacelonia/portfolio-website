import { ArrowRight, Download, MapPin } from "lucide-react";
import Image from "next/image";
import { site } from "@/lib/site";
import { buttonStyles, ExternalLink } from "@/components/ui/Links";
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
      <div className="container-fluid flex flex-1 items-center pt-4 pb-14 sm:pt-14 sm:pb-20 lg:pt-10 lg:pb-16">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-x-12 gap-y-10 lg:grid-cols-[auto_minmax(0,1fr)] xl:gap-x-16">
          <div className="hero-sequence min-w-0 text-center lg:col-start-2 lg:row-start-1 lg:text-left">
            <p className="mb-5 flex items-center justify-center gap-1.5 type-small text-muted lg:justify-start">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              Based in {site.basedIn}
            </p>
            <h1
              id="home-title"
              className="font-serif text-[clamp(2.5rem,1.6rem+3vw,4rem)] leading-[1.05] font-normal text-balance text-fg"
            >
              {site.name}
            </h1>

            <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[0.9375rem] font-medium text-fg-soft sm:text-base lg:justify-start">
              {site.roles.map((role, index) => (
                <span key={role} className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className={`size-1.5 rounded-full ${roleDots[index]}`} />
                  {role}
                  {index < site.roles.length - 1 ? <span className="sr-only">,</span> : null}
                </span>
              ))}
            </p>

            <p className="mx-auto mt-6 max-w-[47ch] type-lead text-pretty lg:mx-0">{site.intro}</p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm font-medium lg:justify-start">
              <a href="#projects" className={`group ${buttonStyles.solid}`}>
                View My Work
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                />
              </a>
              <a
                href={site.resume.href}
                download={site.resume.fileName}
                className="inline-flex min-h-11 items-center gap-2 text-fg-soft hover:text-fg hover:underline"
              >
                <Download aria-hidden="true" className="size-4" />
                Download CV <span className="sr-only">(PDF)</span>
              </a>
            </div>

            <div className="mx-auto mt-5 flex w-fit flex-wrap items-center justify-center gap-x-6 gap-y-1 border-t border-border px-2 pt-4 text-sm text-muted lg:mx-0 lg:justify-start lg:pl-0">
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
            <div className="offset-frame w-56 max-w-full sm:w-72 lg:w-[19rem] xl:w-[22rem] 2xl:w-96">
              <div className="hero-portrait relative aspect-square overflow-hidden">
                <Image
                  src="/images/mohammed-ali-abdullah.webp"
                  alt={`Portrait of ${site.name}`}
                  width={800}
                  height={800}
                  preload
                  className="portrait-photo size-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <HeroOverview />
    </SectionFrame>
  );
}

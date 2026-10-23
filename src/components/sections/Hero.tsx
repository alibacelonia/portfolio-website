import { ArrowRight, Download } from "lucide-react";
import { site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Links";
import { SectionFrame } from "@/components/ui/SectionFrame";
import { Pipeline } from "./Pipeline";

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
      <div className="container-fluid grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <h1
            id="home-title"
            className="text-[clamp(1.75rem,1.2rem+2.4vw,3rem)] leading-[1.1] font-semibold tracking-tight text-fg"
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

          <p className="mt-5 max-w-[56ch] text-[15px] leading-relaxed text-muted sm:text-base">
            {site.tagline}
          </p>

          <div className="mt-8 flex flex-col gap-3 min-[400px]:flex-row">
            <ButtonLink href="#projects">
              View My Work
              <ArrowRight aria-hidden="true" className="size-4" />
            </ButtonLink>
            <ButtonLink href={site.resume.href} download={site.resume.fileName} variant="secondary">
              <Download aria-hidden="true" className="size-4" />
              Download Resume <span className="sr-only">(PDF)</span>
            </ButtonLink>
          </div>

          <dl className="section-panel mt-10 grid max-w-xl grid-cols-3 divide-x divide-border">
            {focusAreas.map((area, index) => (
              <div key={area.label} className="min-w-0 p-2.5 sm:p-4">
                <dt className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-muted uppercase">
                  <span
                    aria-hidden="true"
                    className={`size-1.5 shrink-0 rounded-full ${roleDots[index]}`}
                  />
                  {area.label}
                </dt>
                <dd className="mt-2 text-xs leading-relaxed font-medium wrap-break-word text-fg sm:text-[13px]">
                  {area.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5">
          <Pipeline />
        </div>
      </div>
    </SectionFrame>
  );
}

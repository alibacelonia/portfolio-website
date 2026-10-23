import { ArrowRight, Download } from "lucide-react";
import { site } from "@/lib/site";
import { certifications } from "@/data/certifications";
import { ButtonLink } from "@/components/ui/Links";
import { Pipeline } from "./Pipeline";

const roleDots = ["bg-blue", "bg-sage", "bg-lavender"] as const;

const facts = [
  { label: "Based in", value: "Baguio City, PH" },
  { label: "Experience", value: `${site.experienceYears} years` },
  { label: "Certified", value: `${certifications.length} × AWS` },
];

export function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="home-title"
      className="bg-bg pt-[calc(var(--header-h)+clamp(40px,9vh,112px))] pb-16 sm:pb-20 lg:pb-28"
    >
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
              Download Resume
              <span className="sr-only"> (PDF)</span>
            </ButtonLink>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-5">
            {facts.map((fact) => (
              <div key={fact.label} className="min-w-0">
                <dt className="font-mono text-[11px] text-muted">{fact.label}</dt>
                <dd className="mt-1 text-[13px] font-medium text-fg">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5">
          <Pipeline />
        </div>
      </div>
    </section>
  );
}

import { ArrowRight } from "lucide-react";
import { site } from "@/lib/site";

const highlights = [
  { label: "Building", value: "Full-stack applications", accent: "bg-blue" },
  { label: "Experience", value: `${site.experienceYears} years`, accent: "bg-sage" },
  { label: "Certified", value: "AWS 3×", accent: "bg-lavender", href: "#certifications" },
];

const valueClassName =
  "mt-3 flex min-h-11 items-center text-sm leading-relaxed font-medium text-fg sm:text-base";
const tileLinkClassName =
  "group flex min-h-11 w-full items-center justify-between gap-2 before:absolute before:inset-0 before:transition-colors hover:before:bg-fg/5 focus-visible:before:outline-2 focus-visible:before:outline-offset-[-4px] focus-visible:before:outline-blue-fg";

/** Shared arrow for linked tiles, so "AWS 3×" and "Start a conversation" stay identical. */
function TileArrow() {
  return (
    <span
      aria-hidden="true"
      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-fg text-bg transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
    >
      <ArrowRight className="size-4" />
    </span>
  );
}

/** Four equal cells span the section rails; the final cell is a full-tile contact link. */
export function HeroOverview() {
  return (
    <div className="section-action hero-overview">
      <div aria-hidden="true" className="section-action-guides" />
      <dl aria-label="At a glance" className="hero-overview-grid">
        {highlights.map((item) => (
          <div key={item.label} className="hero-overview-cell">
            <dt className="flex items-center gap-2 type-label tracking-wide text-muted uppercase">
              <span
                aria-hidden="true"
                className={`size-1.5 shrink-0 rounded-full ${item.accent}`}
              />
              {item.label}
            </dt>
            <dd className={valueClassName}>
              {item.href ? (
                <a href={item.href} className={tileLinkClassName}>
                  <span>{item.value}</span>
                  <TileArrow />
                </a>
              ) : (
                item.value
              )}
            </dd>
          </div>
        ))}
        <div className="hero-overview-cell">
          <dt className="type-label tracking-wide text-muted uppercase">Reach out</dt>
          <dd className={valueClassName}>
            <a href="#contact" className={tileLinkClassName}>
              <span>Start a conversation</span>
              <TileArrow />
            </a>
          </dd>
        </div>
      </dl>
    </div>
  );
}

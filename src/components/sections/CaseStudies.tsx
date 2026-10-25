"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { CaseStudy } from "@/lib/caseStudies";
import { Tag } from "@/components/ui/Tag";
import { ExternalLink } from "@/components/ui/Links";
import { ProjectCursor } from "@/components/ui/ProjectCursor";
import { stageBackground, stageFrame, stageGlassBackground, stageGradientFor } from "@/lib/stage";

const stageTint: Record<CaseStudy["discipline"], string> = {
  "full-stack": "var(--blue)",
  devops: "var(--sage)",
  ai: "var(--lavender)",
};

/**
 * Share of an image that must be in the upper half of the viewport (beside the pinned panel)
 * before its details take over. Counting only the upper half keeps the next project from taking
 * over while it is still a sliver at the bottom of the screen.
 */
const ACTIVATE_AT = 0.25;
const ACTIVE_ZONE = "0px 0px -50% 0px";

/** Tick length and opacity by distance from the active project (the last entry covers the rest). */
const TICKS = [
  { scale: 1, alpha: 1 },
  { scale: 0.58, alpha: 0.8 },
  { scale: 0.34, alpha: 0.5 },
  { scale: 0.2, alpha: 0.3 },
] as const;

/** Progress ruler beside the pinned title: one tick per project, the active one tinted. */
function Ruler({ studies, active }: { studies: CaseStudy[]; active: number }) {
  return (
    <ol
      aria-hidden="true"
      className="case-ruler"
      style={
        {
          "--active": active,
          // The active tick glows in the active card's accent, like its highlight sparkles.
          "--tick": stageFrame(stageGradientFor(studies[active]!)),
        } as CSSProperties
      }
    >
      {studies.map((study, index) => {
        const tick = TICKS[Math.min(Math.abs(index - active), TICKS.length - 1)]!;
        return (
          <li
            key={study.id}
            data-active={index === active || undefined}
            style={{ "--tick-scale": tick.scale, "--tick-alpha": tick.alpha } as CSSProperties}
          >
            <span />
          </li>
        );
      })}
    </ol>
  );
}

/** Stand-in for a screenshot: the project's real architecture flow inside a window frame. */
function FlowWindow({ steps, name }: { steps: string[]; name: string }) {
  return (
    <div className="case-media-inner flex aspect-[16/10] flex-col overflow-hidden border-b-0 glass">
      <div className="flex h-9 items-center gap-1.5 border-b border-border px-3.5">
        <span className="size-2 rounded-full bg-border-strong" />
        <span className="size-2 rounded-full bg-border-strong" />
        <span className="size-2 rounded-full bg-border-strong" />
        <span className="ml-2 truncate type-mono text-muted">{name} · architecture</span>
      </div>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2.5 p-4 type-mono text-fg-soft sm:p-6">
        {steps.map((step, index) => (
          <li key={step} className="flex items-center gap-2">
            {index > 0 ? <span className="text-muted">→</span> : null}
            <span className="rounded-md glass-chip px-2 py-1 whitespace-nowrap">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Preview card: a one-line tagline with an arrow, then the screenshot rising from the bottom edge.
 * A mouse-only shortcut: the details' links are the accessible path.
 */
function Stage({
  study,
  stageRef,
}: {
  study: CaseStudy;
  stageRef: (el: HTMLElement | null) => void;
}) {
  const Arrow = study.primary.external ? ArrowUpRight : ArrowRight;
  const media = (
    <>
      <div className="flex items-start justify-between gap-6 px-5 pt-5 pb-4 sm:px-7 sm:pt-7 sm:pb-6">
        {/* Text follows the theme over the translucent project tint. */}
        <p className="max-w-[36ch] text-[clamp(1rem,0.92rem+0.4vw,1.25rem)] leading-snug font-medium text-fg">
          {study.tagline}
        </p>
        <Arrow
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-fg-soft transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      </div>
      <div className="case-media">
        {study.screenshot ? (
          <Image
            src={study.screenshot.src}
            alt=""
            width={study.screenshot.width}
            height={study.screenshot.height}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="case-shot"
          />
        ) : study.flow ? (
          <FlowWindow steps={study.flow} name={study.name} />
        ) : null}
      </div>
    </>
  );
  const gradient = stageGradientFor(study);
  const shared = {
    ref: stageRef,
    className: "case-stage group",
    style: {
      "--stage": stageTint[study.discipline],
      "--stage-bg": stageBackground(gradient),
      "--stage-glass": stageGlassBackground(gradient),
      "--stage-frame": stageFrame(gradient),
    } as CSSProperties,
    tabIndex: -1,
    "aria-hidden": true,
    "data-reveal": true,
  };
  return study.primary.external ? (
    <a href={study.primary.href} target="_blank" rel="noopener noreferrer" {...shared}>
      {media}
    </a>
  ) : (
    <Link href={study.primary.href} {...shared}>
      {media}
    </Link>
  );
}

/** The reference's four-point sparkle, used as the highlight marker. */
function Sparkle({ color }: { color: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="mt-px size-5 shrink-0"
      style={{ fill: color, filter: `drop-shadow(0 0 10px ${color})` }}
    >
      <path d="M12 1C12 1 12 8 10 10C8 12 1 12 1 12C1 12 8 12 10 14C12 16 12 23 12 23C12 23 12 16 14 14C16 12 23 12 23 12C23 12 16 12 14 10C12 8 12 1 12 1Z" />
    </svg>
  );
}

/** Up to this many key technologies show as pills in the panel, as on the reference. */
const KEY_TECH = 4;

/**
 * A project's details in the reference's format: the name (linking to the case study or site) with
 * its category, key-technology pills, client role, highlights marked with a sparkle in the card's
 * accent color, and the links, the first one with an arrow chip.
 */
function Details({ study, headingLevel }: { study: CaseStudy; headingLevel: 3 | 4 }) {
  const Heading = `h${headingLevel}` as "h3" | "h4";
  // The card's frame color doubles as the panel accent, so each panel matches its card.
  const accent = stageFrame(stageGradientFor(study));
  const Arrow = study.primary.external ? ArrowUpRight : ArrowRight;
  const primaryLabel = study.primary.external
    ? `${study.primary.label}: ${study.name} (opens in a new tab)`
    : `${study.primary.label}: ${study.name}`;
  const name = (
    <Heading data-case-title className="type-display-serif">
      {study.name}
    </Heading>
  );
  return (
    <>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {study.primary.external ? (
          <a
            href={study.primary.href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            className="hover:underline"
          >
            {name}
          </a>
        ) : (
          <Link href={study.primary.href} tabIndex={-1} className="hover:underline">
            {name}
          </Link>
        )}
        <span className="text-[0.6875rem] leading-none tracking-[0.1em] text-muted uppercase">
          {study.kind}
        </span>
      </div>
      <ul aria-label="Key technologies" className="mt-4 flex flex-wrap gap-1.5">
        {study.tech.slice(0, KEY_TECH).map((tech) => (
          <Tag key={tech} shape="pill">
            {tech}
          </Tag>
        ))}
      </ul>
      {study.role ? <p className="mt-4 type-mono text-muted">{study.role}</p> : null}
      <ul aria-label="Highlights" className="mt-6 space-y-3 text-sm leading-5 text-muted">
        {study.highlights.map((item) => (
          <li key={item} className="flex gap-3">
            <Sparkle color={accent} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
        {study.primary.external ? (
          <a
            href={study.primary.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-h-10 items-center gap-2 text-fg"
            aria-label={primaryLabel}
          >
            {study.primary.label}
            <span className="flex size-7 items-center justify-center rounded-full bg-fg/5 transition-colors group-hover:bg-fg/10">
              <Arrow aria-hidden="true" className="size-3.5" />
            </span>
          </a>
        ) : (
          <Link
            href={study.primary.href}
            className="group inline-flex min-h-10 items-center gap-2 text-fg"
            aria-label={primaryLabel}
          >
            {study.primary.label}
            <span className="flex size-7 items-center justify-center rounded-full bg-fg/5 transition-colors group-hover:bg-fg/10">
              <Arrow aria-hidden="true" className="size-3.5" />
            </span>
          </Link>
        )}
        {study.secondary.map((link) => (
          <ExternalLink
            key={link.href}
            href={link.href}
            className="min-h-10 text-fg/70 hover:text-fg"
            aria-label={`${study.name} on ${link.label} (opens in a new tab)`}
          >
            {link.label}
          </ExternalLink>
        ))}
      </div>
    </>
  );
}

/**
 * Curated case studies. Desktop: preview cards (tagline above the image) on the left, 100px
 * apart, and one details panel on the right that starts level with the first project, then stays
 * centered on screen while scrolling, showing the project whose image is at least 25% in the
 * upper half of the viewport. Phones: each card is followed by its own details.
 *
 * Every panel stays in the document so assistive technology can read all projects; inactive
 * panels are only visually hidden, and focusing a link inside one makes it the active panel.
 * Without JavaScript the panels simply stack.
 */
export function CaseStudies({
  studies,
  headingLevel = 3,
}: {
  studies: CaseStudy[];
  headingLevel?: 3 | 4;
}) {
  const [active, setActive] = useState(0);
  const stages = useRef<(HTMLElement | null)[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const stack = useRef<HTMLDivElement>(null);

  // The pinned panel centers itself on screen: expose its height (the active project's details)
  // to the sticky offset, and keep the ruler level with the active title. Measured from layout
  // offsets so the panels' fade-in slide does not skew it.
  //
  // The panel sticks inside a track that runs from the first project to the last, sized so the
  // first project's details start level with the top of its image and the last project's details
  // stop level with the top of its image, then scroll away with it. CSS shifts the whole track
  // down by --case-drop, so both stops sit that far below the image tops.
  useEffect(() => {
    const target = stack.current;
    const host = panel.current;
    const rail = track.current;
    const items = list.current;
    if (!target || !host || !rail || !items) return;
    const alignRuler = () => {
      const article = target.children[active] as HTMLElement | undefined;
      const title = article?.querySelector<HTMLElement>("[data-case-title]");
      if (!article || !title) return;
      const offset = title.getBoundingClientRect().top - article.getBoundingClientRect().top;
      host.style.setProperty(
        "--ruler-y",
        `${Math.round(article.offsetTop + offset + title.offsetHeight / 2)}px`,
      );
    };
    const fitTrack = () => {
      const last = target.lastElementChild as HTMLElement | null;
      const cards = [...items.children] as HTMLElement[];
      if (!last || cards.length === 0) return;
      const listTop = items.getBoundingClientRect().top;
      const firstTop = cards[0]!.getBoundingClientRect().top - listTop;
      const lastTop = cards.at(-1)!.getBoundingClientRect().top - listTop;
      host.style.setProperty("--case-panel-h", `${Math.round(target.offsetHeight)}px`);
      rail.style.setProperty("--case-track-top", `${Math.round(firstTop)}px`);
      // Ends where the last project's details end once they are the active panel.
      rail.style.setProperty(
        "--case-track-h",
        `${Math.round(lastTop - firstTop + last.offsetHeight)}px`,
      );
    };
    alignRuler();
    fitTrack();
    if (!("ResizeObserver" in window)) return;
    const observer = new ResizeObserver(() => {
      fitTrack();
      alignRuler();
    });
    observer.observe(target);
    observer.observe(items);
    return () => observer.disconnect();
  }, [active]);

  useEffect(() => {
    const ratios = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(Number((entry.target as HTMLElement).dataset.index), entry.intersectionRatio);
        }
        // The lowest image with at least 25% in the zone wins: a project takes over once a quarter
        // of its image scrolls up beside the panel, and hands back when it drops below that.
        let next = -1;
        for (const [index, ratio] of ratios) {
          if (ratio >= ACTIVATE_AT && index > next) next = index;
        }
        if (next >= 0) setActive(next);
      },
      { rootMargin: ACTIVE_ZONE, threshold: [0, 0.1, ACTIVATE_AT, 0.5, 0.75, 1] },
    );
    stages.current.forEach((el, index) => {
      if (!el) return;
      el.dataset.index = String(index);
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [studies.length]);

  return (
    <div className="case-layout">
      <ProjectCursor selector=".case-stage" />
      <div ref={list} className="case-list">
        {studies.map((study, index) => (
          <div key={study.id} id={`case-study-${study.id}`} className="case-item">
            <Stage
              study={study}
              stageRef={(el) => {
                stages.current[index] = el;
              }}
            />
            {/* Phones and tablets: details directly under the image. */}
            <div className="mt-4 lg:hidden">
              <Details study={study} headingLevel={headingLevel} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: one pinned panel; the active project's details are the only visible ones. */}
      <div ref={track} className="case-panel-track hidden lg:block">
        <div ref={panel} className="case-panel">
          <Ruler studies={studies} active={active} />
          <div ref={stack} className="case-panel-stack">
            {studies.map((study, index) => (
              <article
                key={study.id}
                id={`case-panel-${study.id}`}
                aria-label={study.name}
                data-active={index === active || undefined}
                onFocusCapture={() => setActive(index)}
                className="case-panel-item"
              >
                <Details study={study} headingLevel={headingLevel} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

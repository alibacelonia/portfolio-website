"use client";

import { useId, useState, type ReactNode } from "react";
import type { Discipline } from "@/types/content";

export interface ProjectFilterOption {
  id: "all" | Discipline;
  label: string;
  count: number;
}

/** A small client island: the cards remain server-rendered children, with no project data bundle. */
export function ProjectFilters({
  options,
  children,
}: {
  options: ProjectFilterOption[];
  children: ReactNode;
}) {
  const [selected, setSelected] = useState<ProjectFilterOption["id"]>("all");
  const resultsId = useId();
  const active = options.find(({ id }) => id === selected) ?? options[0]!;

  return (
    <div className="project-collection" data-project-filter={selected}>
      <div className="project-filter-controls mb-7 flex-wrap items-center justify-between gap-4 sm:mb-9">
        <div
          role="group"
          aria-label="Filter projects by discipline"
          className="flex flex-wrap gap-2"
        >
          {options.map(({ id, label, count }) => (
            <button
              key={id}
              type="button"
              aria-pressed={selected === id}
              aria-controls={resultsId}
              onClick={() => setSelected(id)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full glass-control glass-selectable px-4 type-action text-fg-soft transition-colors hover:border-blue-fg hover:text-fg"
            >
              {label}
              <span className="flex min-w-5 items-center justify-center rounded-full bg-fg/5 px-1.5 py-0.5 type-label text-fg-soft">
                {count}
              </span>
            </button>
          ))}
        </div>
        <p role="status" aria-live="polite" aria-atomic="true" className="type-small text-muted">
          {active.count} {active.count === 1 ? "project" : "projects"}
          {selected === "all" ? " to explore" : ` in ${active.label}`}
        </p>
      </div>
      <div id={resultsId} className="project-filter-results">
        {children}
      </div>
    </div>
  );
}

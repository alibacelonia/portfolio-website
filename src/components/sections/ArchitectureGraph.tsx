import { ArrowDown, ArrowRight } from "lucide-react";
import type { ArchitectureLane } from "@/types/content";

const DOT: Record<ArchitectureLane["accent"], string> = {
  sage: "bg-sage",
  blue: "bg-blue",
  lavender: "bg-lavender",
};

/**
 * Cloud architecture as lanes of connected services. Each lane reads left to right from `lg` and
 * top to bottom below it; lanes are ordered lists, so the path is announced in order.
 */
export function ArchitectureGraph({ lanes, label }: { lanes: ArchitectureLane[]; label: string }) {
  return (
    <figure aria-label={label} className="card">
      <div className="space-y-6 lg:space-y-5">
        {lanes.map((lane) => (
          <div
            key={lane.label}
            className="grid grid-cols-1 gap-3 lg:grid-cols-[7.5rem_minmax(0,1fr)] lg:items-center lg:gap-4"
          >
            <p className="flex items-center gap-2 type-label text-fg-soft">
              <span aria-hidden="true" className={`size-1.5 rounded-full ${DOT[lane.accent]}`} />
              {lane.label}
            </p>
            <ol aria-label={`${lane.label}: ${lane.summary}`} className="flex flex-col lg:flex-row">
              {lane.nodes.map((node, index) => (
                <li
                  key={node.name}
                  className="flex min-w-0 flex-col items-stretch lg:flex-1 lg:flex-row lg:items-center"
                >
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      className="flex justify-center py-1 text-muted lg:px-1.5 lg:py-0"
                    >
                      <ArrowDown className="size-3.5 lg:hidden" />
                      <ArrowRight className="hidden size-3.5 lg:block" />
                    </span>
                  ) : null}
                  <div className="min-w-0 flex-1 rounded-md border border-border bg-bg px-3 py-2.5 lg:self-stretch">
                    <p className="type-small font-medium text-fg">{node.name}</p>
                    {node.note ? <p className="mt-0.5 type-label text-muted">{node.note}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </figure>
  );
}

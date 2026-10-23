"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useInView } from "motion/react";
import { Check, RotateCcw } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type StageState = "idle" | "running" | "done";

interface Stage {
  label: string;
  detail: string;
  glyph: ReactNode;
}

const glyph = (children: ReactNode) => (
  <svg
    viewBox="0 0 16 16"
    aria-hidden="true"
    focusable="false"
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const stages: Stage[] = [
  {
    label: "Code",
    detail: "git push",
    glyph: glyph(<path d="M5.5 4 2 8l3.5 4M10.5 4 14 8l-3.5 4" />),
  },
  {
    label: "Build",
    detail: "next build",
    glyph: glyph(
      <path d="M8 2.5 13.5 5 8 7.5 2.5 5 8 2.5ZM2.5 8 8 10.5 13.5 8M2.5 11 8 13.5 13.5 11" />,
    ),
  },
  {
    label: "Deploy",
    detail: "s3 + cdn",
    glyph: glyph(<path d="M8 10.5V2.5M4.75 5.75 8 2.5l3.25 3.25M2.5 13.5h11" />),
  },
  {
    label: "Monitor",
    detail: "metrics",
    glyph: glyph(<path d="M1.5 8.5h3l2-4.5 3 8.5 2-4h3" />),
  },
];

const STEP_MS = 650;
const START_DELAY_MS = 350;
const DONE = stages.length;
const IDLE = -1;

function stateOf(index: number, step: number): StageState {
  if (step === IDLE || index > step) return "idle";
  return index < step || step === DONE ? "done" : "running";
}

const nodeStyles: Record<StageState, string> = {
  idle: "border-border bg-surface text-muted",
  running: "border-blue-fg/50 bg-blue/20 text-blue-fg",
  done: "border-sage-fg/35 bg-sage/20 text-sage-fg",
};

/**
 * A four-stage delivery pipeline. Renders neutral in static HTML, plays one sequential pass
 * when first visible, then rests on "passed". Reduced motion shows the final state directly.
 */
export function Pipeline({ compact = false }: { compact?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = usePrefersReducedMotion();
  const [step, setStep] = useState(IDLE);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const schedule = useCallback(() => {
    clearTimers();
    for (let i = 0; i <= DONE; i++) {
      timers.current.push(window.setTimeout(() => setStep(i), START_DELAY_MS + i * STEP_MS));
    }
  }, []);

  const replay = () => {
    setStep(IDLE);
    schedule();
  };

  useEffect(() => {
    if (!reduceMotion && inView) schedule();
    return clearTimers;
  }, [inView, reduceMotion, schedule]);

  // Reduced motion skips the sequence and shows the finished pipeline.
  const current = reduceMotion ? DONE : step;
  const running = current !== IDLE && current < DONE;
  const status =
    current === DONE
      ? `${DONE}/${DONE} stages passed`
      : running
        ? `running · ${stages[current]!.label.toLowerCase()}`
        : "ready";

  return (
    <figure
      ref={ref}
      className={
        compact
          ? "border-b border-border"
          : "overflow-hidden rounded-xl border border-border bg-surface shadow-raised"
      }
    >
      <figcaption className="sr-only">
        Delivery pipeline used for this site, in four stages: code, build, deploy and monitor.
      </figcaption>

      {!compact ? (
        <div
          aria-hidden="true"
          className="flex h-10 items-center gap-3 border-b border-border px-4 font-mono text-[11px] text-muted"
        >
          <span className="flex gap-1.5">
            <span className="size-2 rounded-full bg-border-strong" />
            <span className="size-2 rounded-full bg-border-strong" />
            <span className="size-2 rounded-full bg-border-strong" />
          </span>
          <span className="min-w-0 flex-1 truncate text-center">
            <span className="hidden sm:inline">.github/workflows/</span>deploy.yml
          </span>
          <span>main</span>
        </div>
      ) : null}

      <ol
        className={
          compact
            ? "grid grid-cols-4 px-2 py-4 [--gap:18px] sm:px-6 sm:[--gap:20px]"
            : "grid grid-cols-4 px-3 py-7 [--gap:24px] sm:px-6 sm:py-9 sm:[--gap:26px]"
        }
      >
        {stages.map((stage, index) => {
          const state = stateOf(index, current);
          const reached = state !== "idle";
          return (
            <li key={stage.label} className="relative flex flex-col items-center text-center">
              {index > 0 ? (
                // Spans from the previous node's right edge to this node's left edge.
                <span
                  aria-hidden="true"
                  className={
                    compact
                      ? "absolute top-3.5 h-px bg-border"
                      : "absolute top-[18px] h-px bg-border sm:top-5"
                  }
                  style={{ left: "calc(-50% + var(--gap))", right: "calc(50% + var(--gap))" }}
                >
                  <span
                    className="block h-full origin-left bg-sage-fg/60 transition-transform duration-500 ease-out-soft motion-reduce:transition-none"
                    style={{ transform: `scaleX(${reached ? 1 : 0})` }}
                  />
                </span>
              ) : null}
              <span
                className={`relative grid place-items-center rounded-lg border transition-colors duration-300 motion-reduce:transition-none ${compact ? "size-7" : "size-9 sm:size-10"} ${nodeStyles[state]}`}
              >
                {stage.glyph}
                {state === "running" ? (
                  <span
                    aria-hidden="true"
                    className="absolute -inset-1 rounded-[10px] border border-blue-fg/30 motion-safe:animate-pulse"
                  />
                ) : null}
              </span>
              <span className={`${compact ? "mt-2" : "mt-3"} text-xs font-medium text-fg`}>
                {stage.label}
              </span>
              <span className="mt-0.5 hidden font-mono text-[10.5px] text-muted sm:block">
                {stage.detail}
              </span>
            </li>
          );
        })}
      </ol>

      <div
        className={`flex items-center justify-between gap-3 font-mono text-[11px] ${compact ? "h-9 border-t border-border/50 px-2" : "h-10 border-t border-border px-4"}`}
      >
        <span
          aria-hidden="true"
          className={`inline-flex items-center gap-1.5 ${current === DONE ? "text-sage-fg" : "text-muted"}`}
        >
          {current === DONE ? (
            <Check className="size-3" />
          ) : (
            <span className="size-1.5 rounded-full bg-current" />
          )}
          {status}
        </span>
        {!reduceMotion ? (
          <button
            type="button"
            onClick={replay}
            disabled={running}
            className="-mr-2 inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-muted transition-colors hover:text-fg disabled:opacity-40"
          >
            <RotateCcw aria-hidden="true" className="size-3" />
            Run again <span className="sr-only">(replay pipeline animation)</span>
          </button>
        ) : null}
      </div>
    </figure>
  );
}

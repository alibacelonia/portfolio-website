"use client";

import { useEffect, useRef, useState } from "react";

export const CAL_EMBED_ORIGIN = "https://app.cal.com";
export const CAL_EMBED_SCRIPT = `${CAL_EMBED_ORIGIN}/embed/embed.js`;
const NAMESPACE = "book";
/** Give up on the embed script after this long and show the plain iframe instead. */
const READY_TIMEOUT_MS = 15_000;

type CalQueue = ((...args: unknown[]) => void) & { q: unknown[] };
type CalGlobal = CalQueue & { ns: Record<string, CalQueue>; loaded?: boolean };

declare global {
  interface Window {
    Cal?: CalGlobal;
  }
}

function queue(): CalQueue {
  const fn = function () {
    // eslint-disable-next-line prefer-rest-params -- embed.js reads the queued `arguments` objects.
    fn.q.push(arguments);
  } as CalQueue;
  fn.q = [];
  return fn;
}

let loading: Promise<void> | null = null;

/**
 * Cal.com's embed snippet, unminified: calls are queued on window.Cal until embed.js loads and
 * replays them. The script is added here (not by the snippet) so a blocked load can be detected.
 */
function loadCal(): { cal: CalGlobal; ready: Promise<void> } {
  if (!window.Cal) {
    const cal = function () {
      // eslint-disable-next-line prefer-rest-params -- same queue format as Cal.com's snippet.
      const args = arguments;
      if (args[0] === "init" && typeof args[1] === "string") {
        const ns = (cal.ns[args[1]] ??= queue());
        ns.q.push(args);
        cal.q.push(["initNamespace", args[1]]);
        return;
      }
      cal.q.push(args);
    } as CalGlobal;
    cal.q = [];
    cal.ns = {};
    cal.loaded = true;
    window.Cal = cal;
  }
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CAL_EMBED_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error("Cal.com embed failed to load"));
    };
    document.head.appendChild(script);
  });
  return { cal: window.Cal, ready: loading };
}

/** Site tokens for Cal.com's theme variables, so the calendar reads as part of the page. */
function themeVars() {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();
  return {
    "cal-bg": token("--surface"),
    "cal-bg-muted": token("--surface"),
    "cal-border": token("--border-strong"),
    "cal-border-subtle": token("--border"),
    "cal-brand": token("--fg"),
  };
}

/**
 * Inline Cal.com booking calendar: transparent background in the site's colors, no event-details
 * panel, and a height that follows the calendar. A skeleton shows until Cal.com reports the link
 * is ready; if the embed script is blocked or slow, the plain booking iframe is used instead.
 */
export function CalEmbed({ link, title }: { link: string; title: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    if (!container.current) return;
    // A fresh target per run, so a remount (e.g. React's dev double-mount) never stacks calendars.
    const el = container.current.appendChild(document.createElement("div"));
    let settled = false;
    let timer = 0;
    const settle = (next: "ready" | "fallback") => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      setState(next);
    };
    timer = window.setTimeout(() => settle("fallback"), READY_TIMEOUT_MS);

    const { cal, ready } = loadCal();
    if (!cal.ns[NAMESPACE]) cal("init", NAMESPACE, { origin: CAL_EMBED_ORIGIN });
    const api = cal.ns[NAMESPACE]!;
    api("inline", {
      elementOrSelector: el,
      calLink: link,
      config: { layout: "month_view", theme: "dark" },
    });
    api("ui", {
      theme: "dark",
      layout: "month_view",
      hideEventTypeDetails: true,
      cssVarsPerTheme: { dark: themeVars() },
    });
    api("on", {
      action: "linkReady",
      callback: () => {
        el.querySelector("iframe")?.setAttribute("title", title);
        settle("ready");
      },
    });
    ready.catch(() => settle("fallback"));

    return () => {
      settled = true;
      window.clearTimeout(timer);
      el.remove();
    };
  }, [link, title]);

  if (state === "fallback") {
    return (
      <iframe
        src={`https://cal.com/${link}?embed=true&layout=month_view&theme=dark`}
        title={title}
        className="block h-[720px] w-full"
      />
    );
  }

  return (
    <div className="relative">
      {state === "loading" ? <CalendarSkeleton /> : null}
      <div
        ref={container}
        aria-busy={state === "loading"}
        className={`w-full transition-opacity duration-300 motion-reduce:transition-none ${
          state === "loading" ? "pointer-events-none absolute inset-x-0 top-0 opacity-0" : ""
        }`}
      />
    </div>
  );
}

/** Calendar-shaped placeholder sized like Cal.com's desktop month view (760 × 571px), so nothing jumps. */
function CalendarSkeleton() {
  const bar = "rounded-md bg-surface-2 animate-pulse motion-reduce:animate-none";
  return (
    <div
      role="status"
      aria-label="Loading the booking calendar"
      className="mx-auto flex min-h-[571px] max-w-[760px] overflow-hidden rounded-md border border-border-strong bg-surface"
    >
      <div className="flex-1 p-5">
        <div className="flex items-center justify-between">
          <span className={`h-5 w-32 ${bar}`} />
          <span className={`h-5 w-14 ${bar}`} />
        </div>
        <div className="mt-6 grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }, (_, i) => (
            <span key={i} className={`aspect-square ${bar}`} />
          ))}
        </div>
      </div>
      <div className="hidden w-[17.5rem] shrink-0 flex-col gap-2 border-l border-border-strong p-5 md:flex">
        <span className={`mb-2 h-5 w-24 ${bar}`} />
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className={`h-9 ${bar}`} />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheck, RotateCcw } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export const CAL_EMBED_ORIGIN = "https://app.cal.com";
export const CAL_EMBED_SCRIPT = `${CAL_EMBED_ORIGIN}/embed/embed.js`;
const NAMESPACE = "book";
/** Origins the booking frame posts its events from (embed and plain-iframe fallback). */
const CAL_ORIGINS = new Set([CAL_EMBED_ORIGIN, "https://cal.com"]);
const BOOKED_EVENT =
  /^CAL:[^:]*:(bookingSuccessfulV2|rescheduleBookingSuccessfulV2|bookingSuccessful)$/;
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
/** Calendar mounts so far; each gets its own Cal.com namespace. */
let mounts = 0;

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

export interface Booking {
  title?: string;
  startTime?: string;
  /** The event needs the owner's confirmation before it's final. */
  pending: boolean;
  rescheduled: boolean;
}

/**
 * Reads a booking from a Cal.com frame message (`{ fullType: "CAL:<ns>:bookingSuccessfulV2", data }`;
 * the older `bookingSuccessful` nests it under `data.booking`). Anything else returns null.
 */
export function parseBooking(origin: string, message: unknown): Booking | null {
  if (!CAL_ORIGINS.has(origin) || typeof message !== "object" || message === null) return null;
  const { fullType, data } = message as { fullType?: unknown; data?: Record<string, unknown> };
  const type = typeof fullType === "string" ? BOOKED_EVENT.exec(fullType)?.[1] : undefined;
  if (!type) return null;
  const booking = (data?.booking ?? data ?? {}) as Record<string, unknown>;
  const text = (value: unknown) => (typeof value === "string" ? value : undefined);
  return {
    title: text(booking.title),
    startTime: text(booking.startTime),
    pending: booking.status === "PENDING" || data?.confirmed === false,
    rescheduled: type.startsWith("reschedule"),
  };
}

/**
 * Cal.com booking calendar. When a booking succeeds, Cal.com's own success page would replace the
 * calendar inside the frame (and loses the dark theme), so the site shows its own confirmation
 * instead; "Book another time" brings back a fresh calendar.
 */
export function CalEmbed({ link, title }: { link: string; title: string }) {
  const { theme } = useTheme();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const booked = parseBooking(event.origin, event.data);
      if (booked) setBooking(booked);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (booking) {
    return (
      <BookingConfirmed
        booking={booking}
        onBookAnother={() => {
          setBooking(null);
          setRound((value) => value + 1);
        }}
      />
    );
  }
  // "Book another time" and a theme switch both remount the calendar; every mount gets a fresh
  // Cal.com namespace, so a new calendar never reuses a finished or differently themed one.
  return (
    <CalendarFrame key={`${round}-${theme}`} link={link} title={title} theme={theme ?? "dark"} />
  );
}

function BookingConfirmed({
  booking,
  onBookAnother,
}: {
  booking: Booking;
  onBookAnother: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panel.current?.focus();
  }, []);
  const start = booking.startTime ? new Date(booking.startTime) : null;
  const when =
    start && !Number.isNaN(start.getTime())
      ? new Intl.DateTimeFormat(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        }).format(start)
      : null;
  const heading = booking.pending
    ? "Request sent"
    : booking.rescheduled
      ? "Your call is rescheduled"
      : "Your call is booked";
  return (
    <div
      ref={panel}
      tabIndex={-1}
      role="status"
      className="mx-auto flex max-w-xl flex-col items-center card py-10 text-center outline-none"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-sage/15">
        <CircleCheck aria-hidden="true" className="size-6 text-sage-fg" />
      </span>
      <p className="mt-4 type-card-title">{heading}</p>
      {booking.title || when ? (
        <p className="mt-2 type-body text-fg-soft">
          {[booking.title, when].filter(Boolean).join(" · ")}
        </p>
      ) : null}
      <p className="mt-1 max-w-[44ch] type-body text-muted">
        {booking.pending
          ? "You'll get an email as soon as it's confirmed."
          : "A calendar invite is on its way to your email."}
      </p>
      <button
        type="button"
        onClick={onBookAnother}
        className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg glass-control px-4 type-action text-fg transition-colors hover:border-border-strong"
      >
        <RotateCcw aria-hidden="true" className="size-4" />
        Book another time
      </button>
    </div>
  );
}

/**
 * Inline Cal.com booking calendar in Cal.com's own theme (following the site's) (event details, month view, time
 * slots), sized to its content with no surrounding box. A skeleton shows until Cal.com reports the
 * link is ready; if the embed script is blocked or slow, the plain booking iframe is used instead.
 */
function CalendarFrame({
  link,
  title,
  theme,
}: {
  link: string;
  title: string;
  theme: "light" | "dark";
}) {
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
    const namespace = mounts++ ? `${NAMESPACE}${mounts}` : NAMESPACE;
    if (!cal.ns[namespace]) cal("init", namespace, { origin: CAL_EMBED_ORIGIN });
    const api = cal.ns[namespace]!;
    api("inline", {
      elementOrSelector: el,
      calLink: link,
      config: { layout: "month_view", theme },
    });
    api("ui", { theme, layout: "month_view" });
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
  }, [link, title, theme]);

  if (state === "fallback") {
    return (
      <iframe
        src={`https://cal.com/${link}?embed=true&layout=month_view&theme=${theme}`}
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

/**
 * Placeholder in the shape of Cal.com's desktop month view (event details, calendar, time slots;
 * 570px tall), so nothing jumps when the calendar appears. Phones show the calendar part only.
 */
function CalendarSkeleton() {
  const bar = "rounded-md bg-surface-2 animate-pulse motion-reduce:animate-none";
  return (
    <div
      role="status"
      aria-label="Loading the booking calendar"
      className="flex min-h-[570px] overflow-hidden rounded-md glass"
    >
      <div className="hidden w-[17.5rem] shrink-0 flex-col gap-3 border-r border-border-strong p-6 lg:flex">
        <span className={`size-6 rounded-full ${bar}`} />
        <span className={`h-4 w-28 ${bar}`} />
        <span className={`h-6 w-44 ${bar}`} />
        {Array.from({ length: 3 }, (_, i) => (
          <span key={i} className={`h-4 w-32 ${bar}`} />
        ))}
      </div>
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
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className={`h-9 ${bar}`} />
        ))}
      </div>
    </div>
  );
}

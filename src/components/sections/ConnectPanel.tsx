"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { preconnect, preload } from "react-dom";
import { CalendarDays, Check, Copy, FileText, MessageSquare } from "lucide-react";
import { site } from "@/lib/site";
import { CalEmbed, CAL_EMBED_ORIGIN, CAL_EMBED_SCRIPT } from "@/components/ui/CalEmbed";
import { ContactForm } from "./ContactForm";

export const intents = [
  {
    id: "project",
    label: "Project",
    note: "Scoping a build? Share what it should do and when you need it.",
    subject: "Project enquiry",
  },
  {
    id: "role",
    label: "Role",
    note: "Hiring? Tell me about the team, the stack and the role.",
    subject: "Role opportunity",
  },
  {
    id: "hello",
    label: "Just a hey",
    note: "No agenda needed. Say hello.",
    subject: "Hello",
  },
] as const;

type IntentId = (typeof intents)[number]["id"];

const TIME_ZONE = "Asia/Manila";
const timeFormat = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

function subscribeToClock(onChange: () => void) {
  const id = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(id);
}

/** Local time where I live; empty in the static HTML so hydration matches, then live. */
function useLocalTime(): string {
  return useSyncExternalStore(
    subscribeToClock,
    () => timeFormat.format(new Date()),
    () => "",
  );
}

function CopyEmail() {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const copy = async () => {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(site.email);
      setStatus("copied");
      timer.current = setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  };
  return (
    <div className="rounded-xl border border-border-strong bg-surface p-3.5 pl-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="type-label tracking-wide text-muted uppercase">Email</p>
          <a
            href={`mailto:${site.email}`}
            className="mt-0.5 inline-flex min-h-8 items-center type-body break-all text-fg hover:underline"
          >
            {site.email}
          </a>
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-md px-2 type-small text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          {status === "copied" ? (
            <Check aria-hidden="true" className="size-3.5" />
          ) : (
            <Copy aria-hidden="true" className="size-3.5" />
          )}
          {status === "copied" ? "Copied" : "Copy"}
          <span className="sr-only"> email address</span>
        </button>
      </div>
      <p
        role="status"
        className={status === "error" ? "mt-2 type-small wrap-anywhere text-muted" : "sr-only"}
      >
        {status === "copied"
          ? "Email address copied to clipboard."
          : status === "error"
            ? `Couldn't copy automatically. You can copy this address: ${site.email}`
            : ""}
      </p>
    </div>
  );
}

const iconLink =
  "inline-flex size-10 items-center justify-center rounded-lg border border-border-strong bg-surface text-fg-soft transition-colors hover:bg-surface-2 hover:text-fg";

/** LinkedIn and GitHub marks (lucide dropped brand icons). */
function BrandIcon({ name }: { name: "linkedin" | "github" }) {
  return name === "linkedin" ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor">
      <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57v-2.23c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.31-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.62-5.48 5.92.42.36.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .3Z" />
    </svg>
  );
}

const tabs = [
  { id: "call", label: "Book a call", Icon: CalendarDays },
  { id: "message", label: "Send a message", Icon: MessageSquare },
] as const;

type TabId = (typeof tabs)[number]["id"];

/** Cal.com's inline booking page, loaded only when its tab is opened. */
/**
 * Book a call / Send a message, like the reference. The booking tab only exists once a Cal.com
 * link is configured (NEXT_PUBLIC_CAL_LINK); in development it shows how to set one up.
 */
function ConnectTabs({ subject }: { subject?: string }) {
  const showCall = Boolean(site.calLink) || process.env.NODE_ENV !== "production";
  if (site.calLink) {
    // Emitted into the static HTML, so the embed starts downloading before hydration.
    preconnect(CAL_EMBED_ORIGIN);
    preload(CAL_EMBED_SCRIPT, { as: "script" });
  }
  const [tab, setTab] = useState<TabId>(showCall ? "call" : "message");
  const refs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});
  const visible = tabs.filter((item) => item.id !== "call" || showCall);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const index = visible.findIndex((item) => item.id === tab);
    const next =
      visible[(index + (event.key === "ArrowRight" ? 1 : -1) + visible.length) % visible.length]!;
    setTab(next.id);
    refs.current[next.id]?.focus();
  };

  return (
    <div data-reveal className="mx-auto mt-14 max-w-5xl">
      {visible.length > 1 ? (
        <div className="flex justify-center">
          <div
            role="tablist"
            aria-label="How to get in touch"
            onKeyDown={onKeyDown}
            className="inline-flex gap-1 rounded-full border border-border bg-surface p-1"
          >
            {visible.map(({ id, label, Icon }) => (
              <button
                key={id}
                ref={(el) => {
                  refs.current[id] = el;
                }}
                id={`connect-tab-${id}`}
                role="tab"
                type="button"
                aria-selected={tab === id}
                aria-controls={`connect-panel-${id}`}
                tabIndex={tab === id ? 0 : -1}
                onClick={() => setTab(id)}
                className="inline-flex min-h-10 items-center gap-2 rounded-full px-4 type-action text-fg-soft transition-colors hover:text-fg aria-selected:bg-surface-2 aria-selected:text-fg aria-selected:shadow-sm"
              >
                <Icon aria-hidden="true" className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {showCall ? (
        <div
          id="connect-panel-call"
          role="tabpanel"
          aria-labelledby="connect-tab-call"
          hidden={tab !== "call"}
          className="mt-6"
        >
          {/* Stays mounted while hidden, so switching tabs doesn't reload the calendar. */}
          {site.calLink ? (
            <CalEmbed link={site.calLink} title="Book a call with Mohammed Ali (Cal.com)" />
          ) : (
            <div className="section-panel p-6 text-center type-body text-muted">
              Booking isn&apos;t set up yet. Set{" "}
              <code className="type-mono">NEXT_PUBLIC_CAL_LINK</code> to your Cal.com link (e.g.{" "}
              <code className="type-mono">alibacelonia/30min</code>). This note only appears in
              development.
            </div>
          )}
        </div>
      ) : null}

      <div
        id="connect-panel-message"
        role="tabpanel"
        aria-labelledby={visible.length > 1 ? "connect-tab-message" : undefined}
        aria-label={visible.length > 1 ? undefined : "Send a message"}
        hidden={tab !== "message"}
        className="section-panel mx-auto mt-6 max-w-3xl p-5 sm:p-8"
      >
        <h2 className="type-card-title">Send a message</h2>
        <p className="mt-1 mb-6 type-body text-muted">
          Tell me what you&apos;re working on and how I can help.
        </p>
        <ContactForm subject={subject} />
      </div>
    </div>
  );
}

/**
 * The Connect strip, modeled on the owner's reference: who I am with my local time, what brings
 * the visitor here, and direct channels. With `withForm`, the chosen reason also fills in the
 * message form's subject.
 */
export function ConnectPanel({ withForm = false }: { withForm?: boolean }) {
  const [intent, setIntent] = useState<IntentId | null>(null);
  const time = useLocalTime();
  const chosen = intents.find((item) => item.id === intent);

  return (
    <>
      <div
        data-reveal-group
        className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-12"
      >
        <div className="flex items-center gap-5">
          <div className="connect-polaroid shrink-0">
            <Image
              src="/images/mohammed-ali-abdullah.webp"
              alt=""
              width={160}
              height={160}
              className="size-20 object-cover contrast-[1.08] grayscale sm:size-[5.5rem]"
            />
          </div>
          <div className="min-w-0">
            <p className="font-serif text-[1.625rem] leading-tight text-fg">{site.name}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 type-small text-fg-soft">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-sage" />
              {time ? <time className="whitespace-nowrap">{time}</time> : null}
              <span className={time ? "text-muted" : undefined}>in {site.location}</span>
            </p>
          </div>
        </div>

        <div>
          <p id="connect-intent-label" className="type-label tracking-wide text-muted uppercase">
            What brings you here?
          </p>
          <div
            role="group"
            aria-labelledby="connect-intent-label"
            className="mt-3 flex flex-wrap gap-2"
          >
            {intents.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={intent === item.id}
                onClick={() => setIntent(intent === item.id ? null : item.id)}
                className="min-h-10 rounded-full border border-border-strong px-4 type-action text-fg-soft transition-colors hover:bg-surface-2 hover:text-fg aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-bg"
              >
                {item.label}
              </button>
            ))}
          </div>
          <p aria-live="polite" className="mt-3 min-h-6 font-serif text-lg text-fg-soft italic">
            {chosen?.note}
          </p>
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <p className="type-label tracking-wide text-muted uppercase">Or reach me directly</p>
          <div className="mt-3">
            <CopyEmail />
          </div>
          <ul className="mt-3 flex gap-2">
            <li>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={iconLink}
                aria-label="LinkedIn (opens in a new tab)"
              >
                <BrandIcon name="linkedin" />
              </a>
            </li>
            <li>
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className={iconLink}
                aria-label="GitHub (opens in a new tab)"
              >
                <BrandIcon name="github" />
              </a>
            </li>
            <li>
              <a
                href={site.resume.href}
                download={site.resume.fileName}
                className={iconLink}
                aria-label="Download resume (PDF)"
              >
                <FileText aria-hidden="true" className="size-4" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {withForm ? <ConnectTabs subject={chosen?.subject} /> : null}
    </>
  );
}

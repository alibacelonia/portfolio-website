"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowUpRight, Check } from "lucide-react";

/** Copy on desktop; preserve the native mail link on smaller screens and without JavaScript. */
export function EmailLink({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      !window.matchMedia("(min-width: 1024px)").matches ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;

    event.preventDefault();
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setStatus("copied");
      timer.current = setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <a
        href={`mailto:${email}`}
        onClick={onClick}
        className="inline-flex min-h-10 items-center gap-1 hover:text-fg"
      >
        {status === "copied" ? "copied!" : "email"}
        {status === "copied" ? (
          <Check aria-hidden="true" className="size-3.5" />
        ) : (
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        )}
      </a>
      <span
        role="status"
        className={status === "error" ? "basis-full text-xs wrap-anywhere text-muted" : "sr-only"}
      >
        {status === "copied"
          ? "Email address copied to clipboard."
          : status === "error"
            ? `Couldn't copy automatically. You can copy this address: ${email}`
            : ""}
      </span>
    </>
  );
}

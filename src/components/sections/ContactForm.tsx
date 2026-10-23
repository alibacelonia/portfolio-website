"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { CircleAlert, LoaderCircle, Mail, Send } from "lucide-react";
import { site } from "@/lib/site";
import {
  CONTACT_LIMITS,
  MIN_FILL_MS,
  buildMailto,
  submitToFormspree,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactValues,
} from "@/lib/contact";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; name: string; email: string }
  | { kind: "error"; message: string }
  | { kind: "mailto" };

const EMPTY: ContactValues = { name: "", email: "", subject: "", message: "" };
const FIELDS: ContactField[] = ["name", "email", "subject", "message"];

interface ContactFormProps {
  /** Formspree form ID; null switches to the mailto fallback. */
  formId?: string | null;
  recipient?: string;
  fetchImpl?: typeof fetch;
  openUrl?: (url: string) => void;
  now?: () => number;
}

export function ContactForm({
  formId = site.formspreeId,
  recipient = site.email,
  fetchImpl,
  openUrl = (url) => window.location.assign(url),
  now = Date.now,
}: ContactFormProps) {
  const id = useId();
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [honeypot, setHoneypot] = useState("");
  const startedAt = useRef<number>(0);
  const fieldRefs = useRef<Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement>>>(
    {},
  );
  const statusRef = useRef<HTMLDivElement>(null);
  const configured = Boolean(formId);

  useEffect(() => {
    startedAt.current = now();
  }, [now]);

  useEffect(() => {
    if (status.kind === "success" || status.kind === "error" || status.kind === "mailto") {
      statusRef.current?.focus();
    }
  }, [status]);

  const fieldId = (field: ContactField) => `${id}-${field}`;
  const errorId = (field: ContactField) => `${id}-${field}-error`;

  const onChange =
    (field: ContactField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const next = { ...values, [field]: event.target.value };
      setValues(next);
      if (touched[field]) setErrors((prev) => ({ ...prev, [field]: validateContact(next)[field] }));
      if (status.kind === "error") setStatus({ kind: "idle" });
    };

  const onBlur = (field: ContactField) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateContact(values)[field] }));
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "submitting") return;

    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, subject: true, message: true });
    const firstInvalid = FIELDS.find((field) => nextErrors[field]);
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }

    if (now() - startedAt.current < MIN_FILL_MS) {
      setStatus({
        kind: "error",
        message: "That was quicker than expected. Please review your message and send it again.",
      });
      return;
    }

    if (!configured || !formId) {
      if (!honeypot) openUrl(buildMailto(recipient, values));
      setStatus({ kind: "mailto" });
      return;
    }

    setStatus({ kind: "submitting" });
    const result = await submitToFormspree(formId, { ...values, _gotcha: honeypot }, fetchImpl);
    if (result.ok) {
      setStatus({ kind: "success", name: values.name.trim(), email: values.email.trim() });
      setValues(EMPTY);
      setTouched({});
    } else {
      setStatus({ kind: "error", message: result.message });
    }
  }

  if (status.kind === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="rounded-xl border border-border bg-surface p-6 shadow-card outline-none sm:p-8"
      >
        <p className="text-base font-semibold text-fg">Message sent. Thank you, {status.name}.</p>
        <p className="mt-2 text-sm text-muted">
          Replies will go to <span className="text-fg-soft">{status.email}</span>.
        </p>
        <button
          type="button"
          onClick={() => {
            startedAt.current = now();
            setStatus({ kind: "idle" });
          }}
          className="mt-6 inline-flex min-h-10 items-center rounded-lg border border-border-strong px-4 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  const submitting = status.kind === "submitting";
  const inputClass = (field: ContactField) =>
    `block w-full rounded-lg border bg-bg px-3 py-2.5 text-[15px] text-fg placeholder:text-muted/70 transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-fg disabled:opacity-60 ${
      errors[field] ? "border-danger" : "border-border-strong hover:border-fg/30"
    }`;

  const renderField = (
    field: ContactField,
    label: string,
    props: { type?: string; autoComplete?: string; maxLength: number; multiline?: boolean },
  ) => {
    const shared = {
      id: fieldId(field),
      name: field,
      value: values[field],
      onChange: onChange(field),
      onBlur: onBlur(field),
      required: true,
      disabled: submitting,
      "aria-invalid": errors[field] ? true : undefined,
      "aria-describedby": errors[field] ? errorId(field) : undefined,
      className: inputClass(field),
    } as const;
    return (
      <div className={field === "message" || field === "subject" ? "sm:col-span-2" : undefined}>
        <label
          htmlFor={fieldId(field)}
          className="mb-1.5 block text-[13px] font-medium text-fg-soft"
        >
          {label}
          <span aria-hidden="true" className="text-muted">
            {" "}
            *
          </span>
        </label>
        {props.multiline ? (
          <textarea
            {...shared}
            ref={(el) => {
              if (el) fieldRefs.current[field] = el;
            }}
            rows={6}
            maxLength={props.maxLength}
            className={`${shared.className} min-h-36 resize-y`}
          />
        ) : (
          <input
            {...shared}
            ref={(el) => {
              if (el) fieldRefs.current[field] = el;
            }}
            type={props.type ?? "text"}
            autoComplete={props.autoComplete}
            maxLength={props.maxLength}
            spellCheck={props.type === "email" ? false : undefined}
          />
        )}
        {errors[field] ? (
          <p id={errorId(field)} className="mt-1.5 text-[13px] text-danger">
            {errors[field]}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-describedby={`${id}-required`}
      aria-busy={submitting}
      className="relative rounded-xl border border-border bg-surface p-5 shadow-card sm:p-7"
    >
      <p id={`${id}-required`} className="mb-5 text-[13px] text-muted">
        All fields are required.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {renderField("name", "Name", { autoComplete: "name", maxLength: CONTACT_LIMITS.name })}
        {renderField("email", "Email", {
          type: "email",
          autoComplete: "email",
          maxLength: CONTACT_LIMITS.email,
        })}
        {renderField("subject", "Subject", { maxLength: CONTACT_LIMITS.subject })}
        {renderField("message", "Message", { multiline: true, maxLength: CONTACT_LIMITS.message })}
      </div>

      {/* Honeypot: hidden from people and assistive technology; bots that fill it are discarded. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-gotcha`}>Leave this field empty</label>
        <input
          id={`${id}-gotcha`}
          type="text"
          name="_gotcha"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      {status.kind === "error" ? (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          className="mt-5 flex gap-2.5 rounded-lg border border-danger/30 bg-danger/5 p-3 text-[13px] text-fg-soft outline-none"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" />
          <p>
            Your message wasn&apos;t sent. {status.message} You can try again or email{" "}
            <a href={`mailto:${recipient}`} className="font-medium text-blue-fg underline">
              {recipient}
            </a>{" "}
            directly.
          </p>
        </div>
      ) : null}

      {status.kind === "mailto" ? (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="status"
          className="mt-5 rounded-lg border border-border bg-surface-2 p-3 text-[13px] text-fg-soft outline-none"
        >
          Your email app should open with this message ready to send. Nothing has been sent yet. If
          it didn&apos;t open, email{" "}
          <a href={`mailto:${recipient}`} className="font-medium text-blue-fg underline">
            {recipient}
          </a>
          .
        </div>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          {configured
            ? "Sent via Formspree. Your details are only used to reply to you."
            : "Opens your email app with the message filled in."}
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-fg px-5 text-sm font-medium text-bg transition-[background-color,transform] hover:bg-fg/85 active:translate-y-px disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
              Sending…
            </>
          ) : configured ? (
            <>
              <Send aria-hidden="true" className="size-4" />
              Send message
            </>
          ) : (
            <>
              <Mail aria-hidden="true" className="size-4" />
              Open email app
            </>
          )}
        </button>
      </div>
    </form>
  );
}

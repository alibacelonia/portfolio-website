"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { CircleAlert, CircleCheck, LoaderCircle, RotateCcw, Send } from "lucide-react";
import { site } from "@/lib/site";
import { Turnstile } from "@/components/ui/Turnstile";
import {
  CONTACT_LIMITS,
  MIN_FILL_MS,
  submitToContactApi,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactValues,
} from "@/lib/contact";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; name: string; email: string }
  | { kind: "error"; message: string };

const EMPTY: ContactValues = { name: "", email: "", subject: "", message: "" };
const FIELDS: ContactField[] = ["name", "email", "subject", "message"];

interface ContactFormProps {
  /** Contact API endpoint (NEXT_PUBLIC_CONTACT_API_URL). Unset: sending reports that it's unavailable. */
  apiUrl?: string | null;
  /** Cloudflare Turnstile site key; when set, a check is required before sending. */
  turnstileSiteKey?: string | null;
  recipient?: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
  /** Suggested subject (e.g. from the Connect reason); fills the field until the visitor edits it. */
  subject?: string;
}

export function ContactForm({
  apiUrl = site.contactApiUrl,
  turnstileSiteKey = site.turnstileSiteKey,
  recipient = site.email,
  fetchImpl,
  now = Date.now,
  subject,
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
  const needsChallenge = Boolean(turnstileSiteKey);
  const [token, setToken] = useState<string | null>(null);
  const [challengeRound, setChallengeRound] = useState(0);

  useEffect(() => {
    startedAt.current = now();
  }, [now]);

  // Follow the suggested subject until the visitor types their own.
  const [subjectEdited, setSubjectEdited] = useState(false);
  const current = subjectEdited || subject === undefined ? values : { ...values, subject };

  useEffect(() => {
    if (status.kind === "success" || status.kind === "error") {
      statusRef.current?.focus();
    }
  }, [status]);

  const fieldId = (field: ContactField) => `${id}-${field}`;
  const errorId = (field: ContactField) => `${id}-${field}-error`;

  const onChange =
    (field: ContactField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (field === "subject") setSubjectEdited(true);
      const next = { ...current, [field]: event.target.value };
      setValues(next);
      if (touched[field]) setErrors((prev) => ({ ...prev, [field]: validateContact(next)[field] }));
      if (status.kind === "error") setStatus({ kind: "idle" });
    };

  const onBlur = (field: ContactField) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateContact(current)[field] }));
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "submitting") return;

    const nextErrors = validateContact(current);
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

    if (!apiUrl) {
      setStatus({ kind: "error", message: "Sending isn't available right now." });
      return;
    }

    if (needsChallenge && !token) {
      setStatus({ kind: "error", message: "Please complete the verification check first." });
      return;
    }

    setStatus({ kind: "submitting" });
    const result = await submitToContactApi(
      apiUrl,
      { ...current, _gotcha: honeypot, turnstileToken: token ?? "" },
      fetchImpl,
    );
    // Turnstile tokens are single-use: get a fresh check for any next attempt.
    if (needsChallenge) setChallengeRound((round) => round + 1);
    if (result.ok) {
      setStatus({ kind: "success", name: current.name.trim(), email: current.email.trim() });
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
        className="flex flex-col items-center py-6 text-center outline-none"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-sage/15">
          <CircleCheck aria-hidden="true" className="size-6 text-sage-fg" />
        </span>
        <p className="mt-4 type-card-title">Message sent. Thank you, {status.name}.</p>
        <p className="mt-2 max-w-[44ch] type-body text-muted">
          It&apos;s in my inbox. Replies will go to{" "}
          <span className="text-fg-soft">{status.email}</span>.
        </p>
        <button
          type="button"
          onClick={() => {
            startedAt.current = now();
            setStatus({ kind: "idle" });
          }}
          className="mt-6 inline-flex min-h-10 items-center rounded-lg glass-control px-4 type-action text-fg transition-colors hover:border-border-strong"
        >
          Send another message
        </button>
      </div>
    );
  }

  const submitting = status.kind === "submitting";
  const inputClass = (field: ContactField) =>
    `block w-full rounded-lg glass-field px-3 py-2.5 text-base text-fg placeholder:text-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-fg disabled:opacity-60 ${
      errors[field] ? "border-danger!" : "hover:border-blue-fg"
    }`;

  const renderField = (
    field: ContactField,
    label: string,
    props: { type?: string; autoComplete?: string; maxLength: number; multiline?: boolean },
  ) => {
    const shared = {
      id: fieldId(field),
      name: field,
      value: current[field],
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
          className="mb-1.5 block type-small font-medium text-fg-soft"
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
          <p id={errorId(field)} className="mt-1.5 type-small text-danger">
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
      className="relative"
    >
      <p id={`${id}-required`} className="mb-5 type-small text-muted">
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

      {turnstileSiteKey ? (
        <div className="mt-5">
          <Turnstile siteKey={turnstileSiteKey} onToken={setToken} resetKey={challengeRound} />
        </div>
      ) : null}

      {status.kind === "error" ? (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          className="mt-5 flex gap-3 rounded-lg border border-danger/30 bg-danger/5 p-4 type-small text-fg-soft outline-none"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" />
          <div>
            <p className="font-medium text-fg">Your message wasn&apos;t sent.</p>
            <p className="mt-1">
              {status.message} Your message is still here, so you can try again, or email{" "}
              <a href={`mailto:${recipient}`} className="font-medium text-blue-fg underline">
                {recipient}
              </a>{" "}
              directly.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="type-small text-muted">
          Sent straight to my inbox. Your details are only used to reply to you.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg glass-control px-5 type-action text-fg transition-[border-color,transform] hover:border-blue-fg active:translate-y-px disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
              Sending…
            </>
          ) : status.kind === "error" ? (
            <>
              <RotateCcw aria-hidden="true" className="size-4" />
              Try again
            </>
          ) : (
            <>
              <Send aria-hidden="true" className="size-4" />
              Send message
            </>
          )}
        </button>
      </div>
    </form>
  );
}

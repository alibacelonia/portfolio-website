export interface ContactValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ContactField = keyof ContactValues;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  subject: 150,
  messageMin: 10,
  message: 5000,
} as const;

/** Submissions faster than this after the form appears are treated as automated. */
export const MIN_FILL_MS = 3000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const subject = values.subject.trim();
  const message = values.message.trim();

  if (!name) errors.name = "Please enter your name.";
  else if (name.length > CONTACT_LIMITS.name)
    errors.name = `Please keep your name under ${CONTACT_LIMITS.name} characters.`;

  if (!email) errors.email = "Please enter your email address.";
  else if (email.length > CONTACT_LIMITS.email || !isValidEmail(email))
    errors.email = "Please enter a valid email address, like name@example.com.";

  if (!subject) errors.subject = "Please add a subject.";
  else if (subject.length > CONTACT_LIMITS.subject)
    errors.subject = `Please keep the subject under ${CONTACT_LIMITS.subject} characters.`;

  if (!message) errors.message = "Please write a message.";
  else if (message.length < CONTACT_LIMITS.messageMin)
    errors.message = `Please write at least ${CONTACT_LIMITS.messageMin} characters.`;
  else if (message.length > CONTACT_LIMITS.message)
    errors.message = `Please keep your message under ${CONTACT_LIMITS.message} characters.`;

  return errors;
}

export type SubmitResult = { ok: true } | { ok: false; message: string };

/** Messages for the contact API's error codes (infra/lambda/contact). */
const API_MESSAGES: Record<string, string> = {
  challenge: "The verification check failed. Please complete it again.",
  rate_limited: "Too many messages from your connection. Please try again in an hour.",
  duplicate: "This message was already sent.",
  daily_quota: "The form has reached today's limit.",
  invalid: "Some fields are missing or invalid.",
};

/** Posts to the site's own contact API with a Cloudflare Turnstile token. */
export async function submitToContactApi(
  url: string,
  values: ContactValues & { _gotcha: string; turnstileToken: string },
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 15000,
): Promise<SubmitResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
        turnstileToken: values.turnstileToken,
        _gotcha: values._gotcha,
      }),
      signal: controller.signal,
    });
    if (response.ok) return { ok: true };
    let message = "The message service rejected the message.";
    try {
      const data = (await response.json()) as { code?: string };
      if (data.code && API_MESSAGES[data.code]) message = API_MESSAGES[data.code]!;
    } catch {
      // Non-JSON error body; keep the generic message.
    }
    return { ok: false, message };
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === "AbortError";
    return {
      ok: false,
      message: aborted
        ? "The request timed out."
        : "The network request failed. Check your connection.",
    };
  } finally {
    clearTimeout(timer);
  }
}

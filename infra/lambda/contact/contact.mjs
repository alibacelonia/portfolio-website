// Contact form handler logic, free of AWS SDK imports so it can be unit tested with fakes.
// index.mjs wires in DynamoDB, SES, SSM and fetch.
import { createHash } from "node:crypto";

export const LIMITS = {
  name: 100,
  email: 254,
  subject: 150,
  messageMin: 10,
  message: 5000,
  /** Raw request body size accepted, in bytes. */
  body: 16_384,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[A-Za-z]{2,}$/;
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Same rules as the site's form (src/lib/contact.ts); the server never trusts the client. */
export function validate(input) {
  const errors = {};
  const value = (key) => (typeof input?.[key] === "string" ? input[key].trim() : "");
  const fields = {
    name: value("name"),
    email: value("email"),
    subject: value("subject"),
    message: value("message"),
  };
  if (!fields.name || fields.name.length > LIMITS.name) errors.name = "invalid";
  if (!fields.email || fields.email.length > LIMITS.email || !EMAIL_PATTERN.test(fields.email))
    errors.email = "invalid";
  if (!fields.subject || fields.subject.length > LIMITS.subject) errors.subject = "invalid";
  if (fields.message.length < LIMITS.messageMin || fields.message.length > LIMITS.message)
    errors.message = "invalid";
  return { fields, errors };
}

const sha256 = (text) => createHash("sha256").update(text).digest("hex");

/** Strips characters that could break out of an email header. */
const headerSafe = (text) => text.replace(/[\r\n]+/g, " ").slice(0, 200);

export function buildEmail({ fields, from, to, ip }) {
  return {
    from,
    to,
    replyTo: fields.email,
    subject: `[alibacelonia.dev] ${headerSafe(fields.subject)}`,
    text: [
      `From: ${headerSafe(fields.name)} <${fields.email}>`,
      `Subject: ${fields.subject}`,
      "",
      fields.message,
      "",
      "—",
      `Sent from the alibacelonia.dev contact form. Reply to answer ${fields.name} directly.`,
      `Client IP hash: ${sha256(ip).slice(0, 12)}`,
    ].join("\n"),
  };
}

/**
 * Handles one POST /contact request.
 *
 * deps:
 *   config        { allowedOrigins, from, to, ipLimitPerHour, dailyLimit, duplicateWindowHours }
 *   now()         epoch milliseconds
 *   turnstileSecret()  resolves the Turnstile secret (cached by the caller)
 *   fetch         global fetch (for Turnstile siteverify)
 *   counter(key, ttlSeconds)   atomically increments and returns the new count
 *   claim(key, ttlSeconds)     stores key if absent; resolves false when it already exists
 *   release(key)  removes a claimed key (so a failed send can be retried)
 *   send(email)   sends the email
 *   log(event, data)
 */
export async function handleContact(event, deps) {
  const { config } = deps;
  const origin = event.headers?.origin ?? event.headers?.Origin ?? "";
  const allowed = config.allowedOrigins.includes(origin);
  const respond = (statusCode, body) => ({
    statusCode,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...(allowed ? { "access-control-allow-origin": origin, vary: "Origin" } : {}),
    },
    body: JSON.stringify(body),
  });
  const reject = (statusCode, code, message) => respond(statusCode, { ok: false, code, message });

  if (!allowed) return reject(403, "origin", "Requests from this origin are not accepted.");

  const raw = event.isBase64Encoded
    ? Buffer.from(event.body ?? "", "base64").toString("utf8")
    : (event.body ?? "");
  if (Buffer.byteLength(raw, "utf8") > LIMITS.body)
    return reject(413, "too_large", "The message is too long.");

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return reject(400, "bad_json", "The request could not be read.");
  }

  // Honeypot: pretend success so bots learn nothing.
  if (typeof input?._gotcha === "string" && input._gotcha.trim()) {
    deps.log("honeypot", {});
    return respond(200, { ok: true });
  }

  const { fields, errors } = validate(input);
  if (Object.keys(errors).length)
    return reject(422, "invalid", "Some fields are missing or invalid.");

  const ip = event.requestContext?.http?.sourceIp ?? "unknown";
  const token = typeof input.turnstileToken === "string" ? input.turnstileToken : "";
  if (!token) return reject(400, "challenge", "Please complete the verification check.");

  const verification = await deps
    .fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: await deps.turnstileSecret(),
        response: token,
        remoteip: ip,
      }),
    })
    .then((response) => response.json())
    .catch(() => null);
  if (!verification?.success) {
    deps.log("turnstile_failed", { codes: verification?.["error-codes"] ?? ["unreachable"] });
    return reject(400, "challenge", "The verification check failed. Please try again.");
  }

  const nowMs = deps.now();
  const hour = Math.floor(nowMs / 3_600_000);
  const day = Math.floor(nowMs / 86_400_000);
  const nowSec = Math.floor(nowMs / 1000);
  const ipHash = sha256(`contact:${ip}`);

  const perIp = await deps.counter(`ip#${ipHash}#${hour}`, nowSec + 2 * 3600);
  if (perIp > config.ipLimitPerHour)
    return reject(429, "rate_limited", "Too many messages. Please try again in an hour.");

  const fingerprint = sha256(
    `${fields.email.toLowerCase()}\n${fields.message.replace(/\s+/g, " ").toLowerCase()}`,
  );
  const fresh = await deps.claim(`dup#${fingerprint}`, nowSec + config.duplicateWindowHours * 3600);
  if (!fresh) return reject(409, "duplicate", "This message was already sent.");

  const today = await deps.counter(`day#${day}`, nowSec + 2 * 86_400);
  if (today > config.dailyLimit)
    return reject(
      429,
      "daily_quota",
      "The form has reached today's limit. Please email directly instead.",
    );

  try {
    await deps.send(buildEmail({ fields, from: config.from, to: config.to, ip }));
  } catch (error) {
    deps.log("send_failed", { name: error?.name });
    await deps.release(`dup#${fingerprint}`).catch(() => {});
    return reject(502, "send_failed", "The message couldn't be delivered. Please email directly.");
  }
  deps.log("sent", {});
  return respond(200, { ok: true });
}

import { buildEmail, handleContact } from "../infra/lambda/contact/contact.mjs";

const ORIGIN = "https://alibacelonia.dev";
const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Project enquiry",
  message: "I would like to build an analytics engine.",
  turnstileToken: "token",
  _gotcha: "",
};

function setup(overrides: { turnstile?: boolean; send?: () => Promise<void> } = {}) {
  const store = new Map<string, number>();
  const sent: unknown[] = [];
  const deps = {
    config: {
      allowedOrigins: [ORIGIN],
      from: "noreply@alibacelonia.dev",
      to: "owner@example.com",
      ipLimitPerHour: 2,
      dailyLimit: 3,
      duplicateWindowHours: 24,
    },
    now: () => Date.UTC(2026, 9, 24, 10),
    turnstileSecret: async () => "secret",
    fetch: vi.fn(async () => ({
      json: async () => ({ success: overrides.turnstile ?? true }),
    })),
    counter: async (key: string) => {
      store.set(key, (store.get(key) ?? 0) + 1);
      return store.get(key)!;
    },
    claim: async (key: string) => {
      if (store.has(key)) return false;
      store.set(key, 1);
      return true;
    },
    release: async (key: string) => {
      store.delete(key);
    },
    send:
      overrides.send ??
      (async (email: unknown) => {
        sent.push(email);
      }),
    log: () => {},
  };
  return { deps, sent };
}

const request = (body: unknown, ip = "203.0.113.7", origin = ORIGIN) => ({
  headers: { origin },
  body: JSON.stringify(body),
  requestContext: { http: { sourceIp: ip } },
});

const status = async (event: unknown, deps: unknown) => {
  const res = await handleContact(event, deps);
  return { code: res.statusCode, body: JSON.parse(res.body), headers: res.headers };
};

describe("contact Lambda", () => {
  it("verifies Turnstile and sends one email with Reply-To set to the visitor", async () => {
    const { deps, sent } = setup();
    const res = await status(request({ ...valid, message: "Line one\nLine two is here." }), deps);
    expect(res.code).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe(ORIGIN);
    expect(deps.fetch).toHaveBeenCalledOnce();
    expect(sent).toEqual([
      expect.objectContaining({
        from: "noreply@alibacelonia.dev",
        to: "owner@example.com",
        replyTo: "ada@example.com",
        subject: "[alibacelonia.dev] Project enquiry",
      }),
    ]);
  });

  it("rejects other origins, invalid fields and failed challenges without sending", async () => {
    const { deps, sent } = setup();
    expect((await status(request(valid, undefined, "https://evil.example"), deps)).code).toBe(403);
    expect((await status(request({ ...valid, email: "nope" }), deps)).code).toBe(422);
    expect((await status(request({ ...valid, turnstileToken: "" }), deps)).code).toBe(400);
    const failing = setup({ turnstile: false });
    expect((await status(request(valid), failing.deps)).body.code).toBe("challenge");
    expect(sent).toHaveLength(0);
  });

  it("accepts the honeypot silently without sending", async () => {
    const { deps, sent } = setup();
    expect((await status(request({ ...valid, _gotcha: "bot" }), deps)).code).toBe(200);
    expect(sent).toHaveLength(0);
  });

  it("blocks duplicates, per-IP bursts and the daily quota", async () => {
    const { deps } = setup();
    expect((await status(request(valid), deps)).code).toBe(200);
    expect((await status(request(valid), deps)).body.code).toBe("duplicate");
    // The third request from the same IP this hour exceeds the limit of 2.
    expect(
      (await status(request({ ...valid, message: "A different message." }), deps)).body.code,
    ).toBe("rate_limited");
    // Daily quota (3) counts accepted, non-duplicate messages across IPs.
    for (const [i, ip] of ["198.51.100.1", "198.51.100.2"].entries()) {
      expect(
        (await status(request({ ...valid, message: `Message number ${i}.` }, ip), deps)).code,
      ).toBe(200);
    }
    expect(
      (await status(request({ ...valid, message: "One more message." }, "198.51.100.3"), deps)).body
        .code,
    ).toBe("daily_quota");
  });

  it("frees the duplicate key when sending fails so the visitor can retry", async () => {
    let fail = true;
    const { deps } = setup({
      send: async () => {
        if (fail) throw new Error("ses down");
      },
    });
    expect((await status(request(valid), deps)).code).toBe(502);
    fail = false;
    expect((await status(request(valid, "198.51.100.9"), deps)).code).toBe(200);
  });

  it("keeps header injection out of the subject", () => {
    const email = buildEmail({
      fields: {
        name: "A\r\nBcc: x@y.z",
        email: "a@b.co",
        subject: "Hi\r\nBcc: x@y.z",
        message: "m",
      },
      from: "f@a.b",
      to: "t@a.b",
      ip: "1.1.1.1",
    });
    expect(email.subject).not.toMatch(/[\r\n]/);
  });
});

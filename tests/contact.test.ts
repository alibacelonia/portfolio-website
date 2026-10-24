import { isValidEmail, submitToContactApi, validateContact } from "@/lib/contact";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Hello",
  message: "I would like to talk about a project.",
};

describe("validateContact", () => {
  it("accepts a complete message", () => {
    expect(validateContact(valid)).toEqual({});
  });

  it("requires every field", () => {
    const errors = validateContact({ name: " ", email: "", subject: "", message: "" });
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name", "subject"]);
  });

  it("checks email format and message length", () => {
    expect(validateContact({ ...valid, email: "ada@" }).email).toBeDefined();
    expect(validateContact({ ...valid, message: "short" }).message).toMatch(/at least/);
    expect(validateContact({ ...valid, message: "x".repeat(5001) }).message).toMatch(/under/);
  });

  it.each([
    ["ada@example.com", true],
    ["a.b+c@sub.example.co", true],
    ["ada@example", false],
    ["ada example@x.com", false],
    ["@example.com", false],
  ])("isValidEmail(%s) = %s", (email, expected) => {
    expect(isValidEmail(email)).toBe(expected);
  });
});

describe("submitToContactApi", () => {
  const send = (fetchMock: typeof fetch) =>
    submitToContactApi(
      "https://api.example.com/contact",
      { ...valid, _gotcha: "", turnstileToken: "tok" },
      fetchMock,
    );

  it("posts trimmed JSON with the Turnstile token", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    expect(await send(fetchMock as unknown as typeof fetch)).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.example.com/contact");
    expect(JSON.parse(init.body as string)).toMatchObject({ turnstileToken: "tok", _gotcha: "" });
  });

  it("maps API error codes and network failures to readable messages", async () => {
    const rejected = vi.fn(
      async () => new Response(JSON.stringify({ code: "duplicate" }), { status: 409 }),
    );
    expect(await send(rejected as unknown as typeof fetch)).toEqual({
      ok: false,
      message: "This message was already sent.",
    });
    const offline = vi.fn().mockRejectedValue(new TypeError("offline"));
    expect((await send(offline)).ok).toBe(false);
  });
});

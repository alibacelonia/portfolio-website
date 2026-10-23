import { buildMailto, isValidEmail, submitToFormspree, validateContact } from "@/lib/contact";

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

describe("buildMailto", () => {
  it("encodes subject and body without plus signs", () => {
    const url = buildMailto("me@example.com", valid);
    expect(url.startsWith("mailto:me@example.com?subject=Hello&body=")).toBe(true);
    expect(url).not.toContain("+");
    expect(decodeURIComponent(url)).toContain("— Ada Lovelace <ada@example.com>");
  });
});

describe("submitToFormspree", () => {
  it("posts JSON to the form endpoint and reports success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    const result = await submitToFormspree("abcd1234", { ...valid, _gotcha: "" }, fetchMock);
    expect(result).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://formspree.io/f/abcd1234");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toMatchObject({ email: "ada@example.com", _gotcha: "" });
  });

  it("surfaces provider error messages", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ errors: [{ message: "Form not found" }] }), { status: 404 }),
      );
    expect(await submitToFormspree("abcd1234", { ...valid, _gotcha: "" }, fetchMock)).toEqual({
      ok: false,
      message: "Form not found",
    });
  });

  it("handles network failures", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    const result = await submitToFormspree("abcd1234", { ...valid, _gotcha: "" }, fetchMock);
    expect(result.ok).toBe(false);
  });
});

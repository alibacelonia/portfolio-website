import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/sections/ContactForm";

const clock = () => {
  let t = 0;
  return { now: () => t, advance: (ms: number) => (t += ms) };
};

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Name/), "Ada Lovelace");
  await user.type(screen.getByLabelText(/^Email/), "ada@example.com");
  await user.type(screen.getByLabelText(/^Subject/), "Project");
  await user.type(screen.getByLabelText(/^Message/), "I would like to discuss a project.");
}

describe("ContactForm", () => {
  it("labels every field and marks them required", () => {
    render(<ContactForm apiUrl="https://api.example.com/contact" turnstileSiteKey={null} />);
    for (const label of [/^Name/, /^Email/, /^Subject/, /^Message/]) {
      expect(screen.getByLabelText(label)).toBeRequired();
    }
  });

  it("shows errors, marks fields invalid and focuses the first invalid field", async () => {
    const user = userEvent.setup();
    render(<ContactForm apiUrl="https://api.example.com/contact" turnstileSiteKey={null} />);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    const name = screen.getByLabelText(/^Name/);
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Please enter your name.");
    expect(name).toHaveFocus();
    expect(screen.getByText("Please enter your email address.")).toBeInTheDocument();
  });

  it("validates email format on blur", async () => {
    const user = userEvent.setup();
    render(<ContactForm apiUrl="https://api.example.com/contact" turnstileSiteKey={null} />);
    await user.type(screen.getByLabelText(/^Email/), "ada@");
    await user.tab();
    expect(screen.getByText(/valid email address/)).toBeInTheDocument();
  });

  it("submits to the API, shows a loading state, then confirms", async () => {
    const user = userEvent.setup();
    const c = clock();
    let resolve: (r: Response) => void = () => {};
    const fetchImpl = vi.fn(() => new Promise<Response>((r) => (resolve = r)));
    render(
      <ContactForm
        apiUrl="https://api.example.com/contact"
        turnstileSiteKey={null}
        fetchImpl={fetchImpl}
        now={c.now}
      />,
    );
    await fill(user);
    c.advance(5000);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();
    resolve(new Response("{}", { status: 200 }));

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Message sent. Thank you, Ada Lovelace.");
    expect(status).toHaveFocus();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("shows an error and keeps the message when sending fails", async () => {
    const user = userEvent.setup();
    const c = clock();
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("offline"));
    render(
      <ContactForm
        apiUrl="https://api.example.com/contact"
        turnstileSiteKey={null}
        fetchImpl={fetchImpl}
        now={c.now}
      />,
    );
    await fill(user);
    c.advance(5000);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/wasn.t sent/);
    expect(screen.queryByText(/Message sent/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^Name/)).toHaveValue("Ada Lovelace");
  });

  it("blocks submissions that are faster than a person could type", async () => {
    const user = userEvent.setup();
    const fetchImpl = vi.fn();
    render(
      <ContactForm
        apiUrl="https://api.example.com/contact"
        turnstileSiteKey={null}
        fetchImpl={fetchImpl}
        now={() => 0}
      />,
    );
    await fill(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/quicker than expected/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("says sending is unavailable, without calling anything, when no API is set", async () => {
    const user = userEvent.setup();
    const c = clock();
    const fetchImpl = vi.fn();
    render(<ContactForm apiUrl={null} turnstileSiteKey={null} fetchImpl={fetchImpl} now={c.now} />);
    await fill(user);
    c.advance(5000);
    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/isn.t available/);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /try again/i })).toBeEnabled();
  });

  it("shows the API's reason when it rejects the message", async () => {
    const user = userEvent.setup();
    const c = clock();
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ ok: false, code: "rate_limited" }), { status: 429 }),
    );
    render(
      <ContactForm
        apiUrl="https://api.example.com/contact"
        turnstileSiteKey={null}
        fetchImpl={fetchImpl as unknown as typeof fetch}
        now={c.now}
      />,
    );
    await fill(user);
    c.advance(5000);
    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/Too many messages/);
  });
});

describe("ContactForm with the contact API", () => {
  afterEach(() => {
    delete window.turnstile;
  });

  it("requires the Turnstile check, then posts the token to the API", async () => {
    let solve: (token: string) => void = () => {};
    window.turnstile = {
      render: (_el, options) => {
        solve = options.callback;
        return "widget";
      },
      remove: vi.fn(),
    };
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    const c = clock();
    const user = userEvent.setup();
    render(
      <ContactForm
        apiUrl="https://api.example.com/contact"
        turnstileSiteKey="site-key"
        fetchImpl={fetchImpl as unknown as typeof fetch}
        now={c.now}
      />,
    );
    await fill(user);
    c.advance(5000);
    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/verification check/);
    expect(fetchImpl).not.toHaveBeenCalled();

    solve("tok-123");
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByText(/Message sent/)).toBeInTheDocument();
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.example.com/contact");
    expect(JSON.parse(init.body as string)).toMatchObject({ turnstileToken: "tok-123" });
  });
});

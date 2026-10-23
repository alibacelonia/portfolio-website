import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmailLink } from "@/components/ui/EmailLink";
import { mediaState } from "./setup";

const email = "hello@example.com";

afterEach(() => vi.restoreAllMocks());

it("copies the address and announces success on desktop", async () => {
  const user = userEvent.setup();
  const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
  mediaState.matches.add("(min-width: 1024px)");
  render(<EmailLink email={email} />);

  await user.click(screen.getByRole("link", { name: "email" }));
  expect(writeText).toHaveBeenCalledWith(email);
  expect(screen.getByRole("link", { name: "copied!" })).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Email address copied to clipboard.");
});

it("preserves the native mailto action on mobile without accessing the clipboard", () => {
  userEvent.setup();
  const writeText = vi.spyOn(navigator.clipboard, "writeText");
  render(<EmailLink email={email} />);
  const link = screen.getByRole("link", { name: "email" });
  expect(link).toHaveAttribute("href", `mailto:${email}`);

  let prevented: boolean | undefined;
  // Observe the component's choice, then prevent JSDOM from opening an external mail client.
  document.addEventListener(
    "click",
    (event) => {
      prevented = event.defaultPrevented;
      event.preventDefault();
    },
    { once: true },
  );
  fireEvent.click(link);
  expect(prevented).toBe(false);
  expect(writeText).not.toHaveBeenCalled();
});

it("shows the address for manual copying when clipboard access fails", async () => {
  const user = userEvent.setup();
  vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("Permission denied"));
  mediaState.matches.add("(min-width: 1024px)");
  render(<EmailLink email={email} />);

  await user.click(screen.getByRole("link", { name: "email" }));
  expect(screen.getByRole("status")).toHaveTextContent(`You can copy this address: ${email}`);
});

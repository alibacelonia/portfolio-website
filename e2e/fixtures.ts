import { test as base, type BrowserContext, type Page } from "@playwright/test";

/**
 * CI builds with the real repository variables (CAL_LINK, TURNSTILE_SITE_KEY, ...), so the site
 * embeds third-party services. Tests never load them: they are slow, change without notice and
 * their markup isn't ours to fix. Cal.com gets a blank page; Turnstile a no-op widget.
 */
export async function stubThirdParty(context: BrowserContext) {
  await context.route(/^https:\/\/(app\.)?cal\.com\//, (route) =>
    route.fulfill(
      route.request().url().endsWith("/embed/embed.js")
        ? { contentType: "text/javascript", body: CAL_EMBED_STUB }
        : {
            contentType: "text/html",
            body: '<!doctype html><html lang="en"><title>Booking</title><p>Booking calendar</p></html>',
          },
    ),
  );
  await context.route(/^https:\/\/challenges\.cloudflare\.com\//, (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: 'window.turnstile = { render: () => "stub", remove: () => {} };',
    }),
  );
}

/**
 * Stand-in for Cal.com's embed.js: replays the queued calls like the real script, rendering an
 * iframe for "inline" and reporting "linkReady" once it loads. Like the real script, it also
 * takes namespaces initialised later (a fresh calendar after "Book another time").
 */
const CAL_EMBED_STUB = `(() => {
  const cal = window.Cal;
  const run = (args) => {
    const [action, options] = Array.from(args);
    if (action === "inline") {
      const frame = document.createElement("iframe");
      frame.src = "https://app.cal.com/" + options.calLink;
      frame.style.cssText = "width:100%;height:560px;border:0";
      frame.addEventListener("load", () => cal.ready?.forEach((callback) => callback()));
      options.elementOrSelector.appendChild(frame);
    }
    if (action === "on" && options.action === "linkReady") (cal.ready ??= []).push(options.callback);
  };
  for (const [name, api] of Object.entries(cal.ns)) {
    Array.from(api.q).forEach(run);
    cal.ns[name] = (...args) => run(args);
  }
  window.Cal = Object.assign(
    (...args) => {
      if (args[0] === "init" && typeof args[1] === "string") cal.ns[args[1]] = (...a) => run(a);
    },
    { ns: cal.ns, q: [], loaded: true, ready: cal.ready },
  );
})();`;

/** Shows the contact form whether or not the build has a booking tab (NEXT_PUBLIC_CAL_LINK). */
export async function openMessageTab(page: Page) {
  const tab = page.getByRole("tab", { name: "Send a message" });
  if (await tab.count()) await tab.click();
}

export const test = base.extend({
  context: async ({ context }, provide) => {
    await stubThirdParty(context);
    await provide(context);
  },
});

export { expect } from "@playwright/test";

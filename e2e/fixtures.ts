import { test as base, type BrowserContext, type Page } from "@playwright/test";

/**
 * CI builds with the real repository variables (CAL_LINK, TURNSTILE_SITE_KEY, ...), so the site
 * embeds third-party services. Tests never load them: they are slow, change without notice and
 * their markup isn't ours to fix. Cal.com gets a blank page; Turnstile a no-op widget.
 */
export async function stubThirdParty(context: BrowserContext) {
  await context.route(/^https:\/\/(app\.)?cal\.com\//, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><html lang="en"><title>Booking</title><p>Booking calendar</p></html>',
    }),
  );
  await context.route(/^https:\/\/challenges\.cloudflare\.com\//, (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: 'window.turnstile = { render: () => "stub", remove: () => {} };',
    }),
  );
}

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

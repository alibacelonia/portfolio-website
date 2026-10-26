import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { test, expect, openMessageTab } from "./fixtures";
import { THEME_COLORS, THEME_STORAGE_KEY } from "../src/lib/theme";

/** Starts a page in the light theme once (the site defaults to dark); later toggles still persist. */
async function startLight(page: Page) {
  await page.addInitScript((key) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, "light");
  }, THEME_STORAGE_KEY);
}

for (const theme of ["light", "dark"] as const) {
  test(`glass surfaces and interaction states follow ${theme} mode`, async ({ page }, testInfo) => {
    await page.emulateMedia({
      colorScheme: theme === "light" ? "dark" : "light",
      reducedMotion: "reduce",
    });
    await page.addInitScript(({ key, theme }) => localStorage.setItem(key, theme), {
      key: THEME_STORAGE_KEY,
      theme,
    });
    await page.goto("/");
    const root = page.locator("html");
    await expect(root).toHaveAttribute("data-theme", theme);
    await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute(
      "content",
      THEME_COLORS[theme],
    );
    const fg = theme === "light" ? "rgb(24, 24, 27)" : "rgb(244, 244, 245)";
    await expect(page.locator(".case-stage p").first()).toHaveCSS("color", fg);
    await expect(page.locator(".project-cursor-disc")).toHaveCSS("color", fg);
    await expect(page.locator("header .dock")).toHaveAttribute("data-dock", "glass");
    await expect(page.locator("header .dock")).toHaveCSS("backdrop-filter", /blur/);
    // Floating navigation must remain readable even over the opposite theme's brightest/darkest art.
    await page.evaluate(() => {
      const backdrop = document.createElement("div");
      backdrop.id = "contrast-backdrop";
      backdrop.style.cssText =
        "position:fixed;inset:0;z-index:49;background:var(--fg);pointer-events:none";
      document.body.appendChild(backdrop);
    });
    if (testInfo.project.name === "mobile") {
      await page.getByRole("button", { name: /Open menu$/ }).click();
      await expect(page.locator("body > .dock")).toHaveCSS("backdrop-filter", /blur/);
    }
    const navigationContrast = await new AxeBuilder({ page })
      .include("header")
      .include(testInfo.project.name === "mobile" ? "body > .dock" : "header .dock")
      .withRules(["color-contrast"])
      .analyze();
    expect(navigationContrast.violations).toEqual([]);
    if (testInfo.project.name === "mobile")
      await page.getByRole("button", { name: "Close navigation" }).click();
    await page.locator("#contrast-backdrop").evaluate((el) => el.remove());
    await page.locator(".case-stage").first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`projects-${theme}.png`) });

    await page.goto("/connect/");
    await openMessageTab(page);
    const intent = page.getByRole("button", { name: "Project", exact: true });
    await intent.click();
    await expect(intent).toHaveAttribute("aria-pressed", "true");
    await expect(intent).toHaveCSS("color", fg);
    const input = page.getByRole("textbox", { name: "Name", exact: true });
    await input.focus();
    await expect(input).toHaveCSS("outline-style", "solid");
    await expect(input).toHaveCSS("color", fg);
    await expect(input).toHaveCSS(
      "border-top-color",
      theme === "light" ? "rgb(118, 118, 128)" : "rgb(104, 104, 115)",
    );
    if (testInfo.project.name === "desktop") {
      await input.hover();
      await expect(input).toHaveCSS(
        "border-top-color",
        theme === "light" ? "rgb(51, 92, 143)" : "rgb(169, 198, 238)",
      );
    }
    await page.getByRole("button", { name: "Send message", exact: true }).click();
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveCSS(
      "border-top-color",
      theme === "light" ? "rgb(180, 35, 24)" : "rgb(253, 162, 155)",
    );
    await page.screenshot({ path: testInfo.outputPath(`connect-${theme}.png`), fullPage: true });
  });
}

test("theme changes update already-mounted booking and spam-check widgets", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await startLight(page);
  await page.route(/^https:\/\/challenges\.cloudflare\.com\//, (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: `window.turnstile = {
      render: (el, options) => { el.dataset.widgetTheme = options.theme; return 'theme-test'; },
      remove: () => document.querySelectorAll('[data-widget-theme]').forEach(el => delete el.dataset.widgetTheme)
    };`,
    }),
  );
  await page.goto("/connect/");
  const booking = page.getByRole("tab", { name: "Book a call" });
  const hasBooking = await booking.count();
  if (hasBooking) {
    await expect(page.locator('iframe[src*="cal.com"]').first()).toBeAttached();
    await page
      .locator('iframe[src*="cal.com"]')
      .first()
      .evaluate((el) => el.setAttribute("data-original-calendar", "true"));
  }
  await openMessageTab(page);
  const widget = page.locator("[data-widget-theme]");
  const hasWidget = await widget.count();
  if (hasWidget) await expect(widget).toHaveAttribute("data-widget-theme", "light");
  // Fields and intent remain intact when a theme switch recreates third-party widgets.
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Theme visitor");
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: /Open menu$/ }).click();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute(
    "content",
    THEME_COLORS.dark,
  );
  await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveValue(
    "Theme visitor",
  );
  if (hasWidget) await expect(widget).toHaveAttribute("data-widget-theme", "dark");
  if (hasBooking) await expect(page.locator("[data-original-calendar]")).toHaveCount(0);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute(
    "content",
    THEME_COLORS.dark,
  );
});

test("glass has opaque reduced-transparency and forced-color fallbacks", async ({
  page,
  context,
}) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await startLight(page);
  await page.goto("/connect/");
  const session = await context.newCDPSession(page);
  await session.send("Emulation.setEmulatedMedia", {
    features: [
      { name: "prefers-color-scheme", value: "light" },
      { name: "prefers-reduced-transparency", value: "reduce" },
    ],
  });
  await expect(page.locator("header .dock")).toHaveCSS("backdrop-filter", "none");
  await expect(page.locator("header .dock")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await session.detach();
  await page.emulateMedia({ forcedColors: "active" });
  await expect(page.locator("header .dock")).toHaveCSS("backdrop-filter", "none");
  await expect(page.locator("header .dock")).toHaveCSS("box-shadow", "none");
  await openMessageTab(page);
  for (const selector of [".section-panel", ".glass-control", ".glass-field"]) {
    const surface = page.locator(selector).first();
    await expect(surface).toHaveCSS("backdrop-filter", "none");
    await expect(surface).toHaveCSS("box-shadow", "none");
  }
});

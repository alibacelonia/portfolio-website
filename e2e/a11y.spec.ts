import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openMessageTab, stubThirdParty } from "./fixtures";
import { projects } from "../src/data/projects";
import { THEME_STORAGE_KEY } from "../src/lib/theme";

const paths = [
  "/",
  "/connect/",
  "/projects/",
  ...projects.map(({ id }) => `/projects/${id}/`),
  "/404.html",
];

for (const path of paths) {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`has no detectable accessibility violations: ${path} (${colorScheme} theme)`, async ({
      browser,
    }, testInfo) => {
      const context = await browser.newContext({
        ...testInfo.project.use,
        colorScheme,
        reducedMotion: "reduce",
      });
      await stubThirdParty(context);
      const page = await context.newPage();
      await context.addInitScript(({ key, theme }) => window.localStorage.setItem(key, theme), {
        key: THEME_STORAGE_KEY,
        theme: colorScheme,
      });
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", colorScheme);
      if (testInfo.project.name === "mobile" && path === "/") {
        await page.getByRole("button", { name: /Open menu$/ }).click();
        await expect(page.getByRole("navigation", { name: "Sections" })).toBeVisible();
      }
      // Reveal everything so contrast is checked on final colors, not mid-transition.
      await page.evaluate(() =>
        document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
          el.dataset.revealed = "true";
        }),
      );
      const scan = async () => {
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
          // The booking embed is Cal.com's markup, not ours (stubbed in tests anyway).
          .exclude('iframe[src*="cal.com"]')
          .analyze();
        return results.violations.map(
          (v) =>
            `${v.id}: ${v.nodes
              .map((n) => n.target.join(" "))
              .slice(0, 3)
              .join(", ")}`,
        );
      };
      const summary = await scan();
      // With a booking tab the form starts hidden; check it too.
      if (path === "/connect/" && (await page.getByRole("tab").count())) {
        await openMessageTab(page);
        summary.push(...(await scan()));
      }
      if (path === "/connect/") {
        await openMessageTab(page);
        await page.getByRole("button", { name: "Send message", exact: true }).click();
        summary.push(...(await scan()));
      }
      expect(summary).toEqual([]);
      await context.close();
    });
  }
}

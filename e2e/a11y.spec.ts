import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const paths = ["/", "/projects/website-portfolio/"];

for (const path of paths) {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`has no detectable accessibility violations: ${path} (${colorScheme})`, async ({
      browser,
    }, testInfo) => {
      const context = await browser.newContext({
        ...testInfo.project.use,
        colorScheme,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", colorScheme);
      // Reveal everything so contrast is checked on final colors, not mid-transition.
      await page.evaluate(() =>
        document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
          el.dataset.revealed = "true";
        }),
      );
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        .analyze();
      const summary = results.violations.map(
        (v) =>
          `${v.id}: ${v.nodes
            .map((n) => n.target.join(" "))
            .slice(0, 3)
            .join(", ")}`,
      );
      expect(summary).toEqual([]);
      await context.close();
    });
  }
}

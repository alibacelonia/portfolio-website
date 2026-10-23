// Full-page screenshots of the static export at every supported width, in both themes.
// Usage: npm run build && npm run preview  (in another shell)  then
//        node scripts/screenshots.mjs [output-dir] [base-url]
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const outDir = process.argv[2] ?? "screenshots";
const baseUrl = process.argv[3] ?? "http://localhost:4173/";
const widths = [320, 375, 390, 768, 1024, 1280, 1440, 1920];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
let failures = 0;

for (const colorScheme of ["light", "dark"]) {
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      colorScheme,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 0) failures++;
    await page.screenshot({ path: `${outDir}/${colorScheme}-${width}.png`, fullPage: true });
    console.log(`${colorScheme.padEnd(5)} ${String(width).padStart(4)}px  overflow=${overflow}`);
    await context.close();
  }
}

await browser.close();
process.exitCode = failures ? 1 : 0;

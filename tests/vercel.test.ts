import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// vercel.json mirrors the CloudFront response-headers policy (infra/terraform/cloudfront.tf and the
// CSP built in main.tf), so a site deployed to Vercel gets the same protection.
const config = JSON.parse(readFileSync(resolve(process.cwd(), "vercel.json"), "utf8")) as {
  framework: string;
  headers: { source: string; headers: { key: string; value: string }[] }[];
};
const headers = Object.fromEntries(
  config.headers.find((rule) => rule.source === "/(.*)")!.headers.map((h) => [h.key, h.value]),
);
const terraformCsp = readFileSync(
  resolve(process.cwd(), "infra/terraform/variables.tf"),
  "utf8",
).match(/variable "content_security_policy"[\s\S]*?default\s*=\s*"([^"]+)"/)![1]!;

describe("vercel.json", () => {
  it("builds the Next.js static export", () => {
    expect(config.framework).toBe("nextjs");
  });

  it("sends the same security headers as CloudFront", () => {
    expect(Object.keys(headers).sort()).toEqual(
      [
        "Content-Security-Policy",
        "Permissions-Policy",
        "Referrer-Policy",
        "Strict-Transport-Security",
        "X-Content-Type-Options",
        "X-Frame-Options",
      ].sort(),
    );
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Strict-Transport-Security"]).toContain("max-age=63072000");
  });

  it("keeps every CloudFront CSP directive and allows Turnstile and Cal.com", () => {
    const csp = headers["Content-Security-Policy"]!;
    const directives = (policy: string) => policy.split(";").map((d) => d.trim().split(" ")[0]);
    expect(directives(csp)).toEqual(expect.arrayContaining(directives(terraformCsp)));
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toMatch(
      /script-src [^;]*https:\/\/challenges\.cloudflare\.com[^;]*https:\/\/app\.cal\.com/,
    );
    expect(csp).toMatch(/frame-src [^;]*https:\/\/app\.cal\.com[^;]*https:\/\/cal\.com/);
  });
});

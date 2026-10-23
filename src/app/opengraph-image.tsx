import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const dynamic = "force-static";
export const alt = `${site.name} — ${site.roles.join(" · ")}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontDir = join(process.cwd(), "node_modules/geist/dist/fonts");

const stages = ["Code", "Build", "Deploy", "Monitor"];
const dots = ["#A9C4E8", "#B4CDB6", "#C9BFE6"];

export default async function OpengraphImage() {
  const [regular, semibold, mono] = await Promise.all([
    readFile(join(fontDir, "geist-sans/Geist-Regular.ttf")),
    readFile(join(fontDir, "geist-sans/Geist-SemiBold.ttf")),
    readFile(join(fontDir, "geist-mono/GeistMono-Regular.ttf")),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#FAFBFC",
        color: "#111827",
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", fontSize: 22, fontWeight: 600, letterSpacing: 4 }}>
        {site.brand}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 64, fontWeight: 600, letterSpacing: -1.5, lineHeight: 1.1 }}>
          {site.name}
        </div>
        <div style={{ display: "flex", gap: 28, marginTop: 24, fontSize: 28, color: "#334155" }}>
          {site.roles.map((role, index) => (
            <div key={role} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: dots[index] }} />
              {role}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #E5E7EB",
          paddingTop: 28,
          fontFamily: "Geist Mono",
          fontSize: 20,
          color: "#64748B",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {stages.map((stage, index) => (
            <div key={stage} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {index > 0 ? <div style={{ width: 28, height: 1, background: "#D1D5DB" }} /> : null}
              <div
                style={{
                  display: "flex",
                  padding: "6px 14px",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  background: "#FFFFFF",
                  color: "#334155",
                }}
              >
                {stage}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex" }}>{new URL(site.url).host}</div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}

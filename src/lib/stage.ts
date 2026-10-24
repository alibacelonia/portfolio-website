import type { StageGradient } from "@/types/content";

/** CSS for a case card's gradient background. */
export function stageBackground({ angle, stops }: StageGradient): string {
  return `linear-gradient(${angle}deg, ${stops.map((s) => `${s.color} ${s.at}%`).join(", ")})`;
}

/** WCAG relative luminance of a #rrggbb color. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** The screenshot frame color: the gradient's second-lightest stop. */
export function stageFrame({ stops }: StageGradient): string {
  const byLightness = [...stops].sort((a, b) => luminance(b.color) - luminance(a.color));
  return (byLightness[1] ?? byLightness[0])!.color;
}

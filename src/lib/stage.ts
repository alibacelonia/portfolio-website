import type { StageGradient } from "@/types/content";

/** Case cards without a screenshot all use this neutral grey (owner rule, 2026-10-25). */
export const NEUTRAL_STAGE: StageGradient = {
  angle: 145,
  stops: [
    { color: "#1f2937", at: 0 },
    { color: "#4b5563", at: 40 },
    { color: "#9ca3af", at: 75 },
    { color: "#d1d5db", at: 100 },
  ],
};

/**
 * The gradient a case card shows: its own (chosen to complement its screenshot) when it has a
 * screenshot, otherwise the neutral grey.
 */
export function stageGradientFor(study: {
  screenshot?: unknown;
  stageGradient?: StageGradient;
}): StageGradient {
  return study.screenshot && study.stageGradient ? study.stageGradient : NEUTRAL_STAGE;
}

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

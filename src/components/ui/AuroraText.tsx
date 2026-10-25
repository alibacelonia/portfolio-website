/**
 * Brighter versions of Magic UI's aurora defaults (pink, purple, blue, sky), each at least 5.9:1
 * on the dark background (the original purple, #7928CA, is 2.75:1).
 */
const AURORA_COLORS = ["#ff4fa3", "#b36bff", "#4f9dff", "#38bdf8"];

/**
 * Aurora text after Magic UI: a gradient clipped to the letters that drifts through its colors
 * while the word gently sways. It stays real text (read and copied once), static with reduced
 * motion and a solid color in forced-colors mode.
 */
export function AuroraText({ children }: { children: string }) {
  return (
    <span
      className="aurora-text"
      style={{
        backgroundImage: `linear-gradient(135deg, ${[...AURORA_COLORS, AURORA_COLORS[0]].join(", ")})`,
      }}
    >
      {children}
    </span>
  );
}

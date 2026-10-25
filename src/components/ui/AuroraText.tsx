/**
 * Aurora text after Magic UI: a gradient clipped to the letters that drifts through its colors,
 * on a still word (Magic UI's sway is left out). It stays real text (read and copied once), static with reduced
 * motion and a solid color in forced-colors mode.
 */
export function AuroraText({ children }: { children: string }) {
  return (
    <span
      className="aurora-text"
      style={{
        // Colors come from the theme (--aurora-1…4 in globals.css), so light and dark each keep
        // enough contrast.
        backgroundImage:
          "linear-gradient(135deg, var(--aurora-1), var(--aurora-2), var(--aurora-3), var(--aurora-4), var(--aurora-1))",
      }}
    >
      {children}
    </span>
  );
}

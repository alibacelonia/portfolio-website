import { LOGO_PATH, LOGO_VIEWBOX } from "@/lib/brand";

/** Typographic A/B mark in the current text color. Decorative; label the surrounding link. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={LOGO_PATH} />
    </svg>
  );
}

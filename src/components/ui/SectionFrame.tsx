import type { ComponentPropsWithoutRef } from "react";

/** Shared section rails and decorative junctions; never intercepts input or hides content. */
export function SectionFrame({
  children,
  className = "",
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section {...props} className={`section-frame ${className}`}>
      <div aria-hidden="true" className="section-guides" />
      {children}
    </section>
  );
}

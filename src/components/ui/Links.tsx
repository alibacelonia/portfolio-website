import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
  children: ReactNode;
};

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-[background-color,border-color,color,transform] duration-200 ease-out-soft active:translate-y-px";

export const buttonStyles = {
  /** The page's one main action: solid foreground on the background (hero, Connect strip). */
  solid:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg transition-[background-color,transform] duration-200 ease-out-soft hover:bg-fg-soft active:translate-y-px forced-colors:border forced-colors:border-[LinkText]",
  primary: `${buttonBase} glass-control text-fg hover:border-blue-fg`,
  secondary: `${buttonBase} glass-control text-fg-soft hover:border-border-strong hover:text-fg`,
};

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: AnchorProps & { variant?: keyof typeof buttonStyles }) {
  return <a className={`${buttonStyles[variant]} ${className}`} {...props} />;
}

/** External link: new tab, no opener/referrer leakage, and a screen-reader hint. */
export function ExternalLink({ children, className = "", ...props }: AnchorProps) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-1 ${className}`}
      {...props}
    >
      {children}
      <ArrowUpRight
        aria-hidden="true"
        className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />{" "}
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

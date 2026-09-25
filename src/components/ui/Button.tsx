import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ripple } from "@/lib/interactions";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "positive"
  | "caution"
  | "danger"
  | "quiet"
  | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  /** Trailing arrow that nudges right on hover. */
  arrow?: boolean;
  /** Leading glyph, decorative. */
  icon?: ReactNode;
  /** "Start here" ring until the visitor's first click (useStartHint). */
  hint?: boolean;
};

// The one button. Variants are CSS (.btn-*) so they read the scene's
// tokens; the ripple is a transient GSAP flourish on pointer presses.
export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "quiet", size = "md", arrow, icon, hint, className, children, onClick, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-hint={hint ? "true" : undefined}
      className={cn("btn", `btn-${variant}`, size !== "md" && `btn-${size}`, className)}
      onClick={(e) => {
        ripple(e);
        onClick?.(e);
      }}
      {...rest}
    >
      {icon ? (
        <span aria-hidden className="-ml-0.5">
          {icon}
        </span>
      ) : null}
      {children}
      {arrow ? (
        <span aria-hidden className="btn-arrow">
          →
        </span>
      ) : null}
    </button>
  );
});

/** A link styled as a button (external CTAs, navigation). */
export function ButtonLink({
  href,
  variant = "quiet",
  size = "md",
  arrow,
  className,
  children,
  external,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  arrow?: boolean;
  className?: string;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      rel={external ? "noreferrer" : undefined}
      className={cn("btn", `btn-${variant}`, size !== "md" && `btn-${size}`, className)}
      onClick={ripple}
    >
      {children}
      {arrow ? (
        <span aria-hidden className="btn-arrow">
          {external ? "↗" : "→"}
        </span>
      ) : null}
    </a>
  );
}

/**
 * Small set of shared class-string helpers so every screen uses the same
 * buttons, cards, and form controls instead of each component inventing
 * its own spacing/border/shadow values.
 */

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-[15px] px-6 py-3",
};

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm shadow-primary/25 hover:shadow-md hover:shadow-primary/25 active:scale-[0.98]",
  secondary:
    "bg-foreground text-background hover:opacity-90 active:scale-[0.98]",
  outline:
    "border border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-muted",
  danger: "text-red-600 hover:text-red-700 hover:bg-red-50",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
) {
  return `${BUTTON_BASE} ${BUTTON_SIZES[size]} ${BUTTON_VARIANTS[variant]} ${className}`.trim();
}

export const cardClass = "rounded-2xl border border-border bg-card shadow-sm";

export const inputClass =
  "w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-neutral-400 transition focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring";

export const labelClass = "text-sm font-medium text-neutral-700";

export const sectionEyebrowClass =
  "text-xs font-semibold uppercase tracking-wider text-primary";

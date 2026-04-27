import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Optional small eyebrow above the title (e.g. "Mein System", "Verwaltung"). */
  eyebrow?: string;
  /** Use the accent (orange) eyebrow style instead of the muted one. */
  eyebrowAccent?: boolean;
  /** Main page title — rendered as h1. */
  title: string;
  /** Supporting description shown below the title. */
  description?: ReactNode;
  /** Right-aligned actions (buttons, filters, etc.). */
  actions?: ReactNode;
  className?: string;
}

/**
 * Page header used on every /app page.
 * Mirrors the section-header rhythm of the public landing pages
 * (eyebrow → headline → description) for visual consistency between
 * marketing and member/admin areas.
 */
export function PageHeader({
  eyebrow,
  eyebrowAccent = false,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-8 md:mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="space-y-3 max-w-3xl">
        {eyebrow && (
          <span className={eyebrowAccent ? "eyebrow-badge-accent" : "eyebrow-badge"}>
            {eyebrow}
          </span>
        )}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.15] text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 md:flex-shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}

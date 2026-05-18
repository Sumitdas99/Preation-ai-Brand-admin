import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  index: number;
  title: string;
  subtitle?: ReactNode;
  variant?: "light" | "dark";
  rightSlot?: ReactNode;
  className?: string;
}

export function SectionHeading({
  index,
  title,
  subtitle,
  variant = "light",
  rightSlot,
  className,
}: SectionHeadingProps) {
  const isDark = variant === "dark";
  return (
    <header
      className={cn(
        "flex items-center gap-3 border-b px-6 py-3.5",
        isDark
          ? "border-white/10 bg-white/[0.04]"
          : "border-border bg-accent/30",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          isDark
            ? "bg-white/10 text-white ring-1 ring-white/20"
            : "bg-[#0A1F44] text-white",
        )}
      >
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <h3
          className={cn(
            "text-xl font-semibold leading-none",
            isDark ? "text-white" : "text-slate-600",
          )}
        >
          {title}
        </h3>
        {subtitle ? (
          <p
            className={cn(
              "mt-1 text-xs font-bold leading-relaxed",
              isDark ? "text-white/70" : "text-foreground/70",
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {rightSlot}
    </header>
  );
}

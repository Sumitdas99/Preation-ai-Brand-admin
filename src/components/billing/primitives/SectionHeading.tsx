import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  index: number;
  title: string;
  subtitle?: ReactNode;
  variant?: "light" | "dark";
  className?: string;
}

export function SectionHeading({
  index,
  title,
  subtitle,
  variant = "light",
  className,
}: SectionHeadingProps) {
  const isDark = variant === "dark";
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <span
        className={cn(
          "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          isDark
            ? "bg-white/10 text-white ring-1 ring-white/20"
            : "bg-[#0A1F44] text-white",
        )}
      >
        {index}
      </span>
      <div className="min-w-0">
        <h3
          className={cn(
            "text-base font-semibold leading-tight",
            isDark ? "text-white" : "text-slate-900",
          )}
        >
          {title}
        </h3>
        {subtitle ? (
          <p
            className={cn(
              "mt-0.5 text-xs",
              isDark ? "text-white/70" : "text-slate-500",
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

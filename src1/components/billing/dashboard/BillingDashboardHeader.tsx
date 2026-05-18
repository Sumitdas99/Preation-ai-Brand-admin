import { Fragment } from "react";
import { cn } from "@/lib/utils";
import type { DashboardVariant } from "@/features/billing/adapters/toBillingDashboardData";

const PILL =
  "shrink-0 whitespace-nowrap rounded-md border-[1.5px] border-white/40 bg-white/5 px-4 py-1.5 text-xs font-medium text-white";

interface BillingDashboardHeaderProps {
  title: string;
  subtitle: string;
  subtitleParts?: string[];
  variant: DashboardVariant;
}

export function BillingDashboardHeader({
  title,
  subtitle,
  subtitleParts,
  variant,
}: BillingDashboardHeaderProps) {
  const greetingBg = variant === "red" ? "bg-[#A02B1F]" : "bg-[#0A1F44]";

  return (
    <div className="text-white">
      <header className="flex h-16 shrink-0 items-center gap-4 overflow-hidden bg-[#0A1F44] px-6 shadow-sm">
        <span className="shrink-0 whitespace-nowrap font-display text-lg font-semibold tracking-tight">
          Praetion <span className="text-[#7BB4E2]">AI</span>
        </span>

        <span className="h-5 w-px shrink-0 bg-white/20" aria-hidden />

        <span className="min-w-0 flex-1 truncate font-sans text-sm font-medium text-white">
          Billing &amp; Usage
        </span>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span className={PILL}>Brand Admin</span>
        </div>
      </header>

      <div className={cn("px-6 pb-5 pt-4", greetingBg)}>
        <h1 className="font-sans text-[22px] font-bold leading-tight tracking-wide">
          {title}
        </h1>
        {subtitleParts && subtitleParts.length > 0 ? (
          <p className="mt-1 flex items-center text-sm font-semibold text-white/70">
            {subtitleParts.map((part, i) => (
              <Fragment key={i}>
                {i > 0 && (
                  <span
                    aria-hidden
                    className="mx-2 inline-block h-3 w-px bg-white/30"
                  />
                )}
                <span>{part}</span>
              </Fragment>
            ))}
          </p>
        ) : (
          <p className="mt-1 text-sm font-semibold text-white/70">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

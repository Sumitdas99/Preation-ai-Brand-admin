import { cn } from "@/lib/utils";
import type { DashboardVariant } from "@/features/billing/adapters/toBillingDashboardData";

interface BillingDashboardHeaderProps {
  title: string;
  subtitle: string;
  variant: DashboardVariant;
}

export function BillingDashboardHeader({
  title,
  subtitle,
  variant,
}: BillingDashboardHeaderProps) {
  return (
    <header
      className={cn(
        "border-b text-white",
        variant === "navy" && "border-white/10 bg-[#0A1F44]",
        variant === "red" && "border-white/15 bg-[#A02B1F]",
      )}
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-5">
        <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-white/60">
          <span className="font-semibold text-white">Praetion AI</span>
          <span className="text-white/30">|</span>
          <span>Billing &amp; Usage</span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold leading-tight text-white">
          {title}
        </h1>
        <p
          className={cn(
            "mt-1 text-sm",
            variant === "red" ? "text-white/85" : "text-white/70",
          )}
        >
          {subtitle}
        </p>
      </div>
    </header>
  );
}

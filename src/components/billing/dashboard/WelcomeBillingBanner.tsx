import { ArrowRight, Check, CheckCircle2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardTone } from "../types";

interface WelcomeBillingBannerProps {
  tone: DashboardTone;
  onPrimary: () => void;
  isPending?: boolean;
  className?: string;
}

export function WelcomeBillingBanner({
  tone,
  onPrimary,
  isPending,
  className,
}: WelcomeBillingBannerProps) {
  if (tone !== "welcome-payment-required" && tone !== "welcome-activate") {
    return null;
  }

  const isPayment = tone === "welcome-payment-required";
  const containerClass = isPayment
    ? "bg-gradient-to-br from-[#1B3268] to-[#3B5BA5] text-white"
    : "bg-gradient-to-br from-[#A77822] to-[#C28C2C] text-white";

  const Icon = isPayment ? CreditCard : CheckCircle2;
  const title = isPayment
    ? "Set up billing to activate your compliance workspace"
    : "Payment ready — activate your subscription to start scanning";
  const body = isPayment
    ? "Your account has been created and your pack is configured. Complete two quick steps to start scanning assets."
    : "Your payment details are saved. One final step: activate your pack to begin compliance scanning.";
  const ctaLabel = isPayment ? "Set up billing" : "Activate subscription";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 px-6 py-5 shadow-sm",
        containerClass,
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/15">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/80">
              {body}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/85">
              <Step
                index={1}
                label="Add payment details"
                done={!isPayment}
                active={isPayment}
              />
              <ArrowRight className="h-3.5 w-3.5 text-white/50" aria-hidden />
              <Step index={2} label="Activate subscription" active={!isPayment} />
            </div>
          </div>
        </div>
        <Button
          type="button"
          onClick={onPrimary}
          disabled={isPending}
          className="bg-white text-[#0A1F44] hover:bg-white/90"
        >
          {isPending ? "Opening…" : ctaLabel}
          {!isPending ? <ArrowRight className="ml-1 h-4 w-4" /> : null}
        </Button>
      </div>
    </section>
  );
}

interface StepProps {
  index: number;
  label: string;
  done?: boolean;
  active?: boolean;
}

function Step({ index, label, done, active }: StepProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium",
        done && "bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/30",
        active && "bg-white/15 text-white ring-1 ring-white/30",
        !done && !active && "text-white/60",
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold",
          done
            ? "bg-emerald-400 text-emerald-950"
            : active
              ? "bg-white text-[#0A1F44]"
              : "bg-white/20 text-white",
        )}
      >
        {done ? <Check className="h-3 w-3" /> : index}
      </span>
      {label}
    </span>
  );
}

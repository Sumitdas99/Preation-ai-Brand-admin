import { ArrowRight, Check, CheckCircle2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardTone } from "../types";

interface WelcomeBillingBannerProps {
  tone: DashboardTone;
  onPrimary: () => void;
  isPending?: boolean;
  userName?: string;
  roleName?: string;
  workspaceName?: string;
  className?: string;
}

export function WelcomeBillingBanner({
  tone,
  onPrimary,
  isPending,
  userName,
  roleName = "Brand Admin",
  workspaceName,
  className,
}: WelcomeBillingBannerProps) {
  if (tone !== "welcome-payment-required" && tone !== "welcome-activate") {
    return null;
  }

  const isPayment = tone === "welcome-payment-required";

  const containerClass = isPayment
    ? "bg-gradient-to-br from-[#1B3268] to-[#3B5BA5] text-white"
    : "bg-[linear-gradient(105deg,_#6B4214,_#C48527)] text-white";

  const Icon = isPayment ? CreditCard : CheckCircle2;
  const title = isPayment
    ? "Set up billing to activate your compliance workspace"
    : "Activate your subscription to start scanning";
  const ctaLabel = isPayment ? "Set up billing" : "Activate subscription";
  const welcomeSubtitle = isPayment
    ? "Complete billing setup to start scanning"
    : "Activate your subscription to unlock scanning";

  return (
    <div className={className}>
      <section
        className={cn("relative overflow-hidden px-6 py-6", containerClass)}
      >
        <div className="flex items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-medium text-white">{title}</h2>
              <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-white/80">
                {isPayment ? (
                  "Your account has been created and your pack is configured. Complete two quick steps to start scanning assets."
                ) : (
                  <>
                    Your payment details are saved. One final step: activate
                    your pack to begin compliance
                    <br />
                    scanning.
                  </>
                )}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                <Step
                  index={1}
                  label={isPayment ? "Add payment details" : "Payment details added"}
                  done={!isPayment}
                  active={isPayment}
                />
                <ArrowRight
                  className="h-5 w-5 text-white opacity-30"
                  strokeWidth={2.5}
                  aria-hidden
                />
                <Step
                  index={2}
                  label="Activate subscription"
                  active={!isPayment}
                />
              </div>
            </div>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={onPrimary}
            disabled={isPending}
            className="shrink-0 gap-1 bg-white/10 text-sm font-bold text-white backdrop-blur-md hover:bg-white/20"
          >
            {isPending ? "Opening\u2026" : ctaLabel}
            {!isPending && (
              <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
            )}
          </Button>
        </div>
      </section>

      <div className="border-b border-border bg-white px-6 pt-5 pb-5">
        <h2 className="font-display text-lg font-medium text-[#0A1F44]">
          Welcome to Praetion AI{userName ? `, ${userName}` : ""}
        </h2>
        <p className="mt-0.5 text-xs font-bold text-gray-600">
          {roleName}
          {workspaceName ? ` \u00b7 ${workspaceName}` : ""}
          {" \u00b7 "}
          {welcomeSubtitle}
        </p>
      </div>
    </div>
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
        "inline-flex items-center",
        done ? "gap-0.5 font-bold text-emerald-300" : "gap-1.5 font-bold",
        active && "text-white",
        !done && !active && "text-white/50",
      )}
    >
      {done ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={3.5} />
      ) : (
        <span
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
            active
              ? "bg-white/25 text-white"
              : "bg-white/10 text-white/70",
          )}
        >
          {index}
        </span>
      )}
      {label}
    </span>
  );
}

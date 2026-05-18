import { ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CardOnFileRowProps {
  onUpdatePayment: () => void;
  isPending?: boolean;
  className?: string;
}

import stripeLogo from "@/assets/stripe-logo.png";

function StripeBadge() {
  return (
    <img
      src={stripeLogo}
      alt="Stripe"
      className="h-4 w-auto rounded-[2px]"
    />
  );
}

export function CardOnFileRow({
  onUpdatePayment,
  isPending,
  className,
}: CardOnFileRowProps) {
  return (
    <div className={cn(className)}>
      <div className="border-t border-border" />

      <div className="px-6 py-5">
        <div className="flex items-center justify-between gap-6 rounded-lg bg-slate-100 px-5 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200/70">
              <Lock className="h-5 w-5 text-slate-600" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-slate-800">
                  Card on file
                </span>
                <StripeBadge />
              </div>
              <p className="mt-1 max-w-2xl text-xs font-semibold leading-relaxed text-slate-600">
                Praetion never stores your card details. Card management is
                handled entirely by Stripe.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={onUpdatePayment}
            disabled={isPending}
            className="shrink-0 gap-1.5 bg-[#0A1F44] text-sm font-bold text-white hover:bg-[#0A1F44]/90"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            {isPending ? "Opening Stripe…" : "Update payment method"}
          </Button>
        </div>
      </div>
    </div>
  );
}

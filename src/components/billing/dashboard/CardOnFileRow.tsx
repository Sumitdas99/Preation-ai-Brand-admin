import { ExternalLink, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardOnFileRowProps {
  onUpdatePayment: () => void;
  isPending?: boolean;
  className?: string;
}

export function CardOnFileRow({
  onUpdatePayment,
  isPending,
  className,
}: CardOnFileRowProps) {
  return (
    <div
      className={cn(
        "mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <Lock
          className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-slate-900">
            Card on file · managed securely by Stripe
            <span className="inline-flex items-center rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-indigo-700">
              Stripe
            </span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Praetion never stores your card details. Card management is handled
            entirely by Stripe.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onUpdatePayment}
        disabled={isPending}
        className="inline-flex items-center gap-1 text-sm font-medium text-[#0A1F44] hover:underline disabled:opacity-60"
      >
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        {isPending ? "Opening Stripe…" : "Update payment method"}
      </button>
    </div>
  );
}

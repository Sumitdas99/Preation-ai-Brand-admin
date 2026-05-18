import { Loader2 } from "lucide-react";
import { COPY } from "@/features/billing/adapters/copy";

interface VerifyingPaymentOverlayProps {
  visible: boolean;
}

export function VerifyingPaymentOverlay({ visible }: VerifyingPaymentOverlayProps) {
  if (!visible) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm"
    >
      <div className="mx-4 flex max-w-sm flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-2xl">
        <Loader2 className="h-6 w-6 animate-spin text-[#0A1F44]" aria-hidden />
        <h2 className="text-base font-semibold text-slate-900">
          {COPY.verifyingPaymentTitle}
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">
          {COPY.verifyingPaymentBody}
        </p>
      </div>
    </div>
  );
}

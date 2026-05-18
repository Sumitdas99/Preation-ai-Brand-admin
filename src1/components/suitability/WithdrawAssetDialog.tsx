import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  WITHDRAW_REASON_MAX,
  type WithdrawFormValues,
} from "@/features/suitability/forms/suitabilityFormSchemas";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  title: string;
  description: string;
  reasonLabel: string;
  reasonPlaceholder: string;
  cancelCta: string;
  confirmCta: string;
  systemCaption: string;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (values: WithdrawFormValues) => void;
}

export function WithdrawAssetDialog({
  open,
  title,
  description,
  reasonLabel,
  reasonPlaceholder,
  cancelCta,
  confirmCta,
  systemCaption,
  submitting,
  onCancel,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    if (!next && !submitting) onCancel();
  };

  const overLimit = reason.length > WITHDRAW_REASON_MAX;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden />
            </span>
            <AlertDialogTitle className="text-base">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <label
            htmlFor="withdraw-reason"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {reasonLabel}
          </label>
          <textarea
            id="withdraw-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonPlaceholder}
            rows={3}
            disabled={submitting}
            maxLength={WITHDRAW_REASON_MAX + 50}
            className={cn(
              "block w-full resize-y rounded-md border bg-background px-3 py-2 text-sm leading-relaxed shadow-sm",
              "placeholder:italic placeholder:text-muted-foreground/80",
              "focus:outline-none focus:ring-2 focus:ring-red-500/40",
              overLimit && "border-red-400",
              submitting && "cursor-not-allowed opacity-60",
            )}
          />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>
              {overLimit
                ? `Reason must be ${WITHDRAW_REASON_MAX} characters or fewer.`
                : " "}
            </span>
            <span className="tabular-nums">
              {reason.length}/{WITHDRAW_REASON_MAX}
            </span>
          </div>
          {systemCaption ? (
            <p className="rounded-md bg-muted/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              {systemCaption}
            </p>
          ) : null}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>{cancelCta}</AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting || overLimit}
            onClick={(e) => {
              e.preventDefault();
              if (overLimit) return;
              onConfirm({ reason: reason.trim() ? reason.trim() : undefined });
            }}
            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/40"
          >
            {submitting ? "Withdrawing…" : confirmCta}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

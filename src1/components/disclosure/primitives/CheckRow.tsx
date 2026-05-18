import { cn } from "@/lib/utils";
import type { ValidationCheckVM } from "../types";

interface Props {
  check: ValidationCheckVM;
}

export function CheckRow({ check }: Props) {
  const status = check.status;
  const isPass = status === "PASS";
  const isPending = status === "PENDING";
  const isFail = status === "FAIL";
  const isNa = status === "NOT_APPLICABLE";

  return (
    <li
      data-check-id={check.id}
      data-status={status}
      className="flex items-start gap-3 px-4 py-2.5"
    >
      <span
        aria-hidden
        className={cn(
          "mt-1.5 flex h-2.5 w-2.5 shrink-0 rounded-full",
          isPass && "bg-emerald-500",
          isPending && "bg-slate-300",
          isFail && "bg-red-500",
          isNa && "border border-slate-300 bg-transparent",
        )}
      />

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-base font-semibold leading-snug",
            isPass && "text-slate-800",
            isPending && "text-slate-500",
            isFail && "text-slate-900",
            isNa && "text-slate-400",
          )}
        >
          {check.label}
        </p>
        {check.detail ? (
          <p className="mt-0.5 text-xs leading-relaxed text-red-600">
            {check.detail}
          </p>
        ) : null}
      </div>
    </li>
  );
}

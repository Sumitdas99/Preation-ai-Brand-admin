import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LegalRowActionKind } from "../types";

const BUTTON_TONE: Record<
  NonNullable<Extract<LegalRowActionKind, { kind: "cta-button" }>["tone"]>,
  string
> = {
  primary:
    "border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
  amber:
    "border-amber-500 bg-amber-500 text-white hover:bg-amber-600 hover:border-amber-600",
  red: "border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700",
};

const TEXT_TONE: Record<
  NonNullable<Extract<LegalRowActionKind, { kind: "text" }>["tone"]>,
  string
> = {
  muted: "text-foreground/50 font-semibold",
  neutral: "text-foreground/50 font-semibold",
};

export function RowActionCell({
  action,
  className,
}: {
  action: LegalRowActionKind | undefined;
  className?: string;
}) {
  if (!action) return null;
  if (action.kind === "cta-button") {
    return (
      <Link
        to={action.href}
        className={cn(
          "inline-flex h-9 items-center justify-center gap-1 whitespace-nowrap rounded-md border px-3 text-[13px] font-extrabold transition-colors",
          BUTTON_TONE[action.tone ?? "primary"],
          className,
        )}
      >
        <span>{action.label}</span>
        <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={3} aria-hidden />
      </Link>
    );
  }
  if (action.kind === "link") {
    return (
      <Link
        to={action.href}
        className={cn(
          "whitespace-nowrap text-[13px] font-bold text-blue-600 hover:underline",
          className,
        )}
      >
        {action.label}
      </Link>
    );
  }
  return (
    <span
      className={cn(
        "whitespace-nowrap text-[13px]",
        TEXT_TONE[action.tone ?? "muted"],
        className,
      )}
    >
      {action.label}
    </span>
  );
}

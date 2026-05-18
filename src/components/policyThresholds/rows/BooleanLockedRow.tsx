import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BooleanLockedRowProps {
  label: string;
  description?: string;
  className?: string;
  valueClassName?: string;
}

export function BooleanLockedRow({
  label,
  description,
  className,
  valueClassName,
}: BooleanLockedRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 border-b bg-red-50/50 px-4 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_minmax(260px,1.5fr)_72px] lg:items-start lg:gap-5 lg:px-5",
        className,
      )}
    >
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-red-700">{label}</h3>
          <Badge
            variant="outline"
            className="gap-1 border-transparent bg-red-100 text-[10px] font-extrabold uppercase tracking-wide text-red-700"
          >
            <Lock className="h-3 w-3" strokeWidth={2.75} aria-hidden />
            locked
          </Badge>
        </div>
        {description ? (
          <p className="mt-2 text-xs font-bold leading-relaxed text-red-700/80">
            {description}
          </p>
        ) : null}
      </div>

      <div className="col-start-2 row-start-1 pt-0.5 text-right lg:col-start-3 lg:row-start-1">
        <div
          className={cn(
            "pr-0.5 text-xl font-bold tabular-nums text-red-700",
            valueClassName,
          )}
        >
          ON
        </div>
        <div className="text-[10px] font-extrabold uppercase tracking-wide text-red-700/80">
          Current
        </div>
      </div>

      <div className="col-span-2 pt-1 lg:col-span-1 lg:col-start-2 lg:row-start-1">
        <div className="flex h-9 items-center justify-center rounded-md border border-dashed border-red-300 bg-white/60 px-4 text-[11px] font-bold uppercase tracking-wide text-red-700">
          Always enforced when detected
        </div>
      </div>
    </div>
  );
}

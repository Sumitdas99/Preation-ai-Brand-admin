import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ThresholdSlider } from "../primitives/ThresholdSlider";

interface LockedThresholdRowProps {
  label: string;
  description?: string;
  systemDefault: number;
  className?: string;
  sliderTheme?: "blue" | "darkRed";
  valueClassName?: string;
}

const formatScore = (n: number) => n.toFixed(2);

export function LockedThresholdRow({
  label,
  description,
  systemDefault,
  className,
  sliderTheme = "blue",
  valueClassName,
}: LockedThresholdRowProps) {
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
            "text-xl font-bold tabular-nums text-red-700",
            valueClassName,
          )}
        >
          {formatScore(systemDefault)}
        </div>
        <div className="text-[10px] font-extrabold uppercase tracking-wide text-red-700/80">
          Current
        </div>
      </div>

      <div className="col-span-2 pt-1 lg:col-span-1 lg:col-start-2 lg:row-start-1">
        <ThresholdSlider
          value={systemDefault}
          baseline={systemDefault}
          markerValue={systemDefault}
          markerLabel="Locked:"
          disabled
          ariaLabel={`${label} threshold (locked)`}
          theme={sliderTheme}
          axisLabelClassName="text-red-700/80"
        />
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CanOnlyBeLoweredChip } from "../primitives/CanOnlyBeLoweredChip";
import { ThresholdSlider } from "../primitives/ThresholdSlider";

interface ThresholdRowProps {
  label: string;
  description?: string;
  badge?: string;
  value: number;
  baseline: number;
  markerValue?: number;
  markerLabel?: string;
  showLoweredChip?: boolean;
  onChange?: (next: number) => void;
  className?: string;
  sliderTheme?: "blue" | "darkRed";
  valueClassName?: string;
  axisLabelClassName?: string;
}

const formatScore = (n: number) => n.toFixed(2);

export function ThresholdRow({
  label,
  description,
  badge,
  value,
  baseline,
  markerValue,
  markerLabel,
  showLoweredChip = true,
  onChange,
  className,
  sliderTheme = "blue",
  valueClassName,
  axisLabelClassName,
}: ThresholdRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 border-b px-4 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_minmax(260px,1.5fr)_72px] lg:items-start lg:gap-5 lg:px-5",
        className,
      )}
    >
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-700">{label}</h3>
          {showLoweredChip ? <CanOnlyBeLoweredChip /> : null}
        </div>
        {badge ? (
          <Badge
            variant="outline"
            className="mt-2 border-transparent bg-rose-50 text-[10px] font-bold uppercase tracking-wide text-rose-700"
          >
            {badge}
          </Badge>
        ) : null}
        {description ? (
          <p className="mt-2 text-xs font-bold leading-relaxed text-foreground/70">
            {description}
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          "col-start-2 row-start-1 pt-0.5 text-right lg:col-start-3 lg:row-start-1",
        )}
      >
        <div
          className={cn(
            "text-xl font-bold tabular-nums text-primary",
            valueClassName,
          )}
        >
          {formatScore(value)}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Current
        </div>
      </div>

      <div className="col-span-2 pt-1 lg:col-span-1 lg:col-start-2 lg:row-start-1">
        <ThresholdSlider
          value={value}
          baseline={baseline}
          markerValue={markerValue}
          markerLabel={markerLabel}
          onChange={onChange}
          ariaLabel={`${label} threshold`}
          theme={sliderTheme}
          axisLabelClassName={axisLabelClassName}
        />
      </div>
    </div>
  );
}

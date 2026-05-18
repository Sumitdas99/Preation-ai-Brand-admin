import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface ThresholdSliderProps {
  value: number;
  baseline: number;
  markerValue?: number;
  markerLabel?: string;
  onChange?: (next: number) => void;
  disabled?: boolean;
  ariaLabel: string;
  theme?: "blue" | "darkRed";
  axisLabelClassName?: string;
}

const formatScore = (n: number) => n.toFixed(2);
const clampToRange = (n: number, max: number) =>
  Math.max(0, Math.min(n, Math.min(1, Math.max(0, max))));

export function ThresholdSlider({
  value,
  baseline,
  markerValue,
  markerLabel = "System default",
  onChange,
  disabled,
  ariaLabel,
  theme = "blue",
  axisLabelClassName,
}: ThresholdSliderProps) {
  const cap = Math.max(0, Math.min(1, baseline));
  const safeValue = clampToRange(value, cap);
  const isDarkRed = theme === "darkRed";
  const markerPercent =
    typeof markerValue === "number"
      ? Math.max(0, Math.min(100, Math.min(markerValue, 1) * 100))
      : null;

  return (
    <div className={cn("w-full select-none", disabled && "opacity-70")}>
      <div className="relative flex h-5 items-center">
        <SliderPrimitive.Root
          value={[safeValue]}
          min={0}
          max={1}
          step={0.01}
          aria-label={ariaLabel}
          disabled={disabled}
          onValueChange={([next]) => {
            if (typeof next !== "number") return;
            onChange?.(clampToRange(next, cap));
          }}
          className="relative flex w-full touch-none select-none items-center"
        >
          <SliderPrimitive.Track
            className={cn(
              "relative h-1.5 w-full grow overflow-hidden rounded-full",
              isDarkRed ? "bg-[#cb2121]/15" : "bg-primary/15",
            )}
          >
            {markerPercent !== null ? (
              <span
                aria-hidden
                className="absolute top-0 h-full w-[3px] -translate-x-1/2 rounded-sm bg-slate-950"
                style={{ left: `${markerPercent}%` }}
              />
            ) : null}
            <SliderPrimitive.Range
              className={cn(
                "absolute h-full",
                isDarkRed ? "bg-[#cb2121]" : "bg-primary",
              )}
            />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className={cn(
              "block h-4 w-4 rounded-full border-2 border-white shadow-[0_1px_3px_rgba(15,23,42,0.35)] ring-offset-background transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              isDarkRed ? "bg-[#cb2121]" : "bg-primary",
              !disabled && "hover:scale-110",
              disabled && "cursor-not-allowed",
            )}
          />
        </SliderPrimitive.Root>
      </div>
      <div
        className={cn(
          "relative mt-1 h-4 text-[10px] font-bold text-muted-foreground",
          axisLabelClassName,
        )}
      >
        <span
          className={cn(
            "absolute left-0",
            markerPercent !== null && markerPercent <= 18 && "hidden",
          )}
        >
          0.00
        </span>
        {markerPercent !== null && typeof markerValue === "number" ? (
          <span
            className="absolute -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${markerPercent}%` }}
          >
            {markerLabel} {formatScore(markerValue)}
          </span>
        ) : null}
        <span
          className={cn(
            "absolute right-0",
            markerPercent !== null && markerPercent >= 88 && "hidden",
          )}
        >
          1.00
        </span>
      </div>
    </div>
  );
}

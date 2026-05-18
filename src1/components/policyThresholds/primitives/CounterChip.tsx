import { cn } from "@/lib/utils";

interface CounterChipProps {
  configurable: number;
  locked?: number;
  className?: string;
}

export function CounterChip({
  configurable,
  locked = 0,
  className,
}: CounterChipProps) {
  const label =
    locked > 0
      ? `${configurable} configurable, ${locked} locked`
      : configurable === 1
        ? "1 configurable threshold"
        : `${configurable} configurable thresholds`;
  return (
    <span
      className={cn(
        "max-w-[8rem] text-right text-xs font-bold uppercase leading-tight tracking-wide text-foreground/70",
        className,
      )}
    >
      {label}
    </span>
  );
}

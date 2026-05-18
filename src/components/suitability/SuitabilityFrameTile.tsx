import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SuitabilityFrameTileProps {
  timecodeMs: number;
  timecodeLabel: string;
  className?: string;
}

export function SuitabilityFrameTile({
  timecodeMs,
  timecodeLabel,
  className,
}: SuitabilityFrameTileProps) {
  return (
    <div
      className={cn(
        "relative flex h-14 w-20 items-center justify-center overflow-hidden rounded-md border-[0.5px] border-neutral-300 bg-[#5a5a5a]",
        className,
      )}
      title={`Frame at ${timecodeLabel}`}
    >
      <Play className="h-6 w-6 fill-white/45" aria-hidden strokeWidth={0} />
      <span className="absolute bottom-1 right-1.5 font-mono text-[9px] font-semibold leading-none tabular-nums text-white/55">
        {timecodeMs}
      </span>
    </div>
  );
}

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CounterChip } from "../primitives/CounterChip";

interface ThresholdSectionCardProps {
  title: string;
  description?: ReactNode;
  configurableCount: number;
  lockedCount?: number;
  className?: string;
  children: ReactNode;
}

export function ThresholdSectionCard({
  title,
  description,
  configurableCount,
  lockedCount = 0,
  className,
  children,
}: ThresholdSectionCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <header className="flex items-start justify-between gap-3 border-b bg-muted/30 px-5 py-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-[550] text-slate-700">{title}</h2>
          {description ? (
            <div className="mt-1 text-xs font-semibold leading-relaxed text-foreground/70">
              {description}
            </div>
          ) : null}
        </div>
        <CounterChip
          configurable={configurableCount}
          locked={lockedCount}
          className="mt-1 shrink-0"
        />
      </header>
      <div>{children}</div>
    </Card>
  );
}

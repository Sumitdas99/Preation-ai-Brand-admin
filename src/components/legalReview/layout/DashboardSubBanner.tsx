import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  caption?: ReactNode;
  endCaption?: ReactNode;
  endpointHint?: string;
  children?: ReactNode;
  className?: string;
}

export function DashboardSubBanner({
  caption,
  endCaption,
  endpointHint,
  children,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border bg-muted/30 px-6 py-3 text-[13px] text-foreground/80",
        className,
      )}
    >
      {caption ? (
        <div className="min-w-0 max-w-md font-medium leading-snug">
          {caption}
        </div>
      ) : null}
      {children}
      <div className="ml-auto flex items-center gap-3">
        {endCaption ? (
          <span className="text-foreground/70">{endCaption}</span>
        ) : null}
        {endpointHint ? (
          <code className="rounded border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            {endpointHint}
          </code>
        ) : null}
      </div>
    </div>
  );
}

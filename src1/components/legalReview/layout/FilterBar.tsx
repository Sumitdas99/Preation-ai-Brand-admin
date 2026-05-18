import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  className?: string;
}

export function FilterBar({ children, className }: Props) {
  return (
    <div
      className={cn(
        "flex h-11 w-full items-stretch justify-end border-b border-border bg-white",
        className,
      )}
      style={{
        boxShadow:
          "inset 4px 0 8px -4px rgba(0,0,0,0.06), inset -4px 0 8px -4px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );
}

interface CellProps {
  children: ReactNode;
  className?: string;
}

export function FilterBarCell({ children, className }: CellProps) {
  return (
    <div
      className={cn(
        "relative flex items-center border-l border-border px-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

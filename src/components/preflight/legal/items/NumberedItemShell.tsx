import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type NumberedItemTone = "indigo" | "red" | "amber" | "muted";

interface Props {
  index: number;
  title: string;
  tone: NumberedItemTone;
  resolved: boolean;
  resolvedLabel: string;
  children: ReactNode;
}

const NUMBER_BUBBLE: Record<NumberedItemTone, string> = {
  indigo: "bg-indigo-700 text-white",
  red: "bg-red-600 text-white",
  amber: "bg-amber-600 text-white",
  muted: "bg-slate-500 text-white",
};

const RESOLVED_BUBBLE = "bg-emerald-600 text-white";

const FRAME_TONE: Record<NumberedItemTone, string> = {
  indigo: "rounded-r-md border-0 border-l-4 border-l-indigo-500 bg-indigo-50",
  red: "rounded-r-md border-0 border-l-4 border-l-red-500 bg-red-50",
  amber: "rounded-r-md border-0 border-l-4 border-l-amber-500 bg-amber-50",
  muted: "rounded-md border border-slate-200 bg-slate-50",
};

export function NumberedItemShell({
  index,
  title,
  tone,
  resolved,
  resolvedLabel,
  children,
}: Props) {
  return (
    <section className={resolved ? "" : "space-y-3"}>
      <header className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold",
            resolved ? RESOLVED_BUBBLE : NUMBER_BUBBLE[tone],
          )}
          aria-hidden
        >
          {resolved ? (
            <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            index
          )}
        </span>
        <h3
          className={cn(
            "flex-1 text-[15px] font-bold uppercase tracking-wider",
            resolved ? "text-emerald-800" : "text-muted-foreground",
          )}
        >
          {title}
        </h3>
        {resolved && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-3 py-1.5 text-sm font-extrabold text-emerald-800">
            <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} aria-hidden />
            {resolvedLabel}
          </span>
        )}
      </header>

      {!resolved && (
        <div className={cn("p-4", FRAME_TONE[tone])}>
          {children}
        </div>
      )}
    </section>
  );
}

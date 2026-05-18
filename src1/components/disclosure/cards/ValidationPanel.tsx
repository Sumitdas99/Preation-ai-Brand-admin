import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ValidationPanelVM } from "../types";
import { CheckRow } from "../primitives/CheckRow";

interface Props {
  data: ValidationPanelVM;
}

export function ValidationPanel({ data }: Props) {
  const allPass = data.allPass;

  return (
    <section>
      <div className="overflow-hidden rounded-lg border-[1.25px] border-slate-200 bg-card shadow-sm">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-slate-50/60 px-6 py-3.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A1F44] text-sm font-semibold text-white">
            {data.badgeLabel}
          </span>
          <h3 className="text-xl font-semibold leading-none text-slate-600">
            {data.title}
          </h3>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-bold",
              allPass
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700",
            )}
          >
            {allPass ? (
              <CheckCircle2 className="h-3 w-3" strokeWidth={2.75} aria-hidden />
            ) : null}
            {data.pillLabel}
          </span>
          <span className="ml-auto text-sm font-bold text-slate-600">
            {data.passCount} / {data.totalCount}
          </span>
        </header>

        <ul className="divide-y divide-slate-100 px-2 py-1">
          {data.checks.map((check) => (
            <CheckRow key={check.id} check={check} />
          ))}
        </ul>
      </div>
    </section>
  );
}

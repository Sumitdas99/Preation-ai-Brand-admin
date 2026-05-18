import { ArrowRight, FileText } from "lucide-react";
import { usePreFlightActions } from "@/features/preflight/actions/PreFlightActionsContext";
import type { PreFlightActionId } from "@/features/preflight/actions/PreFlightActionsContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WhatHappensNextPanel } from "../types";

interface Props {
  data: WhatHappensNextPanel;
}

export function WhatHappensNextCard({ data }: Props) {
  const { onAction } = usePreFlightActions();

  return (
    <section className="border-t border-border px-6 py-5">
      <header className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {data.title}
        </h2>
      </header>

      <div className="space-y-4 rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
          {data.statusLabel}
        </div>

        <ul className="space-y-2.5">
          {data.items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-[13px] font-medium leading-relaxed text-foreground/85"
            >
              <span
                aria-hidden
                className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3 pt-1">
          {data.actions.map((action) => {
            const actionId = action.id as PreFlightActionId;
            const isPrimary = action.variant === "primary";
            return (
              <Button
                key={action.id}
                type="button"
                variant={isPrimary ? "default" : "ghost"}
                onClick={() =>
                  onAction(actionId, {
                    id: action.id,
                    label: action.label,
                  })
                }
                className={cn(
                  "h-10 font-semibold",
                  isPrimary
                    ? "bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-700"
                    : "border-0 bg-slate-100 text-slate-800 hover:bg-slate-200",
                )}
              >
                {isPrimary ? (
                  <FileText className="h-4 w-4" aria-hidden />
                ) : null}
                {action.label}
                {isPrimary ? (
                  <ArrowRight className="h-4 w-4" aria-hidden />
                ) : null}
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

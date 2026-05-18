import { Fragment } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExpansionSlot } from "../actions/ExpansionSlot";

export type LegalActionId = "approve" | "reject" | "force-pass";

export type LegalActionTone = "emerald" | "red" | "neutral";

export interface LegalActionRow {
  id: LegalActionId;
  label: string;
  description: string;
  tone?: LegalActionTone;
}

const EXPANDED_BG: Record<LegalActionTone, string> = {
  emerald: "bg-emerald-50/70",
  red: "bg-red-50/70",
  neutral: "bg-slate-50",
};

const EXPANDED_LABEL: Record<LegalActionTone, string> = {
  emerald: "text-emerald-900",
  red: "text-red-900",
  neutral: "text-slate-600",
};

const EXPANDED_DESC: Record<LegalActionTone, string> = {
  emerald: "font-semibold text-emerald-900",
  red: "font-semibold text-red-900",
  neutral: "font-semibold text-slate-600",
};

const EXPANDED_ARROW: Record<LegalActionTone, string> = {
  emerald: "text-emerald-700",
  red: "text-red-700",
  neutral: "text-foreground",
};

interface Props {
  rows: LegalActionRow[];
  expandedId: LegalActionId | null;
  onToggle: (id: LegalActionId) => void;
  slots: Partial<Record<LegalActionId, React.ReactNode>>;
  busy?: boolean;
  backToQueue?: { label: string; description: string; onClick: () => void };
}

export function LegalActionsSection({
  rows,
  expandedId,
  onToggle,
  slots,
  busy,
  backToQueue,
}: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {rows.map((row) => {
        const isExpanded = expandedId === row.id;
        const content = slots[row.id];
        const tone = row.tone ?? "neutral";
        return (
          <Fragment key={row.id}>
            <button
              type="button"
              onClick={() => onToggle(row.id)}
              disabled={busy}
              aria-expanded={isExpanded}
              className={cn(
                "group flex w-full items-start gap-4 border-b border-border px-4 py-3.5 text-left",
                "transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-60",
                isExpanded
                  ? EXPANDED_BG[tone]
                  : "bg-card hover:bg-muted/60",
              )}
            >
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-sm font-semibold",
                    isExpanded ? EXPANDED_LABEL[tone] : "text-foreground",
                  )}
                >
                  {row.label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-xs leading-relaxed",
                    isExpanded ? EXPANDED_DESC[tone] : "text-muted-foreground",
                  )}
                >
                  {row.description}
                </span>
              </span>
              <ArrowRight
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 transition-transform",
                  isExpanded
                    ? cn("rotate-90", EXPANDED_ARROW[tone])
                    : "text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground",
                )}
                aria-hidden
              />
            </button>
            {content != null && (
              <ExpansionSlot expanded={isExpanded}>
                <div className="border-b border-border">{content}</div>
              </ExpansionSlot>
            )}
          </Fragment>
        );
      })}
      {backToQueue && (
        <button
          type="button"
          onClick={backToQueue.onClick}
          className={cn(
            "group flex w-full items-start gap-4 px-4 py-3.5 text-left",
            "bg-card transition-colors hover:bg-muted/60",
          )}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">
              {backToQueue.label}
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              {backToQueue.description}
            </span>
          </span>
          <ArrowRight
            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
            aria-hidden
          />
        </button>
      )}
    </div>
  );
}

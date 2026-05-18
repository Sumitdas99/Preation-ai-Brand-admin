import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePreFlightActions } from "@/features/preflight/actions/PreFlightActionsContext";
import type { ActionItem } from "../types";

interface Props {
  item: ActionItem;
  expanded?: boolean;
}

const TONE_CONTAINER: Record<NonNullable<ActionItem["tone"]>, string> = {
  default: "bg-card hover:bg-muted/60",
  purple: "bg-[#F5F4FE] hover:bg-[#EEEDFE]",
};

const TONE_LABEL: Record<NonNullable<ActionItem["tone"]>, string> = {
  default: "text-foreground",
  purple: "text-[#3C3489]",
};

const TONE_DESCRIPTION: Record<NonNullable<ActionItem["tone"]>, string> = {
  default: "text-muted-foreground",
  purple: "text-[#3C3489]/70",
};

const TONE_ARROW_IDLE: Record<NonNullable<ActionItem["tone"]>, string> = {
  default: "text-muted-foreground group-hover:text-foreground",
  purple: "text-[#534BB7]/70 group-hover:text-[#3C3489]",
};

const TONE_ARROW_EXPANDED: Record<NonNullable<ActionItem["tone"]>, string> = {
  default: "text-foreground",
  purple: "text-[#3C3489]",
};

export function ActionButton({ item, expanded = false }: Props) {
  const { onAction, pendingAction, disabledActions } = usePreFlightActions();
  const isPending = pendingAction === item.id;
  const isDisabled = disabledActions.has(item.id) || Boolean(pendingAction);
  const tone = expanded ? (item.tone ?? "default") : "default";

  return (
    <button
      type="button"
      onClick={() => onAction(item.id, item)}
      disabled={isDisabled}
      aria-expanded={expanded}
      className={cn(
        "group flex w-full items-start gap-4 border-b border-border px-4 py-3.5 text-left",
        "transition-colors last:border-b-0",
        TONE_CONTAINER[tone],
        "disabled:cursor-not-allowed disabled:opacity-60",
        expanded &&
          "relative z-10 shadow-[0_2px_4px_-1px_rgba(60,52,137,0.18)]",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm font-semibold", TONE_LABEL[tone])}>
          {item.label}
        </span>
        {item.description && (
          <span
            className={cn(
              "mt-0.5 block text-xs leading-relaxed",
              TONE_DESCRIPTION[tone],
            )}
          >
            {item.description}
          </span>
        )}
      </span>
      {isPending ? (
        <Loader2
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 animate-spin",
            TONE_ARROW_IDLE[tone],
          )}
          aria-hidden
        />
      ) : (
        <ArrowRight
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 transition-transform",
            expanded
              ? cn("rotate-90", TONE_ARROW_EXPANDED[tone])
              : cn("group-hover:translate-x-0.5", TONE_ARROW_IDLE[tone]),
          )}
          aria-hidden
        />
      )}
    </button>
  );
}

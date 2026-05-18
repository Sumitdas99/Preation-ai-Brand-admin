import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { ActionButton } from "./ActionButton";
import { ExpansionSlot } from "./ExpansionSlot";
import type { ActionItem } from "../types";
import { canView, useViewerRole } from "../viewerRole";

export type { ActionExpansion } from "./ExpansionSlot";

interface Props {
  title: string;
  items: ActionItem[];
  expansion?: import("./ExpansionSlot").ActionExpansion;
}

export function ActionsSection({ title, items, expansion }: Props) {
  const role = useViewerRole();
  const visible = items.filter((item) => canView(item, role));

  if (visible.length === 0) return null;

  const lastItemId = visible[visible.length - 1]?.id;
  const slotAtBottom =
    !!expansion && expansion.expanded && expansion.itemId === lastItemId;

  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-border",
          slotAtBottom && "rounded-bl-none",
        )}
      >
        {visible.map((item) => {
          const ownsSlot = expansion?.itemId === item.id;
          const isExpanded = Boolean(ownsSlot && expansion?.expanded);
          return (
            <Fragment key={item.id}>
              <ActionButton item={item} expanded={isExpanded} />
              {ownsSlot ? (
                <ExpansionSlot expanded={isExpanded}>
                  <div className="border-l-4 border-l-[#534BB7] bg-[#EEEDFE]">
                    {expansion!.content}
                  </div>
                </ExpansionSlot>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

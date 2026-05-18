import { Fragment } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DisclosureStepItem, DisclosureStepProgress } from "../types";

interface Props {
  data: DisclosureStepProgress;
}

export function StepProgress({ data }: Props) {
  const lastIndex = data.items.length - 1;

  return (
    <nav
      aria-label="Disclosure progress"
      className="border-b border-border bg-card"
    >
      <ol className="mx-auto flex max-w-[1180px] items-center gap-3 px-6 py-[18px]">
        {data.items.map((item, idx) => {
          const prev = idx > 0 ? data.items[idx - 1] : undefined;
          const connectorFilled = prev?.status === "complete";
          return (
            <Fragment key={item.id}>
              {idx > 0 && (
                <span
                  aria-hidden
                  className={cn(
                    "h-0.5 flex-1 min-w-6 rounded-full transition-colors",
                    connectorFilled
                      ? "bg-[#0A1F44]"
                      : "bg-[#0A1F44]/20",
                  )}
                />
              )}
              <li
                className={cn(
                  "flex shrink-0 items-center gap-2.5",
                  item.status === "upcoming" && "opacity-40",
                )}
              >
                <StepBadge item={item} index={idx + 1} />
                <span className={labelClass(item.status)}>{item.label}</span>
              </li>
              {idx === lastIndex && null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

interface StepBadgeProps {
  item: DisclosureStepItem;
  index: number;
}

function StepBadge({ item, index }: StepBadgeProps) {
  const base =
    "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-shadow";

  if (item.status === "complete") {
    return (
      <span className={cn(base, "bg-[#0A1F44] text-white")}>
        <Check className="h-[17px] w-[17px]" aria-hidden strokeWidth={2.5} />
      </span>
    );
  }

  if (item.status === "active") {
    return (
      <span
        className={cn(base, "bg-[#0A1F44] text-white ring-4 ring-blue-100")}
        aria-current="step"
      >
        {index}
      </span>
    );
  }

  return (
    <span className={cn(base, "bg-[#0A1F44] text-white")}>
      {index}
    </span>
  );
}

function labelClass(status: DisclosureStepItem["status"]) {
  const base = "font-display text-base tracking-tight text-[#0A1F44]";
  if (status === "active") return cn(base, "font-[550] text-blue-700");
  return cn(base, "font-[450]");
}

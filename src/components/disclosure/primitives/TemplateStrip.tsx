import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TemplateStripVM } from "../types";

interface Props {
  data: TemplateStripVM;
  disabled?: boolean;
  onSelectTemplate: (templateId: string) => void;
}

export function TemplateStrip({ data, disabled, onSelectTemplate }: Props) {
  if (!data.visible) return null;

  const canCycle = !disabled && data.options.length > 1;

  function handleChange() {
    if (!canCycle) return;
    const idx = data.options.findIndex(
      (o) => o.id === data.currentTemplateId,
    );
    const next = data.options[(idx + 1) % data.options.length];
    if (next) onSelectTemplate(next.id);
  }

  return (
    <div className="rounded-md bg-blue-50 px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <span className="self-start shrink-0 whitespace-nowrap rounded-md bg-[#0A1F44] px-3 py-1.5 text-sm font-bold text-white sm:mt-0.5">
          {data.badgeLabel}
        </span>

        <p className="min-w-0 flex-1 text-sm font-medium leading-relaxed text-blue-900">
          {data.applied ? (
            <>
              {data.bodyPrefix}{" "}
              {data.templateKey ? (
                <span className="font-semibold text-blue-950">
                  {data.templateKey}
                </span>
              ) : null}{" "}
              <span className="text-blue-900">{data.arrowSymbol}</span>{" "}
              {data.quotedText ? (
                <span className="font-semibold text-blue-950">
                  &ldquo;{data.quotedText}&rdquo;
                </span>
              ) : null}{" "}
              {data.bodyMeta}
            </>
          ) : (
            data.emptyMessage
          )}
        </p>

        <button
          type="button"
          onClick={handleChange}
          disabled={!canCycle}
          className={cn(
            "self-start shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 underline underline-offset-2",
            canCycle ? "hover:text-blue-800" : "cursor-not-allowed opacity-50",
          )}
        >
          {data.changeLinkLabel}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

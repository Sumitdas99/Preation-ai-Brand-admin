import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CategoryDotView, NextCategoryView } from "./types";
import { SUITABILITY_DETAIL_COPY } from "@/features/suitability/adapters/copy";

interface Props {
  onBack: () => void;
  dots: CategoryDotView[];
  onDotClick: (dot: CategoryDotView) => void;
  nextCategory?: NextCategoryView;
  onNext?: (next: NextCategoryView) => void;
}

export function CategoryDetailFooter({
  onBack,
  dots,
  onDotClick,
  nextCategory,
  onNext,
}: Props) {
  return (
    <footer className="flex flex-col-reverse items-stretch gap-3 rounded-md border border-border bg-card px-6 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className="h-11 shrink-0 self-start border-0 bg-slate-100 font-semibold text-slate-800 hover:bg-slate-200 sm:self-auto"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        {SUITABILITY_DETAIL_COPY.backCta}
      </Button>

      {dots.length > 1 ? (
        <CategoryDots dots={dots} onDotClick={onDotClick} />
      ) : (
        <span aria-hidden />
      )}

      {nextCategory ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => onNext?.(nextCategory)}
          className="h-11 shrink-0 self-end border-0 bg-slate-100 font-semibold text-slate-800 hover:bg-slate-200 sm:self-auto"
        >
          {SUITABILITY_DETAIL_COPY.nextCategoryCtaTemplate(
            nextCategory.categoryLabel,
          )}
          <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </Button>
      ) : (
        <span className="hidden shrink-0 sm:block sm:w-[200px]" aria-hidden />
      )}
    </footer>
  );
}

interface DotsProps {
  dots: CategoryDotView[];
  onDotClick: (dot: CategoryDotView) => void;
}

const DOT_INACTIVE = "bg-slate-300";
const DOT_ACTIVE = "bg-slate-700";
const DOT_ACTIVE_HALO = "ring-slate-400/40";

function CategoryDots({ dots, onDotClick }: DotsProps) {
  return (
    <nav
      aria-label="Categories"
      className="flex min-w-0 flex-1 items-center justify-center gap-2.5"
    >
      {dots.map((dot) => {
        const ariaLabel = `${dot.categoryLabel} (${dot.verdict.toLowerCase()})${
          dot.isCurrent ? ", current" : ""
        }`;
        return (
          <button
            key={dot.categoryKey}
            type="button"
            aria-label={ariaLabel}
            aria-current={dot.isCurrent ? "page" : undefined}
            disabled={dot.isCurrent}
            onClick={() => {
              if (!dot.isCurrent) onDotClick(dot);
            }}
            title={dot.categoryLabel}
            className={cn(
              "rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400",
              dot.isCurrent
                ? cn(
                    "h-3 w-3 cursor-default ring-2 ring-offset-2 ring-offset-card",
                    DOT_ACTIVE,
                    DOT_ACTIVE_HALO,
                  )
                : cn(
                    "h-2 w-2 cursor-pointer hover:scale-110 hover:bg-slate-500",
                    DOT_INACTIVE,
                  ),
            )}
          />
        );
      })}
    </nav>
  );
}

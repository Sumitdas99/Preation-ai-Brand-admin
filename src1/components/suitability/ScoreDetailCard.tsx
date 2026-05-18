import { cn } from "@/lib/utils";
import { ScoreBar } from "./ScoreBar";
import type {
  CategoryDetailTone,
  ScoreDetailView,
  ScoreLegendItem,
} from "./types";
import { SUITABILITY_DETAIL_COPY } from "@/features/suitability/adapters/copy";

interface Props {
  data: ScoreDetailView;
  tone: CategoryDetailTone;
}

const SWATCH_CLASSNAMES: Record<ScoreLegendItem["swatch"], string> = {
  score: "bg-slate-400",
  flag: "bg-amber-500",
  block: "bg-red-500",
  allowed: "bg-emerald-500",
};

const TONE_SCORE_NUMERIC: Record<CategoryDetailTone, string> = {
  blocked: "text-[#cb2122]",
  flagged: "text-[#e6880a]",
};

export function ScoreDetailCard({ data, tone }: Props) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200/80 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_8px_-2px_rgba(15,23,42,0.06)]">
      <header className="border-b border-slate-200/70 px-4 py-2">
        <h2 className="text-[15px] font-extrabold uppercase tracking-wider text-slate-700 [font-family:Arial,Helvetica,sans-serif]">
          {SUITABILITY_DETAIL_COPY.scoreHeader}
        </h2>
      </header>

      <div className="p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {SUITABILITY_DETAIL_COPY.scoreAssetLabel}
          </p>
          <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <span
              className={cn(
                "shrink-0 block font-mono text-5xl font-bold tabular-nums tracking-tight leading-none",
                TONE_SCORE_NUMERIC[tone],
              )}
            >
              {data.scoreLabel}
            </span>

            <div className="min-w-0 flex-1">
              <ScoreBar
                size="full"
                score={data.scoreNumeric}
                flagThreshold={data.flagThreshold}
                blockThreshold={data.blockThreshold}
                ariaLabel={`Score ${data.scoreLabel}`}
              />
              <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
                {data.legend.map((item) => (
                  <li
                    key={`${item.swatch}-${item.label}`}
                    className="flex items-center gap-1.5"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 rounded-full",
                        SWATCH_CLASSNAMES[item.swatch],
                      )}
                    />
                    <span className="text-slate-700">
                      <span className="font-bold">{item.label}</span>
                      {item.value ? (
                        <span className="ml-1.5 font-medium tabular-nums text-slate-500">
                          {item.value}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-6 rounded-md bg-slate-50/70 px-4 py-3 text-sm font-semibold leading-relaxed text-foreground">
          {data.explanation.primarySentence}
          {data.explanation.subFieldNote ? (
            <> {data.explanation.subFieldNote}</>
          ) : null}
        </p>
      </div>
    </section>
  );
}

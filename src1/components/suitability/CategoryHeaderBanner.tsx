import { cn } from "@/lib/utils";
import type {
  CategoryDetailTone,
  CategoryHeaderView,
  CategoryStatBoxView,
} from "./types";

interface Props {
  data: CategoryHeaderView;
}

const TONES: Record<
  CategoryDetailTone,
  {
    topBar: string;
    border: string;
    pill: string;
    title: string;
    position: string;
  }
> = {
  blocked: {
    topBar: "bg-red-600",
    border: "border-red-200",
    pill: "bg-[#cb2122] text-white",
    title: "text-red-900",
    position: "text-red-900/80",
  },
  flagged: {
    topBar: "bg-amber-600",
    border: "border-amber-200",
    pill: "bg-[#e6880a] text-white",
    title: "text-amber-900",
    position: "text-amber-900/80",
  },
};

export function CategoryHeaderBanner({ data }: Props) {
  const tone = TONES[data.tone];
  return (
    <section
      className={cn(
        "overflow-hidden rounded-b-lg border-[0.5px] bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_8px_-2px_rgba(15,23,42,0.06)]",
        tone.border,
      )}
    >
      <div className={cn("h-1", tone.topBar)} aria-hidden />
      <div className="px-6 py-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <h1
              className={cn(
                "min-w-0 truncate font-display text-2xl font-semibold tracking-tight",
                tone.title,
              )}
            >
              {data.categoryLabel}
            </h1>
            <span
              className={cn(
                "shrink-0 rounded-sm px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider",
                tone.pill,
              )}
            >
              {data.verdictLabel}
            </span>
          </div>
          {data.positionLabel ? (
            <span
              className={cn(
                "shrink-0 self-center text-sm font-bold",
                tone.position,
              )}
            >
              {data.positionLabel}
            </span>
          ) : null}
        </div>

        <dl className="mt-4 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
          {data.statBoxes.map((box) => (
            <StatBox key={box.label} box={box} />
          ))}
        </dl>
      </div>
    </section>
  );
}

function StatBox({ box }: { box: CategoryStatBoxView }) {
  return (
    <div className="rounded-md bg-slate-50/70 px-3.5 py-3">
      <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {box.label}
      </dt>
      <dd
        className={cn(
          "mt-1 truncate font-mono text-base font-semibold tabular-nums",
          box.tone === "muted" ? "text-muted-foreground" : "text-foreground",
        )}
        title={box.value}
      >
        {box.value}
      </dd>
    </div>
  );
}

import { Check, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Modality, ModalityProgress, ModalityStatus } from "../types";

interface ToneStyle {
  card: string;
  border: string;
  bar: string;
  barTrack: string;
  nameText: string;
  enumText: string;
}

const TONES: Record<Modality["tone"], ToneStyle> = {
  success: {
    card: "bg-emerald-50",
    border: "border-emerald-200",
    bar: "bg-emerald-500",
    barTrack: "bg-emerald-100",
    nameText: "text-emerald-900",
    enumText: "text-emerald-700/80",
  },
  warning: {
    card: "bg-amber-50",
    border: "border-amber-200",
    bar: "bg-amber-600",
    barTrack: "bg-amber-200",
    nameText: "text-amber-900",
    enumText: "text-amber-800/80",
  },
  muted: {
    card: "bg-slate-50",
    border: "border-slate-200",
    bar: "bg-slate-400",
    barTrack: "bg-slate-200",
    nameText: "text-slate-900",
    enumText: "text-slate-600",
  },
};

interface Props {
  data: ModalityProgress;
}

export function ModalityProgressCard({ data }: Props) {
  return (
    <section className="pb-4 pl-3.5 pr-4 pt-3">
      <header className="mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {data.headerTitle}
        </h3>
        <p className="mt-2 text-xs font-semibold leading-snug text-muted-foreground">
          {data.headerSubtitle}
        </p>
      </header>

      <ul className="-ml-1 space-y-2">
        {data.items.map((item, i) => (
          <li key={`${item.name}-${i}`}>
            <ModalityItem data={item} />
          </li>
        ))}
      </ul>

      <aside className="-ml-1 mt-3 rounded border border-dashed border-muted-foreground/25 bg-muted/20 p-2.5">
        <p className="text-[11px] font-semibold leading-snug text-muted-foreground">
          {data.footerNote}
        </p>
      </aside>
    </section>
  );
}

function ModalityItem({ data }: { data: Modality }) {
  const style = TONES[data.tone];
  const isInProgress = data.status === "IN_PROGRESS";

  return (
    <article
      className={cn(
        "space-y-2.5 rounded-md border p-3",
        style.card,
        style.border,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "text-[13px] font-bold leading-tight",
            style.nameText,
          )}
        >
          {data.name}
        </span>
        <StatusChip
          status={data.status}
          label={data.statusLabel}
          tone={data.tone}
        />
      </div>

      <div
        className={cn("h-1 w-full overflow-hidden rounded-full", style.barTrack)}
        aria-hidden
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            style.bar,
            isInProgress && "animate-pulse-subtle",
          )}
          style={{ width: `${data.progressPct}%` }}
        />
      </div>

      <p
        className={cn(
          "font-mono text-[11px] font-medium leading-snug",
          style.enumText,
        )}
      >
        {data.enumValue}
      </p>
    </article>
  );
}

function StatusChip({
  status,
  label,
  tone,
}: {
  status: ModalityStatus;
  label: string;
  tone: Modality["tone"];
}) {
  if (status === "COMPLETE") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
        <Check className="h-2.5 w-2.5 stroke-[3]" aria-hidden />
        {label}
      </span>
    );
  }

  if (status === "PENDING") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
        <Clock className="h-2.5 w-2.5" aria-hidden />
        {label}
      </span>
    );
  }

  if (tone === "muted") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
        <Loader2 className="h-2.5 w-2.5 animate-spin stroke-[3]" aria-hidden />
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
      <Loader2 className="h-2.5 w-2.5 animate-spin stroke-[3]" aria-hidden />
      {label}
    </span>
  );
}

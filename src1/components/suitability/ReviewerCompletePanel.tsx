import { CheckCircle2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";

interface Props {
  headerLabel: string;
  backCta: string;
  onBack: () => void;
  allowedCount: number;
  policyPackLabel?: string;
  thresholdStandardLabel?: string;
  evaluatedAtLabel?: string;
}

export function ReviewerCompletePanel({
  headerLabel,
  backCta,
  onBack,
  allowedCount,
  policyPackLabel,
  thresholdStandardLabel,
  evaluatedAtLabel,
}: Props) {
  return (
    <section className="overflow-hidden rounded-md border border-slate-200/80 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_8px_-2px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-200/70 px-4 py-2">
        <SectionHeader title={headerLabel} tone="allowed" />
      </div>

      <div className="px-6 pb-9 pt-8 sm:px-8 sm:pb-11 sm:pt-10">
        <CompletionMedal />

        <div className="mt-6 text-center">
          <h3 className="text-2xl font-medium tracking-tight text-slate-600">
            Review complete
          </h3>
          <p className="mt-2 whitespace-nowrap text-base font-semibold leading-relaxed text-slate-700">
            Verdict recorded. You can return to Pre-Flight to continue the run.
          </p>
        </div>

        <CompletionStatGrid
          allowedCount={allowedCount}
          policyPackLabel={policyPackLabel}
          thresholdStandardLabel={thresholdStandardLabel}
          evaluatedAtLabel={evaluatedAtLabel}
        />

        <div className="mt-7 flex justify-center">
          <Button
            type="button"
            onClick={onBack}
            className="h-12 gap-2 bg-[#0f1d3b] px-6 text-base font-bold text-white shadow-sm hover:bg-[#1a2c52] focus-visible:ring-[#0f1d3b]"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            {backCta}
          </Button>
        </div>
      </div>
    </section>
  );
}

function CompletionMedal() {
  return (
    <div
      aria-hidden
      className="relative mx-auto flex h-24 w-24 items-center justify-center"
    >
      <div className="absolute inset-0 rounded-full bg-emerald-50" />
      <div className="absolute inset-2.5 rounded-full bg-emerald-100" />
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 shadow-[0_5px_14px_-4px_rgba(5,46,22,0.35),0_2px_4px_rgba(5,46,22,0.15)]">
        <CheckCircle2
          className="h-6 w-6 text-white"
          strokeWidth={2.5}
          aria-hidden
        />
      </div>
    </div>
  );
}

interface CompletionStatGridProps {
  allowedCount: number;
  policyPackLabel?: string;
  thresholdStandardLabel?: string;
  evaluatedAtLabel?: string;
}

function CompletionStatGrid({
  allowedCount,
  policyPackLabel,
  thresholdStandardLabel,
  evaluatedAtLabel,
}: CompletionStatGridProps) {
  return (
    <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <CompletionStatTile
        label="Categories cleared"
        value={`${allowedCount} of ${allowedCount}`}
      />
      <CompletionStatTile
        label="Policy pack applied"
        value={policyPackLabel ?? "—"}
        mono={Boolean(policyPackLabel)}
      />
      <CompletionStatTile
        label="Threshold standard"
        value={thresholdStandardLabel ?? "—"}
        mono={Boolean(thresholdStandardLabel)}
      />
      <CompletionStatTile
        label="Evaluated"
        value={evaluatedAtLabel ?? "—"}
      />
    </dl>
  );
}

interface CompletionStatTileProps {
  label: string;
  value: string;
  mono?: boolean;
}

function CompletionStatTile({
  label,
  value,
  mono = false,
}: CompletionStatTileProps) {
  return (
    <div className="rounded-md bg-slate-100/70 px-3.5 py-3">
      <dt className="text-[13px] font-extrabold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 min-w-0 truncate text-sm font-semibold tabular-nums text-slate-900",
          mono && "font-mono",
        )}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

import type { CandidateVM } from "../types";

export function CandidateChip({ data }: { data: CandidateVM }) {
  return (
    <div
      role="group"
      aria-label={`Candidate ${data.name}`}
      className="flex items-center gap-3 rounded-lg border-[1.5px] border-[#EEB5B0] bg-[#FDF1F1] px-3.5 py-3"
    >
      <div
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEB5B0] text-sm font-bold tracking-wide text-[#912323]"
      >
        {data.initials}
      </div>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-bold text-[#912323]">
          {data.name}
        </span>
        <span className="text-xs font-bold text-[#C9564A]">
          {data.matchPercent}
        </span>
        {data.peakFrame ? (
          <span className="text-[11px] font-semibold text-muted-foreground">
            {data.peakFrame}
          </span>
        ) : null}
      </div>
    </div>
  );
}

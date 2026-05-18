import { Fragment } from "react";
import { cn } from "@/lib/utils";
import type { LegalDashboardGreeting, LegalDashboardKpi } from "../types";

interface Props {
  greeting: LegalDashboardGreeting;
  kpis?: LegalDashboardKpi[];
  className?: string;
}

const HIGHLIGHT_TONE: Record<
  NonNullable<LegalDashboardGreeting["highlightTone"]>,
  string
> = {
  amber: "text-amber-300",
  red: "text-red-300",
};

const PIPE = (
  <span
    aria-hidden
    className="mx-2 inline-block h-3 w-px bg-white/30 align-middle"
  />
);

export function DashboardGreeting({ greeting, kpis, className }: Props) {
  const parts = greeting.sublineParts?.length
    ? greeting.sublineParts
    : greeting.subline
      ? [greeting.subline]
      : null;

  return (
    <div
      className={cn(
        "flex items-stretch gap-6 px-6 pb-4 text-white",
        className,
      )}
    >
      <div className="flex min-w-0 shrink-0 flex-col justify-center">
        <h1 className="font-display text-[22px] font-semibold leading-tight tracking-tight">
          {greeting.title}
        </h1>
        {parts ? (
          <p className="mt-1.5 flex items-center text-xs font-bold uppercase tracking-wider text-white/50">
            {parts.map((part, i) => (
              <Fragment key={i}>
                {i > 0 && PIPE}
                <span>{part}</span>
              </Fragment>
            ))}
            {greeting.highlightSuffix ? (
              <>
                {PIPE}
                <span
                  className={HIGHLIGHT_TONE[greeting.highlightTone ?? "amber"]}
                >
                  {greeting.highlightSuffix}
                </span>
              </>
            ) : null}
          </p>
        ) : null}
      </div>

      {kpis && kpis.length > 0 ? (
        <div className="ml-auto flex items-stretch gap-2" style={{ width: "60%" }}>
          {kpis.map((k) => (
              <div
                key={k.label}
                className="flex flex-1 flex-col gap-1 rounded-lg bg-white/[0.04] px-4 py-3"
              >
                <span className="text-xs font-extrabold text-white/60">
                  {k.label}
                </span>
                <span className="text-[22px] font-extrabold leading-none tabular-nums text-white">
                  {k.value}
                </span>
              </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

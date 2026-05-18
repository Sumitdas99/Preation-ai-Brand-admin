import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { EvidencePackSectionShellData } from "../types";
import type { EvidencePackSectionTone } from "../types";

const CIRCLE_CLASSES: Record<EvidencePackSectionTone, string> = {
  complete: "bg-emerald-600 text-white",
  approved: "bg-emerald-600 text-white",
  warning: "bg-amber-500 text-white",
  danger: "bg-rose-600 text-white",
  muted: "bg-slate-400 text-white",
  "force-pass": "bg-rose-600 text-white",
};

const SOLID_BADGE_CLASSES: Record<EvidencePackSectionTone, string> = {
  complete: "bg-emerald-700 text-white",
  approved: "bg-emerald-700 text-white",
  warning: "bg-amber-600 text-white",
  danger: "bg-rose-600 text-white",
  muted: "bg-slate-500 text-white",
  "force-pass": "bg-rose-600 text-white",
};

interface Props {
  data: EvidencePackSectionShellData;
  children: ReactNode;
}

export function SectionShell({ data, children }: Props) {
  const tone = data.statusBadge.tone;

  return (
    <section
      id={data.key}
      aria-label={`Section ${data.index} — ${data.title}`}
      className="scroll-mt-16 overflow-hidden rounded-lg border-[1.25px] border-slate-200 bg-card shadow-sm [contain:layout_paint]"
    >
      <header className="flex items-center gap-3 border-b border-slate-200 bg-slate-50/60 px-6 py-3.5">
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
            CIRCLE_CLASSES[tone],
          )}
        >
          {data.index}
        </span>
        <h2 className="min-w-0 truncate text-xl font-semibold leading-none text-slate-600">
          {data.title}
        </h2>
        <span
          className={cn(
            "ml-auto shrink-0 rounded-md px-3 py-1.5 font-mono text-xs font-semibold tracking-wide",
            SOLID_BADGE_CLASSES[tone],
          )}
        >
          {data.statusBadge.label}
        </span>
      </header>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

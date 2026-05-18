import { CheckCircle2 } from "lucide-react";
import type { EvidencePackHeaderData } from "../types";

interface Props {
  data: EvidencePackHeaderData;
}

export function EvidencePackHeader({ data }: Props) {
  return (
    <section className="relative shrink-0 overflow-hidden border-b-2 border-emerald-500 bg-emerald-50">
      <div className="relative flex min-h-16 items-center gap-3 px-6 py-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2
            className="h-5 w-5 text-emerald-600"
            aria-hidden
          />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-bold text-emerald-800">
            {data.title}
          </span>
          {data.generatedAtLabel && (
            <span className="text-xs font-semibold leading-snug text-emerald-700/85">
              {data.generatedAtLabel}
            </span>
          )}
        </div>
        <span className="ml-auto shrink-0 rounded-md bg-emerald-700 px-3 py-1.5 font-mono text-xs font-semibold tracking-wide text-white">
          {data.packStatusBadge.label}
        </span>
      </div>
    </section>
  );
}

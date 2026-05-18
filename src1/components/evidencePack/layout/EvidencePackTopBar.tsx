import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { EVIDENCE_PACK_PREVIEW_COPY as COPY } from "@/features/legalReview/adapters/copy";
import type { EvidencePackTopBarData } from "../types";

interface Props {
  data: EvidencePackTopBarData;
}

export function EvidencePackTopBar({ data }: Props) {
  const lastIndex = data.trail.length - 1;
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 overflow-hidden bg-[#0A1F44] px-6 text-white shadow-sm">
      <span className="shrink-0 whitespace-nowrap font-display text-lg font-semibold tracking-tight">
        Praetion <span className="text-[#7BB4E2]">AI</span>
      </span>
      <span className="h-5 w-px shrink-0 bg-white/20" aria-hidden />
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-1 items-center gap-2 text-sm text-white/70"
      >
        {data.trail.map((item, i) => {
          const isLast = i === lastIndex;
          return (
            <Fragment key={`${i}-${item}`}>
              {i > 0 ? (
                <span aria-hidden className="hidden shrink-0 text-white/40 md:inline">
                  →
                </span>
              ) : null}
              <span
                className={cn(
                  isLast
                    ? "min-w-0 flex-1 truncate font-medium text-white"
                    : "hidden shrink-0 whitespace-nowrap md:inline",
                )}
              >
                {item}
              </span>
            </Fragment>
          );
        })}
      </nav>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <span className="shrink-0 whitespace-nowrap rounded-md border-[1.5px] border-white/40 bg-white/5 px-4 py-1.5 text-xs font-medium text-white">
          {data.roleLabel ?? COPY.topBarRoleLabel}
        </span>
        {data.workspaceLabel ? (
          <span className="shrink-0 whitespace-nowrap rounded-md border-[1.5px] border-white/40 bg-white/5 px-4 py-1.5 text-xs font-medium text-white">
            {data.workspaceLabel}
          </span>
        ) : null}
      </div>
    </header>
  );
}

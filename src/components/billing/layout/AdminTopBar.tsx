import { Fragment, type ReactNode } from "react";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { COPY } from "@/features/billing/adapters/copy";

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface AdminTopBarProps {
  title: string;
  breadcrumbs?: BreadcrumbSegment[];
  rightSlot?: ReactNode;
}

export function AdminTopBar({ title, breadcrumbs, rightSlot }: AdminTopBarProps) {
  return (
    <header className="border-b border-white/10 bg-[#0A1F44] px-6 py-4 text-white">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-white/60">
          <ShieldCheck className="h-4 w-4 text-amber-300" aria-hidden />
          <span>Praetion Admin</span>
          <span className="text-white/30">·</span>
          <span className="font-semibold text-amber-300">
            {COPY.superAdminTag}
          </span>
        </div>
        {breadcrumbs?.length ? (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-[12px] text-white/60"
          >
            <span className="text-white/30">|</span>
            {breadcrumbs.map((seg, i) => (
              <Fragment key={i}>
                {i > 0 && (
                  <ChevronRight className="h-3 w-3 text-white/30" aria-hidden />
                )}
                <span className={i === breadcrumbs.length - 1 ? "text-white/90" : ""}>
                  {seg.label}
                </span>
              </Fragment>
            ))}
          </nav>
        ) : null}
        <div className="ml-auto flex items-center gap-3">{rightSlot}</div>
      </div>
      <div className="mt-1.5 flex items-end gap-3">
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
          {COPY.superAdminTag}
        </span>
      </div>
    </header>
  );
}

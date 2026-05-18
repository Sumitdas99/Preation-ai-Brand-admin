import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type {
  EvidencePackSidebarData,
  EvidencePackSidebarItem,
  EvidencePackSidebarStatus,
} from "../types";

interface Props {
  data: EvidencePackSidebarData;
  activeKey?: string;
  onNavigate?: (item: EvidencePackSidebarItem) => void;
  onDownload?: (url: string) => void;
}

export function EvidencePackSidebar({
  data,
  activeKey,
  onNavigate,
  onDownload,
}: Props) {
  const handleDownload = () => {
    if (data.downloadDisabled || !data.downloadHref) return;
    if (onDownload) {
      onDownload(data.downloadHref);
      return;
    }
    const a = document.createElement("a");
    a.href = data.downloadHref;
    a.download = "evidence-pack.pdf";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-border bg-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <section className="border-b border-border pb-4 pl-3.5 pr-4 pt-3">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {data.header}
        </h3>
        <dl className="space-y-1.5 text-[13px]">
          {data.meta.map((row) => (
            <div
              key={`${row.label}-${row.value}`}
              className="flex items-baseline justify-between gap-3"
            >
              <dt className="shrink-0 font-bold text-muted-foreground">
                {row.label}
              </dt>
              <dd
                className={cn(
                  "min-w-0 truncate text-right font-semibold text-foreground",
                  row.tone === "mono" && "font-mono",
                )}
                title={row.value}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <nav aria-label="Evidence Pack sections" className="flex-1 px-2 py-3">
        <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {data.sectionsHeader}
        </h3>
        <ul className="space-y-0.5">
          {data.items.map((item) => {
            const isActive = activeKey === item.key;
            return (
              <li key={item.key}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate(item);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition",
                    isActive
                      ? "bg-slate-100 font-semibold text-foreground"
                      : "text-muted-foreground hover:bg-slate-50 hover:text-foreground",
                  )}
                >
                  <NumberMarker index={item.index} status={item.status} />
                  <span className="min-w-0 truncate">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {data.downloadLabel && (
        <div className="border-t border-border px-3 py-4">
          <Button
            type="button"
            onClick={handleDownload}
            disabled={data.downloadDisabled}
            className="w-full gap-2"
          >
            <Download className="h-4 w-4" aria-hidden />
            <span>{data.downloadLabel}</span>
          </Button>
        </div>
      )}
    </aside>
  );
}

const STATUS_COLORS: Record<
  NonNullable<EvidencePackSidebarStatus>,
  string
> = {
  complete: "bg-emerald-700 text-white",
  "not-applicable": "bg-slate-100 text-slate-500",
  "embed-failed": "bg-amber-100 text-amber-700",
  "force-pass": "bg-rose-100 text-rose-700",
  pending: "bg-slate-100 text-slate-400",
};

function NumberMarker({
  index,
  status,
}: {
  index: number;
  status?: EvidencePackSidebarStatus;
}) {
  const colors = STATUS_COLORS[status ?? "pending"];
  return (
    <span
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
        colors,
      )}
      aria-hidden
    >
      {index}
    </span>
  );
}

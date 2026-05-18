import { CheckCircle2 } from "lucide-react";
import { LEGAL_PREFLIGHT_COPY as COPY } from "@/features/legalReview/adapters/copy";
import type { LegalNumberedItem } from "../../types";

interface Props {
  items: LegalNumberedItem[];
}

export function LegalItemsResolvedCard({ items }: Props) {
  const resolved = items.filter((it) => it.resolved);
  if (resolved.length === 0) return null;

  return (
    <section className="pb-4 pl-3.5 pr-4 pt-3">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {COPY.itemsResolvedHeader}
      </h3>
      <div className="space-y-2">
        {resolved.map((item) => (
          <ResolvedChip key={item.id} label={item.resolvedLabel} />
        ))}
      </div>
    </section>
  );
}

function ResolvedChip({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[12px] font-bold text-emerald-700">
      <CheckCircle2
        className="h-3.5 w-3.5 shrink-0 text-emerald-600"
        strokeWidth={2.5}
        aria-hidden
      />
      <span className="truncate">{label}</span>
    </div>
  );
}

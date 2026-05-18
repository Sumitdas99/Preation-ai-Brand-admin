import { cn } from "@/lib/utils";
import type { PackType } from "@/api/schemas/billing";
import { PACK_TYPE_TAG } from "@/features/billing/adapters/copy";

const TAG_TONE: Record<PackType, string> = {
  TRIAL: "bg-amber-100 text-amber-900",
  ENTERPRISE: "bg-indigo-100 text-indigo-900",
  STANDARD: "bg-slate-200/80 text-slate-700",
};

interface OverrideTagProps {
  packType: PackType;
  className?: string;
}

export function OverrideTag({ packType, className }: OverrideTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        TAG_TONE[packType],
        className,
      )}
    >
      {PACK_TYPE_TAG[packType]}
    </span>
  );
}

import { cn } from "@/lib/utils";
import type { PackType } from "@/api/schemas/billing";
import { PACK_TYPE_TAG } from "@/features/billing/adapters/copy";

const TAG_TONE: Record<PackType, string> = {
  TRIAL: "bg-amber-50 text-amber-800 border-amber-200",
  ENTERPRISE: "bg-indigo-50 text-indigo-800 border-indigo-200",
  STANDARD: "bg-slate-100 text-slate-700 border-slate-200",
};

interface OverrideTagProps {
  packType: PackType;
  className?: string;
}

export function OverrideTag({ packType, className }: OverrideTagProps) {
  return (
    <code
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[11px] font-medium tracking-tight",
        TAG_TONE[packType],
        className,
      )}
    >
      {PACK_TYPE_TAG[packType]}
    </code>
  );
}

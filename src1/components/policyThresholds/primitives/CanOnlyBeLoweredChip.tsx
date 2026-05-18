import { cn } from "@/lib/utils";

export function CanOnlyBeLoweredChip({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600",
        className,
      )}
    >
      stricter only
    </span>
  );
}

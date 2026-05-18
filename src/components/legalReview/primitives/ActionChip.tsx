import { cn } from "@/lib/utils";

export function ActionChip({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm bg-blue-50 px-2 py-0.5 text-[12px] font-bold text-blue-800 transition-colors group-hover:bg-blue-100/80",
        className,
      )}
    >
      {label}
    </span>
  );
}

import { cn } from "@/lib/utils";
import { verdictTone } from "@/features/legalReview/adapters";

interface Props {
  verdict: string;
  className?: string;
}

const TONE: Record<ReturnType<typeof verdictTone>, string> = {
  red: "bg-red-50 text-red-800 group-hover:bg-red-100/80",
  amber: "bg-amber-50 text-amber-800 group-hover:bg-amber-100/80",
  green: "bg-emerald-50 text-emerald-800 group-hover:bg-emerald-100/80",
  neutral: "bg-slate-100 text-slate-700 group-hover:bg-slate-200/80",
};

export function VerdictBadge({ verdict, className }: Props) {
  const tone = verdictTone(verdict);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-[12px] font-bold transition-colors",
        TONE[tone],
        className,
      )}
    >
      {verdict}
    </span>
  );
}

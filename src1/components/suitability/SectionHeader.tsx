import {
  CheckCircle2,
  CircleAlert,
  Info,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SectionHeaderTone = "blocked" | "flagged" | "allowed" | "muted";

interface Props {
  title: string;
  tone: SectionHeaderTone;
  count?: number;
}

const TONES: Record<SectionHeaderTone, { icon: LucideIcon; color: string }> = {
  blocked: { icon: XCircle, color: "text-red-700" },
  flagged: { icon: CircleAlert, color: "text-amber-700" },
  allowed: { icon: CheckCircle2, color: "text-emerald-700" },
  muted: { icon: Info, color: "text-muted-foreground" },
};

export function SectionHeader({ title, tone, count }: Props) {
  const { icon: Icon, color } = TONES[tone];
  return (
    <div className="flex items-center gap-2">
      <Icon
        className={cn("h-[18px] w-[18px] shrink-0", color)}
        aria-hidden
        strokeWidth={2.5}
      />
      <h3 className="text-[15px] font-extrabold uppercase tracking-wider text-slate-700 [font-family:Arial,Helvetica,sans-serif]">
        {title}
      </h3>
      {typeof count === "number" ? (
        <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs font-extrabold tabular-nums text-slate-700 [font-family:Arial,Helvetica,sans-serif]">
          {count}
        </span>
      ) : null}
    </div>
  );
}

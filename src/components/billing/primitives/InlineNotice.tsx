import type { ReactNode } from "react";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type NoticeTone = "amber" | "info" | "success" | "danger";

const TONE: Record<
  NoticeTone,
  { container: string; icon: string; iconElement: ReactNode }
> = {
  amber: {
    container: "border-amber-200 bg-amber-50 text-amber-900",
    icon: "text-amber-600",
    iconElement: <AlertTriangle className="h-4 w-4" />,
  },
  info: {
    container: "border-sky-200 bg-sky-50 text-sky-900",
    icon: "text-sky-600",
    iconElement: <Info className="h-4 w-4" />,
  },
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: "text-emerald-600",
    iconElement: <CheckCircle2 className="h-4 w-4" />,
  },
  danger: {
    container: "border-rose-200 bg-rose-50 text-rose-900",
    icon: "text-rose-600",
    iconElement: <AlertTriangle className="h-4 w-4" />,
  },
};

interface InlineNoticeProps {
  tone?: NoticeTone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function InlineNotice({
  tone = "amber",
  title,
  children,
  className,
}: InlineNoticeProps) {
  const t = TONE[tone];
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs leading-relaxed",
        t.container,
        className,
      )}
    >
      <span className={cn("mt-0.5 shrink-0", t.icon)}>{t.iconElement}</span>
      <div className="min-w-0">
        {title ? (
          <div className="font-semibold text-[13px]">{title}</div>
        ) : null}
        {children ? <div className="text-[12px]">{children}</div> : null}
      </div>
    </div>
  );
}

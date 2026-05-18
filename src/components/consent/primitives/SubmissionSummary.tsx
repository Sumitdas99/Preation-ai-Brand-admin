import {
  CheckCircle2,
  Clock,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "emerald" | "amber" | "rose";

const TONE_ICONS: Record<Tone, LucideIcon> = {
  emerald: CheckCircle2,
  amber: Clock,
  rose: ShieldAlert,
};

export interface SummaryItem {
  term: string;
  detail?: string;
  mono?: boolean;
  title?: string;
}

interface Props {
  tone: Tone;
  heading: string;
  subtext?: React.ReactNode;
  items: SummaryItem[];
}

export function SubmissionSummary({ tone, heading, subtext, items }: Props) {
  const Icon = TONE_ICONS[tone];
  const visible = items.filter((i) => i.detail);
  return (
    <div className="rounded-md bg-slate-50 p-5">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200/70"
          aria-hidden
        >
          <Icon
            className="h-4 w-4 text-slate-600"
            strokeWidth={2.5}
          />
        </span>
        <h4 className="text-lg font-medium leading-none text-slate-600">
          {heading}
        </h4>
      </div>
      {subtext ? (
        <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
          {subtext}
        </p>
      ) : null}
      {visible.length > 0 ? (
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-xs sm:grid-cols-2">
          {visible.map((item) => (
            <SummaryItemRow
              key={item.term}
              term={item.term}
              detail={item.detail!}
              mono={item.mono}
              title={item.title}
            />
          ))}
        </dl>
      ) : null}
    </div>
  );
}

interface RowProps extends SummaryItem {
  detail: string;
}

function SummaryItemRow({ term, detail, mono, title }: RowProps) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
        {term}
      </dt>
      <dd
        title={title}
        className={cn(
          "leading-snug text-slate-700",
          mono
            ? "font-mono text-[11px] font-medium"
            : "text-xs font-bold",
        )}
      >
        {detail}
      </dd>
    </div>
  );
}

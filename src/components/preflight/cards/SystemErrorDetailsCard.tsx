import { cn } from "@/lib/utils";
import type { ErrorDetail, SystemErrorDetails } from "../types";

const ENUM_SHAPE = /^[A-Z][A-Z0-9_]+$/;

type Tone = NonNullable<ErrorDetail["tone"]>;

interface ToneStyle {
  card: string;
  border: string;
  label: string;
  value: string;
}

const TONES: Record<Tone, ToneStyle> = {
  warning: {
    card: "bg-amber-50",
    border: "border-amber-200",
    label: "text-amber-700",
    value: "text-amber-900",
  },
  muted: {
    card: "bg-slate-50",
    border: "border-slate-200",
    label: "text-slate-600",
    value: "text-slate-800",
  },
  success: {
    card: "bg-emerald-50",
    border: "border-emerald-200",
    label: "text-emerald-700",
    value: "text-emerald-900",
  },
};

interface Props {
  data: SystemErrorDetails;
}

export function SystemErrorDetailsCard({ data }: Props) {
  return (
    <div className="pb-4 pl-3.5 pr-4 pt-3">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        System Error Details
      </h3>

      <ul className="-ml-0.5 space-y-2">
        {data.blocks.map((block, i) => {
          const style = TONES[block.tone ?? "warning"];
          return (
            <li
              key={`${block.label}-${i}`}
              className={cn(
                "rounded-md border p-3",
                style.card,
                style.border,
              )}
            >
              <div
                className={cn(
                  "mb-1 text-xs font-bold uppercase tracking-wider",
                  style.label,
                )}
              >
                {block.label}
              </div>
              <p
                className={cn(
                  "text-[11.5px] font-semibold leading-snug",
                  style.value,
                  ENUM_SHAPE.test(block.value) && "break-all font-mono",
                )}
              >
                {block.value}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

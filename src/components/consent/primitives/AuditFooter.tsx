import { BadgeCheck, Clock, Loader2, OctagonAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type AuditFooterTone = "emerald" | "amber" | "rose";

interface Props {
  tone: AuditFooterTone;
  pendingHeading: string;
  pendingBody: string;
  readyHeading: string;
  readyBody: string;
  submitLabel: string;
  onSubmit?: () => void;
  submitting?: boolean;
  submitDisabled?: boolean;
}

interface ToneVisuals {
  icon: LucideIcon;
  panel: string;
  iconWrap: string;
  iconColor: string;
  heading: string;
  body: string;
}

const TONE_VISUALS: Record<AuditFooterTone, ToneVisuals> = {
  emerald: {
    icon: BadgeCheck,
    panel: "bg-emerald-50/50",
    iconWrap: "bg-emerald-100/80 ring-1 ring-inset ring-emerald-200/70",
    iconColor: "text-emerald-700",
    heading: "text-emerald-900",
    body: "text-emerald-800/80",
  },
  amber: {
    icon: Clock,
    panel: "bg-amber-50/50",
    iconWrap: "bg-amber-100/80 ring-1 ring-inset ring-amber-200/70",
    iconColor: "text-amber-700",
    heading: "text-amber-900",
    body: "text-amber-800/80",
  },
  rose: {
    icon: OctagonAlert,
    panel: "bg-rose-50/50",
    iconWrap: "bg-rose-100/80 ring-1 ring-inset ring-rose-200/70",
    iconColor: "text-rose-700",
    heading: "text-rose-900",
    body: "text-rose-800/80",
  },
};

export function AuditFooter({
  tone,
  pendingHeading,
  pendingBody,
  readyHeading,
  readyBody,
  submitLabel,
  onSubmit,
  submitting,
  submitDisabled,
}: Props) {
  const isReady = !submitDisabled;
  const v = TONE_VISUALS[tone];
  const Icon = v.icon;
  const heading = isReady ? readyHeading : pendingHeading;
  const body = isReady ? readyBody : pendingBody;
  const buttonDisabled = submitDisabled || submitting;

  return (
    <footer>
      <div className="-mx-5 mb-4 border-t border-slate-100" />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:justify-between lg:gap-4">
        <div
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3.5 rounded-md px-4 py-3.5",
            v.panel,
          )}
        >
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
              v.iconWrap,
            )}
          >
            <Icon
              className={cn("h-[20px] w-[20px]", v.iconColor)}
              strokeWidth={2.5}
              aria-hidden
            />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <h3
              className={cn(
                "text-[14px] font-semibold leading-tight",
                v.heading,
              )}
            >
              {heading}
            </h3>
            <p
              className={cn(
                "text-[12.5px] font-semibold leading-relaxed",
                v.body,
              )}
            >
              {body}
            </p>
          </div>
        </div>

        <button
          type="submit"
          onClick={onSubmit}
          disabled={buttonDisabled}
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 self-stretch rounded-md border px-5 py-3 text-[15px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 lg:self-auto",
            buttonDisabled
              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
              : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Submitting…
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </footer>
  );
}

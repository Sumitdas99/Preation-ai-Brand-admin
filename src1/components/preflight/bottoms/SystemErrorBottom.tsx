import {
  CheckCircle2,
  Clock,
  Hash,
  Info,
  RefreshCw,
  Shield,
  ShieldAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  ErrorMeta,
  ErrorPanel as ErrorPanelData,
  PreFlightData,
} from "../types";

const META_ICONS: Record<ErrorMeta["icon"], LucideIcon> = {
  clock: Clock,
  hash: Hash,
  check: CheckCircle2,
  shield: Shield,
};

interface Props {
  data: PreFlightData;
}

export function SystemErrorBottom({ data }: Props) {
  if (data.verdict.kind !== "system-error") return null;
  const { panel } = data.verdict;

  return (
    <section className="space-y-4 px-6 py-5">
      <StraplineTag text={panel.strapline} />
      <ErrorPanelCard panel={panel} />
    </section>
  );
}

function StraplineTag({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
      <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {text}
    </div>
  );
}

function ErrorPanelCard({ panel }: { panel: ErrorPanelData }) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50/60 p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="rounded-full border border-amber-300 bg-amber-100 p-2.5">
          <ShieldAlert className="h-5 w-5 text-amber-700" aria-hidden />
        </div>
        <h2 className="text-xl font-medium leading-tight text-amber-900">
          {panel.title}
        </h2>
        <p className="max-w-3xl text-base font-semibold leading-relaxed text-amber-900/90">
          {panel.description}
        </p>
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          {panel.retryLabel}
        </button>
      </div>

      <hr className="mx-4 my-6 border-t-2 border-amber-200" />

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-bold text-amber-900/85">
        {panel.meta.map((item, i) => (
          <MetaItem key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

function MetaItem({ item }: { item: ErrorMeta }) {
  const Icon = META_ICONS[item.icon];
  return (
    <span className="inline-flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-amber-700/80" aria-hidden />
      {item.label}
    </span>
  );
}

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Banner, BannerTone } from "../types";

interface ToneStyle {
  container: string;
  iconWrap: string;
  icon: string;
  title: string;
  description: string;
  tag: string;
}

const TONES: Record<BannerTone, ToneStyle> = {
  "in-progress": {
    container: "bg-slate-100 border-slate-300",
    iconWrap: "bg-slate-200",
    icon: "text-slate-700",
    title: "text-slate-800",
    description: "text-slate-700/85",
    tag: "bg-slate-700 text-white",
  },
  block: {
    container: "bg-red-50 border-red-500",
    iconWrap: "bg-red-100",
    icon: "text-red-600",
    title: "text-red-900",
    description: "text-red-700/90",
    tag: "bg-red-600 text-white",
  },
  challenge: {
    container: "bg-red-50 border-red-500",
    iconWrap: "bg-red-100",
    icon: "text-red-600",
    title: "text-red-900",
    description: "text-red-700/90",
    tag: "bg-red-600 text-white",
  },
  "system-error": {
    container: "bg-amber-50 border-amber-500",
    iconWrap: "bg-amber-100",
    icon: "text-amber-700",
    title: "text-amber-800",
    description: "text-amber-700/85",
    tag: "bg-amber-600 text-white",
  },
  "allow-warnings": {
    container: "bg-amber-50 border-amber-500",
    iconWrap: "bg-amber-100",
    icon: "text-amber-700",
    title: "text-amber-800",
    description: "text-amber-700/85",
    tag: "bg-amber-600 text-white",
  },
  allow: {
    container: "bg-emerald-50 border-emerald-500",
    iconWrap: "bg-emerald-100",
    icon: "text-emerald-600",
    title: "text-emerald-800",
    description: "text-emerald-700/85",
    tag: "bg-emerald-700 text-white",
  },
  "approved-pending-proof": {
    container: "bg-emerald-50 border-emerald-500",
    iconWrap: "bg-emerald-100",
    icon: "text-emerald-600",
    title: "text-emerald-800",
    description: "text-emerald-700/85",
    tag: "bg-emerald-700 text-white",
  },
  "publish-cleared": {
    container: "bg-emerald-50 border-emerald-500",
    iconWrap: "bg-emerald-100",
    icon: "text-emerald-600",
    title: "text-emerald-800",
    description: "text-emerald-700/85",
    tag: "bg-emerald-700 text-white",
  },
  "legal-under-review": {
    container: "bg-emerald-50 border-emerald-500",
    iconWrap: "bg-emerald-100",
    icon: "text-emerald-600",
    title: "text-emerald-800",
    description: "text-emerald-700/85",
    tag: "bg-emerald-700 text-white",
  },
  "legal-ready-to-attest": {
    container: "bg-emerald-50 border-emerald-500",
    iconWrap: "bg-emerald-100",
    icon: "text-emerald-600",
    title: "text-emerald-800",
    description: "text-emerald-700/85",
    tag: "bg-emerald-700 text-white",
  },
  "legal-hard-block": {
    container: "bg-red-50 border-red-500",
    iconWrap: "bg-red-100",
    icon: "text-red-600",
    title: "text-red-900",
    description: "text-red-700/90",
    tag: "bg-red-600 text-white",
  },
  "legal-attestation-complete": {
    container: "bg-emerald-50 border-emerald-500",
    iconWrap: "bg-emerald-100",
    icon: "text-emerald-600",
    title: "text-emerald-800",
    description: "text-emerald-700/85",
    tag: "bg-emerald-700 text-white",
  },
};

const ICONS: Record<BannerTone, LucideIcon> = {
  "in-progress": Loader2,
  block: AlertTriangle,
  challenge: AlertCircle,
  "system-error": AlertCircle,
  "allow-warnings": AlertTriangle,
  allow: CheckCircle2,
  "approved-pending-proof": CheckCircle2,
  "publish-cleared": CheckCircle2,
  "legal-under-review": CheckCircle2,
  "legal-ready-to-attest": CheckCircle2,
  "legal-hard-block": ShieldAlert,
  "legal-attestation-complete": CheckCircle2,
};

interface Props {
  data: Banner;
}

export function StageBanner({ data }: Props) {
  const { tone, title, description, tag } = data;
  const style = TONES[tone];
  const Icon = ICONS[tone];
  const isInProgress = tone === "in-progress";

  return (
    <section
      role="status"
      aria-live={isInProgress ? "polite" : "off"}
      className={cn(
        "relative shrink-0 overflow-hidden border-b-2",
        style.container,
      )}
    >
      {isInProgress && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.7)_50%,transparent_100%)] bg-[length:200%_100%] animate-shimmer"
        />
      )}

      <div className="relative flex min-h-16 items-center gap-3 px-6 py-2.5">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            style.iconWrap,
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              style.icon,
              isInProgress && "animate-spin",
            )}
            aria-hidden
          />
        </div>

        <div className="flex min-w-0 flex-col gap-0.5">
          <span
            className={cn(
              "flex items-center text-sm font-bold",
              style.title,
            )}
          >
            {title}
            {isInProgress && <AnimatedEllipsis />}
          </span>
          <span
            className={cn(
              "text-xs font-semibold leading-snug line-clamp-2",
              style.description,
            )}
          >
            {description}
          </span>
        </div>

        <span
          className={cn(
            "ml-auto shrink-0 rounded-md px-3 py-1.5 font-mono text-xs font-semibold tracking-wide",
            style.tag,
          )}
        >
          {tag}
        </span>
      </div>
    </section>
  );
}

function AnimatedEllipsis() {
  return (
    <span aria-hidden className="ml-0.5 inline-flex">
      <span className="animate-pulse [animation-delay:0ms]">.</span>
      <span className="animate-pulse [animation-delay:200ms]">.</span>
      <span className="animate-pulse [animation-delay:400ms]">.</span>
    </span>
  );
}

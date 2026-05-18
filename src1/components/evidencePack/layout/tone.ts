import type { EvidencePackSectionTone } from "../types";

export type ToneSlot = "badge" | "pill" | "solid" | "dot";

const BADGE_CLASSES: Record<EvidencePackSectionTone, string> = {
  complete: "border-emerald-300/60 bg-emerald-50 text-emerald-700",
  warning: "border-amber-300/60 bg-amber-50 text-amber-800",
  muted: "border-slate-200 bg-slate-50 text-slate-600",
  danger: "border-rose-300/60 bg-rose-50 text-rose-700",
  approved: "border-emerald-300/60 bg-emerald-50 text-emerald-800",
  "force-pass": "border-rose-400/70 bg-rose-100 text-rose-800",
};

const PILL_CLASSES: Record<EvidencePackSectionTone, string> = {
  complete: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  muted: "bg-slate-100 text-slate-700",
  danger: "bg-rose-100 text-rose-800",
  approved: "bg-emerald-100 text-emerald-800",
  "force-pass": "bg-rose-200 text-rose-900",
};

const SOLID_CLASSES: Record<EvidencePackSectionTone, string> = {
  complete: "bg-emerald-600 text-white",
  warning: "bg-amber-500 text-white",
  muted: "bg-slate-500 text-white",
  danger: "bg-rose-600 text-white",
  approved: "bg-emerald-600 text-white",
  "force-pass": "bg-rose-600 text-white",
};

const DOT_CLASSES: Record<EvidencePackSectionTone, string> = {
  complete: "bg-emerald-500",
  warning: "bg-amber-500",
  muted: "bg-slate-300",
  danger: "bg-rose-500",
  approved: "bg-emerald-500",
  "force-pass": "bg-rose-600",
};

export function sectionToneClasses(
  tone: EvidencePackSectionTone,
  slot: ToneSlot,
): string {
  switch (slot) {
    case "badge":
      return BADGE_CLASSES[tone];
    case "pill":
      return PILL_CLASSES[tone];
    case "solid":
      return SOLID_CLASSES[tone];
    case "dot":
      return DOT_CLASSES[tone];
  }
}

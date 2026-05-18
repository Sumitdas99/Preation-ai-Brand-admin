import { AlertCircle } from "lucide-react";
import type { ConsentTriggerType } from "@/api/schemas/consent";
import type { BriefingVM } from "../types";

interface TriggerTone {
  border: string;
  bg: string;
  text: string;
}

const TRIGGER_TONES: Record<ConsentTriggerType, TriggerTone> = {
  TRIGGER_RPL_CONSENT_REQUIRED: {
    border: "#EDB9B3",
    bg: "#FDF1F1",
    text: "#CD5E53",
  },
  TRIGGER_HUMAN_PRESENCE: {
    border: "#F3DB9D",
    bg: "#FEF8EB",
    text: "#80580D",
  },
};

export function Briefing({ data }: { data: BriefingVM }) {
  if (!data.visible) return null;

  return (
    <section>
      <div className="overflow-hidden rounded-b-md bg-card shadow-sm [contain:layout_paint]">
        <div className="h-1 bg-[#B7770D]" aria-hidden />
        <div className="rounded-b-md border-x-[1.25px] border-b-[1.25px] border-slate-200 px-6 py-5">
          <div className="flex items-start gap-4">
            <div
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#B7770D]"
            >
              <AlertCircle
                className="h-5 w-5 text-white"
                strokeWidth={2.25}
              />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <h2 className="text-xl font-bold leading-tight text-[#80580D]">
                {data.title}
              </h2>
              <p className="text-sm font-bold leading-relaxed text-[#B7770D]">
                {data.body}
              </p>
            </div>
          </div>

          {data.triggers.length > 0 ? (
            <ul className="mt-4 flex flex-col items-start gap-1.5">
              {data.triggers.map((t) => {
                const tone = TRIGGER_TONES[t.code];
                return (
                  <li
                    key={t.code}
                    className="inline-flex max-w-full flex-wrap items-center gap-x-2 rounded-sm border px-2.5 py-1 font-mono text-[11px] font-bold leading-tight"
                    style={{ borderColor: tone.border, backgroundColor: tone.bg }}
                  >
                    <span
                      className="tracking-tight"
                      style={{ color: tone.text }}
                    >
                      {t.code}
                    </span>
                    <span
                      aria-hidden
                      style={{ color: tone.text, opacity: 0.7 }}
                    >
                      —
                    </span>
                    <span style={{ color: tone.text }}>{t.description}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

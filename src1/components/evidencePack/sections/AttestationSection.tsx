import { CheckCircle2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionShell } from "../layout/SectionShell";
import type { EvidencePackSectionData } from "../types";

interface Props {
  section: EvidencePackSectionData;
}

export function AttestationSection({ section }: Props) {
  if (section.body.kind !== "attestation_page") return null;
  const {
    header,
    keyValues,
    typedSignature,
    declarationText,
    overrideCommentary,
    overrideCommentaryHeader,
    isForcePass,
    forcePassBadgeLabel,
  } = section.body;

  return (
    <SectionShell data={section.shell}>
      <div className="overflow-hidden rounded-lg border-[1.25px] border-slate-200 shadow-sm [contain:layout_paint]">
        <header
          className={cn(
            "flex items-start gap-3 px-6 py-3",
            isForcePass ? "bg-rose-100" : "bg-emerald-100",
          )}
        >
          {isForcePass ? (
            <ShieldAlert className="mt-[3px] h-5 w-5 shrink-0 text-rose-700" strokeWidth={2.5} aria-hidden />
          ) : (
            <CheckCircle2 className="mt-[3px] h-5 w-5 shrink-0 text-emerald-700" strokeWidth={2.5} aria-hidden />
          )}
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3
              className={cn(
                "text-lg font-medium",
                isForcePass ? "text-rose-900" : "text-emerald-900",
              )}
            >
              {header}
            </h3>
            {isForcePass && forcePassBadgeLabel ? (
              <span className="shrink-0 whitespace-nowrap rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {forcePassBadgeLabel}
              </span>
            ) : null}
          </div>
        </header>

        <div
          className={cn(
            "border-t",
            isForcePass ? "border-rose-300/40" : "border-emerald-300/40",
          )}
        />

        <div
          className={cn(
            "space-y-4 px-6 py-5",
            isForcePass ? "bg-rose-50" : "bg-emerald-50",
          )}
        >
          <div
            className={cn(
              "grid gap-3 rounded-md border bg-white px-4 py-3 sm:grid-cols-2",
              isForcePass ? "border-rose-200" : "border-emerald-200",
            )}
          >
            {keyValues.map((kv, i) => (
              <div key={`${kv.label}-${i}`} className="space-y-0.5">
                <p
                  className={cn(
                    "text-xs font-extrabold uppercase tracking-wider",
                    isForcePass ? "text-rose-800" : "text-emerald-800",
                  )}
                >
                  {kv.label}
                </p>
                <p
                  className={cn(
                    "truncate text-sm font-bold text-foreground",
                    kv.tone === "mono" && "font-mono",
                  )}
                  title={kv.truncate ? kv.value : undefined}
                >
                  {kv.value}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground/85">
              Typed signature
            </p>
            <div
              className={cn(
                "rounded-md border bg-white px-4 py-3",
                isForcePass ? "border-rose-200" : "border-emerald-200",
              )}
            >
              <p className="font-display text-2xl italic tracking-tight text-foreground">
                {typedSignature}
              </p>
            </div>
          </div>

          {declarationText ? (
            <div
              className={cn(
                "rounded-md px-4 py-3",
                isForcePass ? "bg-rose-100/70" : "bg-emerald-100/70",
              )}
            >
              <p className="text-sm font-semibold leading-relaxed text-foreground">
                {declarationText}
              </p>
            </div>
          ) : null}

          {overrideCommentary ? (
            <div className="rounded-md border border-rose-200 bg-rose-50/80 px-4 py-3">
              <p className="text-xs font-extrabold uppercase tracking-wider text-rose-700">
                {overrideCommentaryHeader ?? "Override commentary"}
              </p>
              <p className="mt-2 text-sm italic leading-relaxed text-rose-900">
                &ldquo;{overrideCommentary}&rdquo;
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
}

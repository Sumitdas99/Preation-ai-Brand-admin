import { ArrowRight, Check as CheckIcon, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LEGAL_PREFLIGHT_COPY as COPY } from "@/features/legalReview/adapters/copy";
import type { LegalView } from "../../types";

interface Props {
  legal: LegalView;
  onReturnToQueue: () => void;
}

export function LegalPostAttestationBottom({ legal, onReturnToQueue }: Props) {
  const navigate = useNavigate();
  if (!legal.attestationRecord) return null;
  const record = legal.attestationRecord;

  const isProofPending =
    record.disclosurePathLabel.includes("APPROVED_PENDING_PROOF");
  const nextItems = isProofPending
    ? COPY.postSuccessNextItemsProofPending
    : COPY.postSuccessNextItems;

  const hasEvidencePack = Boolean(legal.evidencePackId);
  const handleViewPack = () => {
    if (legal.evidencePackId) {
      navigate(`/evidence/${legal.evidencePackId}/preview`);
    }
  };

  return (
    <section className="space-y-6 pb-3">
      <div className="px-6 pt-8">
        <div className="rounded-r-md border-l-4 border-l-emerald-600 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600"
              aria-hidden
            >
              <CheckIcon className="h-3 w-3 text-white" strokeWidth={3} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-bold text-emerald-900">
                {COPY.postSuccessTitle}
              </div>
              <p className="mt-1 text-[13px] font-semibold leading-relaxed text-foreground/80">
                {COPY.postSuccessBody(COPY.postSuccessReviewedTodayLabel)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <section className="overflow-hidden rounded-lg border border-slate-200/80 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_8px_-2px_rgba(15,23,42,0.06)]">
          <header className="flex items-center gap-3 border-b border-slate-200/70 bg-slate-50/60 px-6 py-3.5">
            <h2 className="text-xl font-semibold leading-none text-slate-600">
              {COPY.postSuccessAttestationRecordTitle}
            </h2>
          </header>

          <dl className="divide-y divide-slate-200/40">
            <RecordRow label={COPY.postSuccessFieldAsset} value={record.asset} />
            <RecordRow
              label={COPY.postSuccessFieldApprovalId}
              value={record.approvalId}
              mono
            />
            <RecordRow
              label={COPY.postSuccessFieldAttestedBy}
              value={`${record.attestedByName}, ${record.attestedByRole}`}
            />
            <RecordRow
              label={COPY.postSuccessFieldAttestedAt}
              value={record.attestedAtLabel}
            />
            <RecordRow
              label={COPY.postSuccessFieldAttestationId}
              value={record.attestationId}
              mono
            />
            <RecordRow
              label={COPY.postSuccessFieldDisclosurePath}
              value={record.disclosurePathLabel}
              tone="emerald"
            />
          </dl>
        </section>
      </div>

      <hr className="border-t border-border" />

      <div className="px-6 pb-4">
        <header className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {COPY.postSuccessNextHeader}
          </h2>
        </header>

        <div className="space-y-4 rounded-md border border-border bg-card p-5 shadow-sm">
          <div className="text-[12px] font-extrabold uppercase tracking-wider text-muted-foreground">
            {COPY.postSuccessNextStatusLabel}
          </div>

          <ul className="space-y-2.5">
            {nextItems.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[13.5px] font-semibold leading-relaxed text-foreground/85"
              >
                <span
                  aria-hidden
                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {hasEvidencePack && (
            <Button
              type="button"
              onClick={handleViewPack}
              className="h-10 bg-emerald-700 font-semibold text-white hover:bg-emerald-800 focus-visible:ring-emerald-700"
            >
              <FileText className="h-4 w-4" aria-hidden />
              {COPY.postSuccessViewEvidencePackCta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="overflow-hidden rounded-lg border border-border">
          <button
            type="button"
            onClick={onReturnToQueue}
            className={cn(
              "group flex w-full items-start gap-4 px-4 py-3.5 text-left",
              "bg-card transition-colors hover:bg-muted/60",
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">
                {COPY.postSuccessReturnCta}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                {COPY.postSuccessReturnHintA} {COPY.postSuccessReturnHintB}
              </span>
            </span>
            <ArrowRight
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
              aria-hidden
            />
          </button>
        </div>
      </div>
    </section>
  );
}

interface RecordRowProps {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "emerald";
}

function RecordRow({ label, value, mono, tone }: RecordRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-6",
      )}
    >
      <dt className="shrink-0 text-[13px] font-extrabold uppercase tracking-wider text-muted-foreground sm:w-[180px]">
        {label}
      </dt>
      <dd
        className={cn(
          "min-w-0 flex-1 sm:text-right",
          tone === "emerald"
            ? "text-sm font-semibold text-emerald-700"
            : mono
              ? "font-mono text-sm font-semibold tracking-tight text-foreground"
              : "text-sm font-semibold leading-relaxed text-foreground",
        )}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

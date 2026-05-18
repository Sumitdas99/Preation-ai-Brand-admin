import type { ReactNode } from "react";
import type { ProofAttestationStrip } from "./types";

interface Props {
  data: ProofAttestationStrip;
}

export function AttestationStrip({ data }: Props) {
  const placementBits = [
    data.placementLabel,
    data.scopeLabel,
    data.modalityLabel,
  ].filter(Boolean) as string[];

  return (
    <section className="border-y-2 border-emerald-500 bg-emerald-50">
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-center gap-x-7 gap-y-3 px-6 py-5 text-sm leading-tight text-emerald-900">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-bold text-emerald-700">
          <Check className="h-3.5 w-3.5 shrink-0" />
          Legal approval confirmed
        </span>

        {data.attestationId ? (
          <Field label="ID">
            <code className="rounded-sm border border-emerald-300/70 bg-white/70 px-1.5 py-0.5 font-mono text-[12px] font-[650] tracking-tight text-emerald-900">
              {data.attestationId}
            </code>
          </Field>
        ) : null}

        {data.approver ? (
          <Field label="By">
            <span className="text-sm font-[650] text-emerald-900">
              {data.approver}
              {data.approverRole ? `, ${data.approverRole}` : ""}
            </span>
          </Field>
        ) : null}

        {data.attestedAt ? (
          <Field label="On">
            <span className="text-sm font-[650] text-emerald-900">{data.attestedAt}</span>
          </Field>
        ) : null}

        {placementBits.length > 0 ? (
          <Field label="Placement">
            <span className="text-sm font-[650] text-emerald-900">{placementBits.join(" · ")}</span>
          </Field>
        ) : null}
      </div>
    </section>
  );
}

interface FieldProps {
  label: string;
  children: ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-emerald-700">
        {label}
      </span>
      {children}
    </span>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M4 13.5l5 5L21 5" />
    </svg>
  );
}

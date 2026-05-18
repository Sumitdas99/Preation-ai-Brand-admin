import { cn } from "@/lib/utils";
import type { PolicyReferenceView } from "./types";
import { SUITABILITY_DETAIL_COPY } from "@/features/suitability/adapters/copy";

interface Props {
  data: PolicyReferenceView;
}

export function PolicyReferenceCard({ data }: Props) {
  const rows: RowDef[] = [
    {
      label: SUITABILITY_DETAIL_COPY.policyRuleIdLabel,
      value: <Mono>{data.ruleId}</Mono>,
    },
    {
      label: SUITABILITY_DETAIL_COPY.policyPolicyPackLabel,
      value: <Mono>{data.policyPackLabel}</Mono>,
    },
    {
      label: SUITABILITY_DETAIL_COPY.policyThresholdSourceLabel,
      value: <ValueText>{data.thresholdSourceText}</ValueText>,
    },
    {
      label: SUITABILITY_DETAIL_COPY.policyAppliedToLabel,
      value: (
        <ul className="flex flex-col items-end gap-0.5">
          {data.appliedTo.map((row, i) => (
            <li key={`${row.field}-${i}`} className="text-right">
              <ValueText>
                {row.field} {row.thresholds}
              </ValueText>
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: SUITABILITY_DETAIL_COPY.policyEvidencePackLabel,
      value: <ValueText>{data.evidencePackRef}</ValueText>,
      alignTop: true,
    },
  ];

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200/80 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_8px_-2px_rgba(15,23,42,0.06)]">
      <header className="border-b border-slate-200/70 px-4 py-2">
        <h2 className="text-[15px] font-extrabold uppercase tracking-wider text-slate-700 [font-family:Arial,Helvetica,sans-serif]">
          {SUITABILITY_DETAIL_COPY.policyHeader}
        </h2>
      </header>

      <dl className="divide-y divide-slate-200/40">
        {rows.map((row) => (
          <Row
            key={row.label}
            label={row.label}
            value={row.value}
            alignTop={row.alignTop}
          />
        ))}
      </dl>
    </section>
  );
}

interface RowDef {
  label: string;
  value: React.ReactNode;
  alignTop?: boolean;
}

function Row({ label, value, alignTop }: RowDef) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:gap-6",
        alignTop ? "sm:items-start" : "sm:items-center",
      )}
    >
      <dt className="shrink-0 text-[13px] font-extrabold uppercase tracking-wider text-muted-foreground sm:w-[180px]">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 sm:text-right">{value}</dd>
    </div>
  );
}

const VALUE_TYPE_CLASSES = "text-sm font-semibold text-foreground";

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className={cn("font-mono tracking-tight", VALUE_TYPE_CLASSES)}>
      {children}
    </code>
  );
}

function ValueText({ children }: { children: React.ReactNode }) {
  return (
    <span className={cn("leading-relaxed", VALUE_TYPE_CLASSES)}>
      {children}
    </span>
  );
}

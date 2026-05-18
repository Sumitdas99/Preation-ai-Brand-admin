import { ArrowDown, FileText, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePreFlightActions } from "@/features/preflight/actions/PreFlightActionsContext";
import type { EvidencePackPanel } from "../types";

interface Props {
  data: EvidencePackPanel;
}

export function EvidencePackCard({ data }: Props) {
  const navigate = useNavigate();
  const { onAction, pendingAction, disabledActions } = usePreFlightActions();
  const id = "download-evidence-pack";
  const isPending = pendingAction === id;
  const isDisabled = disabledActions.has(id) || Boolean(pendingAction);

  const handleDownload = () => {
    if (data.packId) {
      navigate(`/evidence/${data.packId}/preview`);
    } else {
      onAction(id, { id, label: data.downloadLabel, primary: true });
    }
  };

  return (
    <section className="border-b border-border px-6 py-5">
      <header className="mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {data.sectionTitle}
        </h2>
      </header>

      <div className="rounded-md border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#0f1d3b] text-white"
            aria-hidden
          >
            <FileText className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <div
              className="truncate text-base font-bold text-foreground [font-family:Arial,Helvetica,sans-serif]"
              title={data.documentTitle}
            >
              {data.documentTitle}
            </div>
            <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
              {data.documentSubtitle}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          {data.metaFields.map((field) => (
            <div
              key={field.label}
              className="min-w-0 rounded-md border border-border bg-muted/30 px-3 py-2.5"
            >
              <dt className="mb-0.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                {field.label}
              </dt>
              <dd
                className="truncate text-[13px] font-semibold tracking-tight text-foreground"
                title={field.value}
              >
                {field.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 flex-1 text-xs font-semibold leading-relaxed text-muted-foreground">
            {data.footerText}
          </p>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={isDisabled || (!data.downloadUrl && !data.packId)}
            className={cn(
              "shrink-0 self-start text-sm font-bold sm:self-auto",
              "bg-[#0f1d3b] text-white hover:bg-[#1a2c52]",
              "focus-visible:ring-[#0f1d3b]",
            )}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <ArrowDown className="h-4 w-4" aria-hidden />
            )}
            {data.downloadLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}

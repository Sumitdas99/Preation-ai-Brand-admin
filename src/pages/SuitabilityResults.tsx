import { Fragment, useEffect, useId, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AllowedSummaryCard,
  AssetContextStrip,
  CategoryRow,
  ReviewerActionsPanel,
  ReviewerCompletePanel,
  SectionHeader,
  VerdictBanner,
  WithdrawAssetDialog,
} from "@/components/suitability";
import type { SuitabilityResultsPageData } from "@/components/suitability/types";
import { SuitabilityErrorScreen } from "@/features/suitability/components/SuitabilityErrorScreen";
import { SuitabilitySkeleton } from "@/features/suitability/components/SuitabilitySkeleton";
import { DevSuitabilityPanel } from "@/features/suitability/components/DevSuitabilityPanel";
import {
  SUITABILITY_RESULTS_COPY,
  toResultsData,
} from "@/features/suitability/adapters";
import { useAcceptFlagged, useSuitabilityResults, useWithdraw } from "@/features/suitability/hooks";
import type {
  AcceptFlaggedFormValues,
  WithdrawFormValues,
} from "@/features/suitability/forms/suitabilityFormSchemas";
import { cn } from "@/lib/utils";

export default function SuitabilityResults() {
  const { runId } = useParams<{ runId: string }>();

  useEffect(() => {
    document.title = "Brand Suitability · Praetion AI";
  }, []);

  const { results, isPending, error, refetch } = useSuitabilityResults(runId);

  if (!runId) {
    return (
      <SuitabilityErrorScreen
        error={new Error("Pre-Flight run id missing from URL")}
        onRetry={() => window.history.back()}
      />
    );
  }

  if (isPending || !results) {
    if (error) {
      return (
        <SuitabilityErrorScreen
          error={error}
          onRetry={refetch}
          runId={runId}
        />
      );
    }
    return (
      <>
        <SuitabilitySkeleton />
        <DevSuitabilityPanel runId={runId} />
      </>
    );
  }

  if (error) {
    return (
      <SuitabilityErrorScreen error={error} onRetry={refetch} runId={runId} />
    );
  }

  return (
    <>
      <PageBody data={toResultsData(results)} runId={runId} />
      <DevSuitabilityPanel runId={runId} />
    </>
  );
}

interface PageBodyProps {
  data: SuitabilityResultsPageData;
  runId: string;
}

function PageBody({ data, runId }: PageBodyProps) {
  const navigate = useNavigate();
  const formId = useId();

  const acceptMutation = useAcceptFlagged({ runId });
  const withdrawMutation = useWithdraw({ runId });

  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const handleAcceptSubmit = (values: AcceptFlaggedFormValues) => {
    acceptMutation.mutate(values);
  };

  const handleWithdrawConfirm = (values: WithdrawFormValues) => {
    withdrawMutation.mutate(values, {
      onSuccess: () => setWithdrawOpen(false),
    });
  };

  const handleBack = () => navigate(`/preflight/${runId}`);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <TopBar
        assetFilename={data.topBar.assetFilename}
        workspace={data.topBar.workspaceLabel}
      />

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-[1080px] space-y-5">
          <AssetContextStrip data={data.contextStrip} />

          <VerdictBanner data={data.verdict} />

          {data.blockedRows.length > 0 ? (
            <section className="space-y-3">
              <SectionHeader
                title={SUITABILITY_RESULTS_COPY.sectionBlockedTitle}
                tone="blocked"
                count={data.blockedRows.length}
              />
              <div className="space-y-3">
                {data.blockedRows.map((row) => (
                  <CategoryRow key={row.categoryKey} row={row} />
                ))}
              </div>
            </section>
          ) : null}

          {data.flaggedRows.length > 0 ? (
            <section className="space-y-3">
              <SectionHeader
                title={SUITABILITY_RESULTS_COPY.sectionFlaggedTitle}
                tone="flagged"
                count={data.flaggedRows.length}
              />
              <div className="space-y-3">
                {data.flaggedRows.map((row) => (
                  <CategoryRow key={row.categoryKey} row={row} />
                ))}
              </div>
            </section>
          ) : null}

          {data.allowed.count > 0 ? (
            <AllowedSummaryCard data={data.allowed} />
          ) : null}

          {data.actions.allClear ? (
            <ReviewerCompletePanel
              headerLabel={SUITABILITY_RESULTS_COPY.reviewerActionsHeader}
              backCta={SUITABILITY_RESULTS_COPY.backToPreflightCta}
              onBack={handleBack}
              allowedCount={data.allowed.count}
              policyPackLabel={data.contextStrip.policyPackLabel}
              thresholdStandardLabel={
                data.contextStrip.geoPresetLabel ?? data.contextStrip.geoLabel
              }
              evaluatedAtLabel={data.contextStrip.evaluatedAtLabel}
            />
          ) : (
            <ReviewerActionsPanel
              data={data.actions}
              copy={{
                headerLabel: SUITABILITY_RESULTS_COPY.reviewerActionsHeader,
                notesPlaceholder:
                  SUITABILITY_RESULTS_COPY.reviewerNotesPlaceholder,
                declarationLabel:
                  SUITABILITY_RESULTS_COPY.reviewerDeclaration,
                backCta: SUITABILITY_RESULTS_COPY.backToPreflightCta,
                withdrawCta: SUITABILITY_RESULTS_COPY.withdrawCta,
                withdrawCtaSubmitting:
                  SUITABILITY_RESULTS_COPY.withdrawCtaSubmitting,
                acceptCta: SUITABILITY_RESULTS_COPY.acceptCta,
                acceptCtaSubmitting:
                  SUITABILITY_RESULTS_COPY.acceptCtaSubmitting,
              }}
              acceptFormId={formId}
              onSubmitAccept={handleAcceptSubmit}
              onWithdraw={() => setWithdrawOpen(true)}
              onBack={handleBack}
              acceptSubmitting={acceptMutation.isPending}
              withdrawSubmitting={withdrawMutation.isPending}
              withdrawalRecord={data.withdrawalRecord}
            />
          )}
        </div>
      </main>

      <WithdrawAssetDialog
        open={withdrawOpen}
        title={SUITABILITY_RESULTS_COPY.withdrawDialogTitle}
        description={SUITABILITY_RESULTS_COPY.withdrawDialogDescription}
        reasonLabel={SUITABILITY_RESULTS_COPY.withdrawReasonLabel}
        reasonPlaceholder={SUITABILITY_RESULTS_COPY.withdrawReasonPlaceholder}
        cancelCta={SUITABILITY_RESULTS_COPY.withdrawDialogCancelCta}
        confirmCta={SUITABILITY_RESULTS_COPY.withdrawDialogConfirmCta}
        systemCaption={SUITABILITY_RESULTS_COPY.withdrawalCaption}
        submitting={withdrawMutation.isPending}
        onCancel={() => setWithdrawOpen(false)}
        onConfirm={handleWithdrawConfirm}
      />
    </div>
  );
}

interface TopBarProps {
  assetFilename: string;
  workspace?: string;
}

function TopBar({ assetFilename, workspace }: TopBarProps) {
  const trail = ["Asset Library", "Pre-Flight", assetFilename, "Brand Suitability Results"];
  const lastIndex = trail.length - 1;
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 overflow-hidden bg-[#0A1F44] px-6 text-white shadow-sm">
      <span className="shrink-0 whitespace-nowrap font-display text-lg font-semibold tracking-tight">
        Praetion <span className="text-[#7BB4E2]">AI</span>
      </span>
      <span className="h-5 w-px shrink-0 bg-white/20" aria-hidden />
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-1 items-center gap-2 text-sm text-white/70"
      >
        {trail.map((item, i) => {
          const isLast = i === lastIndex;
          return (
            <Fragment key={i}>
              {i > 0 ? (
                <span aria-hidden className="hidden shrink-0 text-white/40 md:inline">
                  →
                </span>
              ) : null}
              <span
                className={cn(
                  isLast
                    ? "min-w-0 flex-1 truncate font-medium text-white"
                    : "hidden shrink-0 whitespace-nowrap md:inline",
                )}
              >
                {item}
              </span>
            </Fragment>
          );
        })}
      </nav>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <span className="shrink-0 whitespace-nowrap rounded-md border-[1.5px] border-white/40 bg-white/5 px-4 py-1.5 text-xs font-medium text-white">
          Reviewer
        </span>
        {workspace ? (
          <span className="shrink-0 whitespace-nowrap rounded-md border-[1.5px] border-white/40 bg-white/5 px-4 py-1.5 text-xs font-medium text-white">
            Workspace: {workspace}
          </span>
        ) : null}
      </div>
    </header>
  );
}

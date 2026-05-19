import { Fragment, useEffect, useId, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
    <div className="flex h-[calc(100vh-80px)] min-h-0 flex-col overflow-hidden bg-background">
      {/* Integrated Breadcrumb Header */}
      <div className="px-6 py-4 border-b bg-card/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/assets">Recent Assets</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {runId && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/preflight/${runId}`}>Pre-Flight Scan</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Brand Suitability</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-bold font-display mt-2 tracking-tight">
            Brand Suitability Results
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0 whitespace-nowrap rounded-md border border-border bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-foreground">
            Role: Reviewer
          </span>
          {data.topBar.workspaceLabel && (
            <span className="shrink-0 whitespace-nowrap rounded-md border border-border bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-foreground">
              {data.topBar.workspaceLabel}
            </span>
          )}
        </div>
      </div>

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



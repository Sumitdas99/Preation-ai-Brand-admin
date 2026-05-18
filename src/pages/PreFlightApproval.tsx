import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  getMockScenario,
  setMockScenario,
  subscribeMockScenario,
  MockScenario,
} from "@/api/mockScenario";
import { subscribeLegalScenario } from "@/api/legalScenario";
import { DevStateSwitcher } from "@/components/preflight/dev/DevStateSwitcher";
import { DEV_SCENARIOS } from "@/components/preflight/dev/devScenarios";
import { MainArea } from "@/components/preflight/layout/MainArea";
import { PreFlightSidebar } from "@/components/preflight/layout/PreFlightSidebar";
import { StageBanner } from "@/components/preflight/layout/StageBanner";
import { TopBar } from "@/components/preflight/layout/TopBar";
import {
  ViewerRoleContext,
  ViewerRole,
} from "@/components/preflight/viewerRole";
import { useCurrentViewerRole } from "@/features/auth/useCurrentViewerRole";
import { PreFlightActionsContext } from "@/features/preflight/actions/PreFlightActionsContext";
import { usePreFlightActionsController } from "@/features/preflight/actions/usePreFlightActionsController";
import { toPreFlightData } from "@/features/preflight/adapters";
import { PreFlightErrorScreen } from "@/features/preflight/components/PreFlightErrorScreen";
import { PreFlightSkeleton } from "@/features/preflight/components/PreFlightSkeleton";
import { usePreflight } from "@/features/preflight/hooks";
import { useApprovalForRun } from "@/features/legalReview/hooks";
import { DevLegalPanel } from "@/features/legalReview/components/DevLegalPanel";
import {
  clearLegalLocalState,
  useLegalPreflightController,
} from "@/features/legalReview/preflight/useLegalPreflightController";
import { USE_MSW } from "@/lib/env";
import { resetMockState } from "@/mocks/state";

export default function PreFlightApproval() {
  const { id: runId } = useParams<{ id: string }>();
  const { role: viewerRole, canSwitchRole, setRole } = useCurrentViewerRole();

  const [scenario, setScenario] = useState<MockScenario>(() => getMockScenario());
  const qc = useQueryClient();

  const handleScenarioChange = useCallback(
    (next: MockScenario) => {
      resetMockState();
      clearLegalLocalState();
      setMockScenario(next);
      setScenario(next);
      if (runId) {
        qc.invalidateQueries({ queryKey: ["preflight"] });
        qc.invalidateQueries({ queryKey: ["asset"] });
        qc.invalidateQueries({ queryKey: ["disclosure"] });
        qc.invalidateQueries({ queryKey: ["approval"] });
        qc.invalidateQueries({ queryKey: ["consent"] });
        qc.invalidateQueries({ queryKey: ["legal"] });
      }
    },
    [qc, runId],
  );

  useEffect(() => {
    document.title = "Pre-Flight · Praetion AI";
    clearLegalLocalState(runId);
  }, [runId]);

  useEffect(() => subscribeMockScenario(setScenario), []);

  useEffect(
    () =>
      subscribeLegalScenario(() => {
        clearLegalLocalState();
        if (runId) {
          qc.resetQueries({ queryKey: ["preflight"] });
          qc.resetQueries({ queryKey: ["asset"] });
          qc.resetQueries({ queryKey: ["disclosure"] });
          qc.resetQueries({ queryKey: ["approval"] });
          qc.resetQueries({ queryKey: ["consent"] });
          qc.resetQueries({ queryKey: ["legal"] });
        }
      }),
    [qc, runId],
  );

  const [resolveEpoch, setResolveEpoch] = useState(0);
  const bumpResolveEpoch = useCallback(() => setResolveEpoch((n) => n + 1), []);

  const { preflight, asset, disclosure, isPending, error, refetch } =
    usePreflight(runId);

  const isLegalMode = viewerRole === "Legal";
  const { approval } = useApprovalForRun(runId, isLegalMode);

  if (!runId) {
    return (
      <PreFlightErrorScreen
        error={new Error("Pre-flight run id missing from URL")}
        onRetry={() => window.history.back()}
      />
    );
  }

  if (isPending || !preflight || !asset) {
    if (error) {
      return <PreFlightErrorScreen error={error} onRetry={refetch} />;
    }
    return <PreFlightSkeleton />;
  }

  if (error) {
    return <PreFlightErrorScreen error={error} onRetry={refetch} />;
  }

  void resolveEpoch;

  let adapterResult;
  try {
    adapterResult = toPreFlightData(
      preflight,
      asset,
      disclosure,
      viewerRole,
      approval,
    );
  } catch (adapterError) {
    return (
      <PreFlightErrorScreen
        error={adapterError as Error}
        onRetry={refetch}
      />
    );
  }

  const {
    data,
    forcePassDisabled,
    mandatoryObligationsResolved,
    disclosureSpecId,
    consentSpecId,
    proofSpecId,
  } = adapterResult;

  const policyPackLabel = `EU AI Act pack v${preflight.policy_decision?.policy_pack_version ?? "1.0"}`;

  return (
    <ViewerRoleContext.Provider value={viewerRole}>
      <PageBody
        runId={runId}
        assetId={preflight.asset_id}
        workspaceId={preflight.workspace_id}
        disclosureSpecId={disclosureSpecId}
        consentSpecId={consentSpecId}
        proofSpecId={proofSpecId}
        mandatoryObligationsResolved={mandatoryObligationsResolved}
        forcePassDisabled={forcePassDisabled}
        advisoryCount={preflight.obligations.filter((o) => o.severity === "ADVISORY").length}
        data={data}
        viewerRole={viewerRole}
        canSwitchRole={canSwitchRole}
        scenario={scenario}
        onScenarioChange={handleScenarioChange}
        onRoleChange={setRole}
        approvalId={approval?.approval_id}
        approval={approval}
        policyPackLabel={policyPackLabel}
        onItemResolved={bumpResolveEpoch}
      />
    </ViewerRoleContext.Provider>
  );
}

interface PageBodyProps {
  runId: string;
  assetId?: string;
  workspaceId?: string;
  disclosureSpecId?: string;
  consentSpecId?: string;
  proofSpecId?: string;
  mandatoryObligationsResolved: boolean;
  forcePassDisabled: boolean;
  advisoryCount: number;
  data: ReturnType<typeof toPreFlightData>["data"];
  viewerRole: ViewerRole;
  canSwitchRole: boolean;
  scenario: MockScenario;
  onScenarioChange: (next: MockScenario) => void;
  onRoleChange: (next: ViewerRole) => void;
  approvalId?: string;
  approval?: import("@/api/schemas/approvals").ApprovalDetail;
  policyPackLabel: string;
  onItemResolved: () => void;
}

function PageBody(props: PageBodyProps) {
  const actionsValue = usePreFlightActionsController({
    runId: props.runId,
    assetId: props.assetId,
    workspaceId: props.workspaceId,
    disclosureSpecId: props.disclosureSpecId,
    consentSpecId: props.consentSpecId,
    proofSpecId: props.proofSpecId,
    mandatoryObligationsResolved: props.mandatoryObligationsResolved,
    forcePassDisabled: props.forcePassDisabled,
    advisoryCount: props.advisoryCount,
  });

  const legalController = useLegalPreflightController({
    runId: props.runId,
    legalView: props.data.legalView,
    approval: props.approval,
    disclosureSpecId: props.disclosureSpecId,
    onItemResolved: props.onItemResolved,
  });

  const isLegalMode = props.viewerRole === "Legal";

  return (
    <PreFlightActionsContext.Provider value={actionsValue}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
        <TopBar data={props.data.topBar} />
        <StageBanner data={props.data.banner} />

        <div className="flex flex-1 overflow-hidden">
          <PreFlightSidebar data={props.data} />
          <MainArea
            data={props.data}
            legalController={isLegalMode ? legalController : undefined}
            policyPackLabel={props.policyPackLabel}
          />
        </div>

        {USE_MSW && !isLegalMode && (
          <DevStateSwitcher
            scenarios={DEV_SCENARIOS}
            currentScenario={props.scenario}
            onScenarioChange={props.onScenarioChange}
            role={props.viewerRole}
            onRoleChange={props.onRoleChange}
            canSwitchRole={props.canSwitchRole}
          />
        )}

        {USE_MSW && isLegalMode && (
          <DevLegalPanel
            role={props.viewerRole}
            onRoleChange={props.onRoleChange}
            canSwitchRole={props.canSwitchRole}
          />
        )}
      </div>
    </PreFlightActionsContext.Provider>
  );
}

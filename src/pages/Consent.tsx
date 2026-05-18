import { useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type {
  ConsentSpec,
  HumanPresenceSubmission,
  RplSubmission,
} from "@/api/schemas/consent";
import {
  Briefing,
  HumanPresenceCard,
  RplCard,
  TopBar,
} from "@/components/consent";
import {
  ViewerRoleContext,
  type ViewerRole,
} from "@/components/preflight/viewerRole";
import { useCurrentViewerRole } from "@/features/auth/useCurrentViewerRole";
import { toConsentData } from "@/features/consent/adapters";
import { ConsentDevPanel } from "@/features/consent/components/ConsentDevPanel";
import { ConsentErrorScreen } from "@/features/consent/components/ConsentErrorScreen";
import { ConsentSkeleton } from "@/features/consent/components/ConsentSkeleton";
import {
  useConsent,
  useSubmitHumanPresence,
  useSubmitRplConsent,
} from "@/features/consent/hooks";
import { USE_MSW } from "@/lib/env";

export default function Consent() {
  const { id: specId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const runId = searchParams.get("runId") ?? undefined;
  const { role: viewerRole } = useCurrentViewerRole();

  useEffect(() => {
    document.title = "Consent & presence · Praetion AI";
  }, []);

  const { spec, isPending, error, refetch } = useConsent(specId);
  const rplMutation = useSubmitRplConsent(specId);
  const hpMutation = useSubmitHumanPresence(specId);

  if (!specId) {
    return (
      <ConsentErrorScreen
        error={new Error("Consent spec id missing from URL")}
        onRetry={() => window.history.back()}
        runId={runId}
      />
    );
  }

  if (isPending || !spec) {
    if (error) {
      return (
        <ConsentErrorScreen error={error} onRetry={refetch} runId={runId} />
      );
    }
    return <ConsentSkeleton />;
  }

  if (error) {
    return <ConsentErrorScreen error={error} onRetry={refetch} runId={runId} />;
  }

  return (
    <ViewerRoleContext.Provider value={viewerRole}>
      <PageBody
        spec={spec}
        role={viewerRole}
        submittingRpl={rplMutation.isPending}
        submittingHp={hpMutation.isPending}
        onSubmitRpl={(body) => rplMutation.mutate(body)}
        onSubmitHp={(body) => hpMutation.mutate(body)}
        specId={specId}
      />
    </ViewerRoleContext.Provider>
  );
}

const CONSENT_PAGE_MAX_WIDTH = "max-w-[1040px]";

interface PageBodyProps {
  spec: ConsentSpec;
  role: ViewerRole;
  submittingRpl: boolean;
  submittingHp: boolean;
  onSubmitRpl: (body: RplSubmission) => void;
  onSubmitHp: (body: HumanPresenceSubmission) => void;
  specId: string;
}

function PageBody({
  spec,
  role,
  submittingRpl,
  submittingHp,
  onSubmitRpl,
  onSubmitHp,
  specId,
}: PageBodyProps) {
  const data = useMemo(
    () =>
      toConsentData({
        spec,
        role: role === "Legal" ? "Legal" : "Reviewer",
      }),
    [spec, role],
  );

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background">
      <TopBar data={data.topBar} />

      <main className="min-h-0 flex-1 transform-gpu overflow-y-auto overscroll-contain">
        <div
          className={`mx-auto w-full ${CONSENT_PAGE_MAX_WIDTH} space-y-6 px-6 py-6`}
        >
          <Briefing data={data.briefing} />
          <RplCard
            data={data.rpl}
            organisationName={data.organisationName}
            submitting={submittingRpl}
            onSubmitRpl={onSubmitRpl}
          />
          <HumanPresenceCard
            data={data.humanPresence}
            organisationName={data.organisationName}
            submitting={submittingHp}
            onSubmit={onSubmitHp}
          />
        </div>
      </main>

      {USE_MSW ? <ConsentDevPanel specId={specId} /> : null}
    </div>
  );
}

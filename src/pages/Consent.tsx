import { useEffect, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type {
  ConsentSpec,
  HumanPresenceSubmission,
  RplSubmission,
} from "@/api/schemas/consent";
import {
  Briefing,
  HumanPresenceCard,
  RplCard,
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
        runId={runId}
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
  runId?: string;
}

function PageBody({
  spec,
  role,
  submittingRpl,
  submittingHp,
  onSubmitRpl,
  onSubmitHp,
  specId,
  runId,
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
                <BreadcrumbPage>Consent & Presence</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-bold font-display mt-2 tracking-tight">
            Consent & Presence Specification
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0 whitespace-nowrap rounded-md border border-border bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-foreground">
            Role: {role}
          </span>
        </div>
      </div>

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

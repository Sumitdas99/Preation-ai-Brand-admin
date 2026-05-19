import { useEffect, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getAsset } from "@/api/endpoints/asset";
import type {
  DisclosurePlacementType,
  DisclosureScope,
  PlacementLocation,
  UpdateDisclosureSpecRequest,
} from "@/api/schemas/disclosure";
import {
  LockFooter,
  RequirementAlert,
  SectionA,
  SectionB,
  SectionC,
  StepProgress,
  ValidationPanel,
} from "@/components/disclosure";
import {
  ViewerRole,
  ViewerRoleContext,
} from "@/components/preflight/viewerRole";
import { useCurrentViewerRole } from "@/features/auth/useCurrentViewerRole";
import { toDisclosureData } from "@/features/disclosure/adapters";
import { DisclosureDevPanel } from "@/features/disclosure/components/DisclosureDevPanel";
import { DisclosureErrorScreen } from "@/features/disclosure/components/DisclosureErrorScreen";
import { DisclosureSkeleton } from "@/features/disclosure/components/DisclosureSkeleton";
import {
  useDisclosureSpec,
  useDisclosureTemplates,
  useLockSpec,
  useUpdateSpec,
} from "@/features/disclosure/hooks";
import { USE_MSW } from "@/lib/env";

const DISCLOSURE_PAGE_MAX_WIDTH = "max-w-[1040px]";

export default function DisclosureSpec() {
  const { id: specId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const runId = searchParams.get("runId") ?? undefined;
  const { role: viewerRole } = useCurrentViewerRole();

  useEffect(() => {
    document.title = "Disclosure specification · Praetion AI";
  }, []);

  const { spec, isPending, error, refetch } = useDisclosureSpec(specId);

  const assetId = spec?.asset_id;
  const assetQuery = useQuery({
    queryKey: assetId ? ["asset", assetId] : ["asset", "pending"],
    queryFn: ({ signal }) => getAsset(assetId!, signal),
    enabled: Boolean(assetId),
  });

  const templatesQuery = useDisclosureTemplates(
    {
      trigger: spec?.requirement?.trigger_type,
      modality: spec?.requirement?.modality,
    },
    Boolean(spec?.requirement),
  );

  const updateMutation = useUpdateSpec(specId);
  const lockMutation = useLockSpec({ specId, runId });

  if (!specId) {
    return (
      <DisclosureErrorScreen
        error={new Error("Disclosure spec id missing from URL")}
        onRetry={() => window.history.back()}
        runId={runId}
      />
    );
  }

  if (isPending || !spec) {
    if (error) {
      return (
        <DisclosureErrorScreen
          error={error}
          onRetry={refetch}
          runId={runId}
        />
      );
    }
    return <DisclosureSkeleton />;
  }

  if (error) {
    return (
      <DisclosureErrorScreen error={error} onRetry={refetch} runId={runId} />
    );
  }

  return (
    <ViewerRoleContext.Provider value={viewerRole}>
      <PageBody
        spec={spec}
        asset={assetQuery.data}
        templates={templatesQuery.templates}
        role={viewerRole}
        updateSpec={(body) => updateMutation.mutate(body)}
        lockSpec={() => lockMutation.mutate()}
        isLocking={lockMutation.isPending}
        runId={runId}
      />
    </ViewerRoleContext.Provider>
  );
}

interface PageBodyProps {
  spec: NonNullable<ReturnType<typeof useDisclosureSpec>["spec"]>;
  asset: ReturnType<typeof useQuery>["data"];
  templates: ReturnType<typeof useDisclosureTemplates>["templates"];
  role: ViewerRole;
  updateSpec: (body: UpdateDisclosureSpecRequest) => void;
  lockSpec: () => void;
  isLocking: boolean;
  runId?: string;
}

function PageBody({
  spec,
  asset,
  templates,
  role,
  updateSpec,
  lockSpec,
  isLocking,
  runId,
}: PageBodyProps) {
  const data = useMemo(
    () =>
      toDisclosureData({
        spec,
        asset: asset as Parameters<typeof toDisclosureData>[0]["asset"],
        templates,
        role,
      }),
    [spec, asset, templates, role],
  );

  const readOnly = data.readOnly;

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
                <BreadcrumbPage>Disclosure Spec</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-bold font-display mt-2 tracking-tight">
            Disclosure Specification
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0 whitespace-nowrap rounded-md border border-border bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-foreground">
            Role: {role}
          </span>
        </div>
      </div>

      <StepProgress data={data.stepProgress} />

      <main className="min-h-0 flex-1 transform-gpu overflow-y-auto overscroll-contain">
        <div
          className={`mx-auto w-full ${DISCLOSURE_PAGE_MAX_WIDTH} space-y-6 px-6 py-6`}
        >
          <RequirementAlert data={data.requirementAlert} />

          <SectionA
            data={data.sectionA}
            disabled={readOnly || isLocking}
            onTextChange={(final_text) => updateSpec({ final_text })}
            onLanguageChange={(language) => {
              const currentText = (spec.form?.final_text ?? "").trim();
              const isEmpty = currentText.length === 0;
              const isUntouchedTemplate = templates.some(
                (t) => t.text.trim() === currentText,
              );
              const canAutofill = isEmpty || isUntouchedTemplate;
              if (!canAutofill) {
                updateSpec({ language });
                return;
              }
              const trigger = spec.requirement?.trigger_type;
              const modality = spec.requirement?.modality;
              const scope = spec.form?.scope ?? "FULL";
              const match = templates.find(
                (t) =>
                  t.trigger_type === trigger &&
                  t.modality === modality &&
                  t.scope === scope &&
                  t.language === language,
              );
              if (match) {
                updateSpec({
                  language,
                  final_text: match.text,
                  template_id: match.template_id,
                });
              } else {
                updateSpec({
                  language,
                  final_text: "",
                  template_id: undefined,
                });
              }
            }}
            onTemplateChange={(template_id) => updateSpec({ template_id })}
          />

          <SectionB
            data={data.sectionB}
            disabled={readOnly || isLocking}
            onSelect={(placement_type: DisclosurePlacementType) =>
              updateSpec({ placement_type })
            }
          />

          <SectionC
            data={data.sectionC}
            disabled={readOnly || isLocking}
            onLocationChange={(location: PlacementLocation) =>
              updateSpec({ location })
            }
            onScopeChange={(scope: DisclosureScope) => updateSpec({ scope })}
            onFullDurationToggle={(full_duration_confirmed) =>
              updateSpec({ full_duration_confirmed })
            }
            onStartMsChange={(start_ms) => updateSpec({ start_ms })}
            onEndMsChange={(end_ms) => updateSpec({ end_ms })}
            onCaptionPatch={(patch) =>
              updateSpec(patch as UpdateDisclosureSpecRequest)
            }
            onExternalPatch={(patch) =>
              updateSpec(patch as UpdateDisclosureSpecRequest)
            }
          />

          <ValidationPanel data={data.validation} />

          <LockFooter
            data={data.lockFooter}
            submitting={isLocking}
            onLock={lockSpec}
          />
        </div>
      </main>

      {USE_MSW && (
        <DisclosureDevPanel
          scope={data.sectionC.scopeValue}
          disabled={isLocking}
          onScopeChange={(scope: DisclosureScope) => updateSpec({ scope })}
        />
      )}
    </div>
  );
}

import { Fragment, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  CategoryDetailFooter,
  CategoryHeaderBanner,
  PerTimecodeTable,
  PolicyReferenceCard,
  ScoreDetailCard,
} from "@/components/suitability";
import type { SuitabilityCategoryDetailPageData } from "@/components/suitability/types";
import { SuitabilityErrorScreen } from "@/features/suitability/components/SuitabilityErrorScreen";
import { SuitabilitySkeleton } from "@/features/suitability/components/SuitabilitySkeleton";
import { DevSuitabilityPanel } from "@/features/suitability/components/DevSuitabilityPanel";
import {
  findCategory,
  toCategoryDetailData,
} from "@/features/suitability/adapters";
import { useSuitabilityResults } from "@/features/suitability/hooks";
import { cn } from "@/lib/utils";

export default function SuitabilityCategoryDetail() {
  const { runId, categoryKey } = useParams<{
    runId: string;
    categoryKey: string;
  }>();

  useEffect(() => {
    document.title = "Brand Suitability · Category detail · Praetion AI";
  }, []);

  const { results, isPending, error, refetch } = useSuitabilityResults(runId);

  const data = useMemo(() => {
    if (!results || !categoryKey) return undefined;
    const category = findCategory(results, categoryKey);
    if (!category) return undefined;
    return toCategoryDetailData(results, category);
  }, [results, categoryKey]);

  if (!runId || !categoryKey) {
    return (
      <SuitabilityErrorScreen
        error={new Error("Run id or category key missing from URL")}
        onRetry={() => window.history.back()}
      />
    );
  }

  if (isPending || !results) {
    if (error) {
      return (
        <SuitabilityErrorScreen error={error} onRetry={refetch} runId={runId} />
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

  if (!data) {
    return (
      <SuitabilityErrorScreen
        error={new Error(`Category "${categoryKey}" not found in results`)}
        onRetry={refetch}
        runId={runId}
      />
    );
  }

  return (
    <>
      <PageBody data={data} runId={runId} />
      <DevSuitabilityPanel runId={runId} />
    </>
  );
}

interface PageBodyProps {
  data: SuitabilityCategoryDetailPageData;
  runId: string;
}

function PageBody({ data }: PageBodyProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [data.raw.category_key]);

  const handleBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate(data.parent.resultsHref, { replace: true });
    }
  };

  const goToSibling = (href: string) => {
    navigate(href, { replace: true });
  };

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
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/suitability/${runId}/results`}>Brand Suitability</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{data.breadcrumbTail}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-bold font-display mt-2 tracking-tight">
            Suitability Category Details
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

      <main
        ref={mainRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6"
      >
        <div className="mx-auto w-full max-w-[1080px] space-y-5">
          <CategoryHeaderBanner data={data.header} />
          <ScoreDetailCard data={data.scoreDetail} tone={data.header.tone} />
          <PerTimecodeTable data={data.perTimecode} />
          <PolicyReferenceCard data={data.policyReference} />
          <CategoryDetailFooter
            onBack={handleBack}
            dots={data.categoryDots}
            onDotClick={(dot) => goToSibling(dot.href)}
            nextCategory={data.nextCategory}
            onNext={(next) => goToSibling(next.href)}
          />
        </div>
      </main>
    </div>
  );
}

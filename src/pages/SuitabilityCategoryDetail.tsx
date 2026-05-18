import { Fragment, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <TopBar
        assetFilename={data.topBar.assetFilename}
        workspace={data.topBar.workspaceLabel}
        breadcrumbTail={data.breadcrumbTail}
      />

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

interface TopBarProps {
  assetFilename: string;
  workspace?: string;
  breadcrumbTail: string;
}

function TopBar({ assetFilename, workspace, breadcrumbTail }: TopBarProps) {
  const trail = [
    "Pre-Flight",
    "Brand Suitability Results",
    breadcrumbTail,
  ];
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
                <span
                  aria-hidden
                  className="hidden shrink-0 text-white/40 md:inline"
                >
                  →
                </span>
              ) : null}
              <span
                className={cn(
                  isLast
                    ? "min-w-0 flex-1 truncate font-medium text-white"
                    : "hidden shrink-0 whitespace-nowrap md:inline",
                )}
                title={isLast ? item : undefined}
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
          <span
            className="shrink-0 whitespace-nowrap rounded-md border-[1.5px] border-white/40 bg-white/5 px-4 py-1.5 text-xs font-medium text-white"
            title={`Asset: ${assetFilename}`}
          >
            Workspace: {workspace}
          </span>
        ) : null}
      </div>
    </header>
  );
}

import { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  AssetDetailsSection,
  AttestationSection,
  BrandSuitabilitySection,
  ConsentSection,
  DetectionResultsSection,
  DisclosureSection,
  PolicyEngineSection,
  ProvenanceSection,
} from "@/components/evidencePack/sections";
import { EvidencePackHeader } from "@/components/evidencePack/layout/EvidencePackHeader";
import { EvidencePackSidebar } from "@/components/evidencePack/layout/EvidencePackSidebar";
import { EvidencePackTopBar } from "@/components/evidencePack/layout/EvidencePackTopBar";
import type {
  EvidencePackPreviewData,
  EvidencePackSectionData,
  EvidencePackSidebarItem,
} from "@/components/evidencePack/types";
import {
  DevEvidencePackPanel,
  EvidencePackPreviewErrorScreen,
  EvidencePackPreviewSkeleton,
} from "@/features/evidencePack/components";
import {
  useActiveSection,
  useEvidencePackPreview,
} from "@/features/evidencePack/hooks";
import { toEvidencePackPreviewData } from "@/features/evidencePack/adapters";

export default function EvidencePackPreviewPage() {
  const { packId } = useParams<{ packId: string }>();

  useEffect(() => {
    document.title = "Evidence Pack Preview · Praetion AI";
  }, []);

  const { pack, isPending, error, refetch } = useEvidencePackPreview(packId);

  if (!packId) {
    return (
      <EvidencePackPreviewErrorScreen
        error={new Error("Evidence pack id missing from URL")}
        onRetry={() => window.history.back()}
      />
    );
  }

  if (error && !pack) {
    return (
      <>
        <EvidencePackPreviewErrorScreen error={error} onRetry={refetch} />
        <DevEvidencePackPanel packId={packId} />
      </>
    );
  }

  if (isPending || !pack) {
    return (
      <>
        <EvidencePackPreviewSkeleton />
        <DevEvidencePackPanel packId={packId} />
      </>
    );
  }

  return <PreviewBody packId={packId} pack={pack} />;
}

interface PreviewBodyProps {
  packId: string;
  pack: Parameters<typeof toEvidencePackPreviewData>[0];
}

function PreviewBody({ packId, pack }: PreviewBodyProps) {
  const data: EvidencePackPreviewData = useMemo(
    () => toEvidencePackPreviewData(pack),
    [pack],
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  const sectionKeys = useMemo(
    () => data.sections.map((s) => s.shell.key),
    [data.sections],
  );
  const { activeKey, forceKey } = useActiveSection({
    rootRef: scrollRef,
    sectionKeys,
  });

  const handleSidebarNav = (item: EvidencePackSidebarItem) => {
    forceKey(item.key);
    const root = scrollRef.current;
    const target = root?.querySelector(`#${CSS.escape(item.key)}`);
    if (root && target instanceof HTMLElement) {
      const top = target.offsetTop - 16;
      root.scrollTo({ top, behavior: "smooth" });
    } else if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <EvidencePackTopBar data={data.topBar} />
      <EvidencePackHeader data={data.header} />

      <div className="flex min-h-0 flex-1">
        <EvidencePackSidebar
          data={data.sidebar}
          activeKey={activeKey}
          onNavigate={handleSidebarNav}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <main
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-10"
          >
            <div className="mx-auto w-full max-w-[960px] space-y-4">
              {data.sections.map((section) => (
                <SectionRenderer key={section.shell.key} section={section} />
              ))}
            </div>
          </main>

        </div>
      </div>

      <DevEvidencePackPanel packId={packId} />
    </div>
  );
}

function SectionRenderer({ section }: { section: EvidencePackSectionData }) {
  switch (section.body.kind) {
    case "key_values":
      return <AssetDetailsSection section={section} />;
    case "detection_table":
      return <DetectionResultsSection section={section} />;
    case "policy_record":
      return <PolicyEngineSection section={section} />;
    case "provenance_record":
      return <ProvenanceSection section={section} />;
    case "brand_suitability_record":
      return <BrandSuitabilitySection section={section} />;
    case "disclosure_record":
      return <DisclosureSection section={section} />;
    case "consent_record":
      return <ConsentSection section={section} />;
    case "attestation_page":
      return <AttestationSection section={section} />;
    default:
      return null;
  }
}

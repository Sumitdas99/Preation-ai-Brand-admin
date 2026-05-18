import { cn } from "@/lib/utils";
import { AssetDetailsCard } from "../cards/AssetDetailsCard";
import { AssetVersionsCard } from "../cards/AssetVersionsCard";
import { AuditFooter } from "./AuditFooter";
import { LegalEscalationReasonCard } from "../legal/sidebar/LegalEscalationReasonCard";
import { LegalItemsResolvedCard } from "../legal/sidebar/LegalItemsResolvedCard";
import { ModalityProgressCard } from "../cards/ModalityProgressCard";
import { SystemErrorDetailsCard } from "../cards/SystemErrorDetailsCard";
import { VideoThumbnailCard } from "../cards/VideoThumbnailCard";
import type { PreFlightData } from "../types";

interface Props {
  data: PreFlightData;
  className?: string;
}

export function PreFlightSidebar({ data, className }: Props) {
  const legal = data.legalView;
  const hasAnyResolved =
    legal?.items.some((it) => it.resolved) ?? false;
  const showItemsResolved =
    legal &&
    (legal.variant === "state-a-items-pending" ||
      legal.variant === "state-b-ready-to-attest") &&
    hasAnyResolved;
  const showEscalation =
    legal && legal.variant === "hard-block-escalation" && Boolean(legal.escalationReason);
  const isPostAttestation =
    legal && legal.variant === "post-attestation-success";

  return (
    <aside className={cn("flex w-64 shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-border bg-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}>
      <VideoThumbnailCard data={data.videoThumbnail} />

      <div className="border-t border-border">
        <AssetDetailsCard data={data.assetDetails} />
      </div>

      <hr className="border-border" />

      {data.modalityProgress && (
        <div className="border-t border-border">
          <ModalityProgressCard data={data.modalityProgress} />
        </div>
      )}

      {showItemsResolved && legal && (
        <div className="border-t border-border">
          <LegalItemsResolvedCard items={legal.items} />
        </div>
      )}

      {showEscalation && legal?.escalationReason && (
        <div className="border-t border-border">
          <LegalEscalationReasonCard data={legal.escalationReason} />
        </div>
      )}

      {data.assetVersions && !showEscalation && (
        <div className="border-t border-border">
          <AssetVersionsCard data={data.assetVersions} />
        </div>
      )}

      {data.systemErrorDetails && (
        <div className="border-t border-border">
          <SystemErrorDetailsCard data={data.systemErrorDetails} />
        </div>
      )}

      {data.assetVersions && !showEscalation && !isPostAttestation && (
        <AuditFooter text={data.auditFooterText} />
      )}
    </aside>
  );
}

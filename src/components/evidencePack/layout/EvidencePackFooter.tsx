import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EvidencePackFooterData } from "../types";

interface Props {
  data: EvidencePackFooterData;
  onDownload?: (url: string) => void;
}

export function EvidencePackFooter({ data, onDownload }: Props) {
  const handleClick = () => {
    if (data.downloadDisabled || !data.downloadHref) return;
    if (onDownload) {
      onDownload(data.downloadHref);
      return;
    }
    window.open(data.downloadHref, "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="sticky bottom-0 z-10 border-t border-border bg-card/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{data.expiryHint}</p>
        <Button
          type="button"
          onClick={handleClick}
          disabled={data.downloadDisabled}
          className="gap-2"
        >
          <Download className="h-4 w-4" aria-hidden />
          <span>{data.downloadCtaLabel}</span>
        </Button>
      </div>
    </footer>
  );
}

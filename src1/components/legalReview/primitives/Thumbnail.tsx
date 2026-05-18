import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApprovalQueueModality } from "@/api/schemas/approvals";

interface Props {
  modality?: ApprovalQueueModality;
  thumbnailUrl?: string;
  alt?: string;
  className?: string;
}

export function Thumbnail({ modality, thumbnailUrl, alt, className }: Props) {
  const label = modality === "VIDEO" ? "VID" : modality === "IMAGE" ? "IMG" : "DOC";

  if (thumbnailUrl) {
    return (
      <div
        className={cn(
          "relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border-[0.5px] border-neutral-300 bg-[#5a5a5a]",
          className,
        )}
      >
        <img
          src={thumbnailUrl}
          alt={alt ?? "Asset thumbnail"}
          className="h-full w-full object-cover"
        />
        <span className="absolute bottom-1 right-1.5 rounded bg-[#0f1d3b] px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border-[0.5px] border-neutral-300 bg-[#5a5a5a]",
        className,
      )}
      title={alt}
    >
      <Play className="h-6 w-6 fill-white/45" aria-hidden strokeWidth={0} />
      <span className="absolute bottom-0 right-0 rounded-tl-md rounded-br-md bg-[#0f1d3b] px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white">
        {label}
      </span>
    </div>
  );
}

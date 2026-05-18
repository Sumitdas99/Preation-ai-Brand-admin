import { Play } from "lucide-react";
import type { VideoThumbnail } from "../types";

interface Props {
  data: VideoThumbnail;
}

export function VideoThumbnailCard({ data }: Props) {
  return (
    <div className="p-3">
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-md bg-slate-200">
        <Play
          className="h-6 w-6 text-slate-500"
          strokeWidth={1.75}
          aria-hidden
        />

        <span className="absolute bottom-2 right-2 rounded bg-[#0f1d3b] px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white">
          {data.durationLabel === "—"
            ? data.modalityLabel
            : `${data.modalityLabel} · ${data.durationLabel}`}
        </span>
      </div>
    </div>
  );
}

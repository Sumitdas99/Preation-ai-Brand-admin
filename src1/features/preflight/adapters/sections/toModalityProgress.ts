import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import type {
  Modality,
  ModalityProgress,
} from "@/components/preflight/types";
import { MODALITY_PROGRESS_COPY } from "../copy";

const STATUS_LABELS = {
  COMPLETE: "Complete",
  IN_PROGRESS: "In progress",
  PENDING: "Pending",
  NOT_APPLICABLE: "Not applicable",
  EVALUATION_FAILED: "Failed",
} as const;

type BackendStatus = keyof typeof STATUS_LABELS;

function statusToUi(status: BackendStatus): Modality["status"] {
  if (status === "COMPLETE") return "COMPLETE";
  if (status === "IN_PROGRESS") return "IN_PROGRESS";
  return "PENDING";
}

function statusToTone(status: BackendStatus): Modality["tone"] {
  if (status === "COMPLETE") return "success";
  if (status === "IN_PROGRESS") return "warning";
  return "muted";
}

function progressForStatus(status: BackendStatus): number {
  if (status === "COMPLETE") return 100;
  if (status === "IN_PROGRESS") return 50;
  return 0;
}

export function toModalityProgress(
  preflight: PreflightStatusResponse,
): ModalityProgress | undefined {
  if (preflight.status !== "IN_PROGRESS") return undefined;

  const progress = preflight.per_modality_progress;
  const items: Modality[] = [];

  const mapRow = (
    name: string,
    entry: { evaluation_status?: BackendStatus; note?: string } | undefined,
    fallbackEnum: string,
  ): Modality => {
    const status = entry?.evaluation_status ?? "PENDING";
    return {
      name,
      status: statusToUi(status),
      statusLabel: STATUS_LABELS[status],
      progressPct: progressForStatus(status),
      enumValue: entry?.note ?? fallbackEnum,
      tone: statusToTone(status),
    };
  };

  if (progress?.image || progress === undefined) {
    items.push(mapRow("Image / frame analysis", progress?.image, "Image analysis"));
  }
  if (progress?.video_frames || progress === undefined) {
    items.push(
      mapRow("Video frame scoring", progress?.video_frames, "Video scoring"),
    );
  }
  if (progress?.audio || progress === undefined) {
    items.push(mapRow("Audio analysis", progress?.audio, "Audio analysis"));
  }

  return {
    headerTitle: MODALITY_PROGRESS_COPY.headerTitle,
    headerSubtitle: MODALITY_PROGRESS_COPY.headerSubtitle,
    items,
    footerNote: MODALITY_PROGRESS_COPY.footerNote,
  };
}

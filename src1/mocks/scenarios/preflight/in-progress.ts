import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import {
  MOCK_ASSET_ID,
  MOCK_RUN_ID,
  MOCK_WORKSPACE_ID,
} from "../../constants";

export const inProgress: PreflightStatusResponse = {
  preflight_run_id: MOCK_RUN_ID,
  asset_id: MOCK_ASSET_ID,
  workspace_id: MOCK_WORKSPACE_ID,
  status: "IN_PROGRESS",
  obligations: [],
  per_modality_progress: {
    image: { evaluation_status: "COMPLETE", note: "847 frames analysed" },
    video_frames: {
      evaluation_status: "IN_PROGRESS",
      note: "Peak-frame detection running",
    },
    audio: {
      evaluation_status: "IN_PROGRESS",
      note: "Profanity / violence detection",
    },
  },
  started_at: "2026-04-18T09:14:22Z",
};

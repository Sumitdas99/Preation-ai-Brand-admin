import ApiClient from "@/api-client";
import { API_URL } from "@/environment";

// ─────────────────────────────────────────────────────────────────────────────
// Response Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PreflightStatusOut {
  preflight_run_id: string;
  status: string;
  verdict?: string;
  blocking_reason?: string;
  started_at?: string;
  completed_at?: string;
  terminal_state?: string;
}

export interface AssetDetail {
  asset_id: string;
  brand_id: string;
  uploader_user_id: string;
  file_type: string;
  file_size_bytes: number;
  file_hash?: string;
  original_url: string;
  sanitized_url?: string;
  external_reference?: string;
  distribution_channel?: string;
  target_geography?: string[];
  content_type?: string;
  source?: string;
  auto_generate_disclosure: boolean;
  auto_embed_c2pa: boolean;
  file_metadata?: Record<string, unknown>;
  upload_status: string;
  current_stage: string;
  is_withdrawn: boolean;
  created_at: string;
  updated_at: string;
  preflight_status?: PreflightStatusOut;
}

export interface PreflightRunStatus {
  preflight_run_id: string;
  asset_id: string;
  workspace_id?: string;
  status: "IN_PROGRESS" | "COMPLETE" | "FAILED";
  verdict?: string;
  blocking_reason?: string;
  policy_decision_id?: string;
  obligations?: unknown[];
  engine_statuses?: {
    disclosure?: string;
    provenance?: string;
    brand_suitability?: string;
  };
  detection_scores?: Record<string, unknown>;
  per_modality_progress?: Record<string, unknown>;
  terminal_state?: string;
  proof_spec_id?: string;
  started_at?: string;
  completed_at?: string;
  incident_id?: string;
}

export interface PreflightEvaluatePayload {
  asset_id: string;
  workspace_id: string;
  initiated_by?: string;
  modality?: string;
  s3_key?: string;
  geo_context?: string[];
  channel_context?: string;
  policy_pack_id?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export const preflightService = {
  /**
   * Fetch full asset details including the latest preflight_status summary.
   * Called after upload completes and on the Recent Assets page.
   * GET /api/v1/assets/{asset_id}
   *
   * Pass an AbortSignal to cancel the request when the component unmounts
   * (prevents memory leaks / state-updates-on-unmounted-component warnings).
   */
  getAssetDetail: async (
    assetId: string,
    signal?: AbortSignal
  ): Promise<AssetDetail> => {
    try {
      const response = await ApiClient.get(
        `${API_URL}/assets/${encodeURIComponent(assetId)}`,
        {},
        null,
        null,
        { signal }
      );
      return response as AssetDetail;
    } catch (error: any) {
      // Swallow AbortError – it is intentional, not a real error
      if (error?.name === "AbortError" || error?.code === "ERR_CANCELED") {
        throw error;
      }
      throw new Error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch asset details"
      );
    }
  },

  /**
   * Fetch the live preflight run status for a given run ID.
   * Used on the Preflight screen to poll / refresh status.
   * GET /api/v1/preflight/{run_id}/status
   */
  getPreflightStatus: async (
    runId: string,
    signal?: AbortSignal
  ): Promise<PreflightRunStatus> => {
    try {
      const response = await ApiClient.get(
        `${API_URL}/preflight/${encodeURIComponent(runId)}/status`,
        {},
        null,
        null,
        { signal }
      );
      return response as PreflightRunStatus;
    } catch (error: any) {
      if (error?.name === "AbortError" || error?.code === "ERR_CANCELED") {
        throw error;
      }
      throw new Error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch preflight status"
      );
    }
  },

  /**
   * Trigger a new preflight evaluation for an asset.
   * Called after upload completes (first-time evaluation).
   * POST /api/v1/preflight/evaluate
   */
  evaluatePreflight: async (
    payload: PreflightEvaluatePayload
  ): Promise<PreflightRunStatus> => {
    try {
      const response = await ApiClient.post(
        `${API_URL}/preflight/evaluate`,
        payload,
        null,
        null
      );
      return response as PreflightRunStatus;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Failed to start preflight evaluation"
      );
    }
  },

  /**
   * Re-run an existing preflight for an asset.
   * Called from the Recent Assets page "Re-run Preflight" button.
   * POST /api/v1/preflight/{run_id}/rerun
   */
  rerunPreflight: async (
    runId: string,
    reason?: string
  ): Promise<PreflightRunStatus> => {
    try {
      const response = await ApiClient.post(
        `${API_URL}/preflight/${encodeURIComponent(runId)}/rerun`,
        reason ? { reason } : {},
        null,
        null
      );
      return response as PreflightRunStatus;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Failed to re-run preflight"
      );
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper hook utilities (call these inside React components/hooks)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates an AbortController that is automatically aborted when the
 * calling component unmounts. Use inside useEffect:
 *
 *   useEffect(() => {
 *     const { signal, abort } = createAbortController();
 *     preflightService.getAssetDetail(assetId, signal).then(...);
 *     return abort;           // ← cleanup: aborts in-flight request on unmount
 *   }, [assetId]);
 */
export function createAbortController(): { signal: AbortSignal; abort: () => void } {
  const controller = new AbortController();
  return { signal: controller.signal, abort: () => controller.abort() };
}

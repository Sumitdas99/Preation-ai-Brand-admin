import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import { block } from "./block";

export const challengePending: PreflightStatusResponse = {
  ...block,
  engine_statuses: {
    disclosure: "DISCLOSURE_CHALLENGE_PENDING",
    provenance: "PROVENANCE_EMBEDDING",
    brand_suitability: "BRAND_SUITABILITY_CLEAR",
  },
};

import type { MockScenario } from "@/api/mockScenario";
import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import { inProgress } from "./in-progress";
import { block } from "./block";
import { challengePending } from "./challenge-pending";
import { systemError } from "./system-error";
import { allowWithWarnings } from "./allow-with-warnings";
import { allow } from "./allow";
import { approvedPendingProof } from "./approved-pending-proof";
import { publishCleared } from "./publish-cleared";

export const preflightScenarios: Record<MockScenario, PreflightStatusResponse> = {
  "in-progress": inProgress,
  block,
  "challenge-pending": challengePending,
  "system-error": systemError,
  "allow-with-warnings": allowWithWarnings,
  allow,
  "approved-pending-proof": approvedPendingProof,
  "publish-cleared": publishCleared,
};

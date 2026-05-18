import type { ConsentSpec, RplIdentity } from "@/api/schemas/consent";
import {
  MOCK_ASSET_ID,
  MOCK_CONSENT_SPEC_ID,
  MOCK_ORG_NAME,
} from "../../constants";

export type ConsentScenarioId =
  | "both-fresh"
  | "rpl-only-fresh"
  | "hp-only-fresh";

const ASSET_FILENAME = "brand_ad_video.mp4";

const baseRplIdentities: RplIdentity[] = [
  {
    identity_id: "id_ronaldo",
    name: "Cristiano Ronaldo",
    match_probability: 0.73,
    source: "rpl_celebrity_index",
    detected_at: "2026-04-26T12:14:32Z",
    peak_frame_ms: 8200,
    peak_frame_timecode: "0:08",
  },
  {
    identity_id: "id_messi",
    name: "Lionel Messi",
    match_probability: 0.51,
    source: "rpl_celebrity_index",
    detected_at: "2026-04-26T12:14:32Z",
    peak_frame_ms: 14600,
    peak_frame_timecode: "0:14",
  },
];

const baseSpec: Omit<ConsentSpec, "triggers"> = {
  spec_id: MOCK_CONSENT_SPEC_ID,
  asset_id: MOCK_ASSET_ID,
  asset_filename: ASSET_FILENAME,
  workspace_label: "Acme EU",
  geo_label: "EU",
  organisation_name: MOCK_ORG_NAME,
  created_at: "2026-04-26T12:14:32Z",
};

const bothFresh: ConsentSpec = {
  ...baseSpec,
  triggers: ["TRIGGER_RPL_CONSENT_REQUIRED", "TRIGGER_HUMAN_PRESENCE"],
  rpl_section: {
    status: "RPL_CONSENT_REQUIRED",
    rpl_identities_snapshot: baseRplIdentities,
  },
  human_presence_section: {
    status: "HUMAN_PRESENCE_REQUIRED",
    estimated_person_count: 4,
  },
};

const rplOnly: ConsentSpec = {
  ...baseSpec,
  triggers: ["TRIGGER_RPL_CONSENT_REQUIRED"],
  rpl_section: {
    status: "RPL_CONSENT_REQUIRED",
    rpl_identities_snapshot: baseRplIdentities,
  },
};

const hpOnly: ConsentSpec = {
  ...baseSpec,
  triggers: ["TRIGGER_HUMAN_PRESENCE"],
  human_presence_section: {
    status: "HUMAN_PRESENCE_REQUIRED",
    estimated_person_count: 4,
  },
};

export const consentScenarios: Record<ConsentScenarioId, ConsentSpec> = {
  "both-fresh": bothFresh,
  "rpl-only-fresh": rplOnly,
  "hp-only-fresh": hpOnly,
};

export const DEFAULT_CONSENT_SCENARIO: ConsentScenarioId = "both-fresh";

import type { MockScenario } from "@/api/mockScenario";
import type { Asset } from "@/api/schemas/asset";
import {
  MOCK_ASSET_ID,
  MOCK_ASSET_VERSION_C2PA,
  MOCK_ASSET_VERSION_ORIGINAL,
  MOCK_REVIEWER_ID,
  MOCK_WORKSPACE_ID,
} from "../../constants";

const baseAsset: Omit<Asset, "versions"> = {
  asset_id: MOCK_ASSET_ID,
  workspace_id: MOCK_WORKSPACE_ID,
  file_name: "summer_campaign_hero.mp4",
  file_size_bytes: 84_200_000,
  mime_type: "video/mp4",
  modality: "VIDEO",
  duration_seconds: 32,
  thumbnail_url: "/placeholder.svg",
  uploaded_at: "2026-04-18T09:14:00Z",
  uploaded_by: MOCK_REVIEWER_ID,
};

const originalVersion = {
  version_id: MOCK_ASSET_VERSION_ORIGINAL,
  kind: "ORIGINAL" as const,
  file_name: "summer_campaign_hero.mp4",
  created_at: "2026-04-18T09:14:00Z",
};

const embeddingVersion = {
  version_id: MOCK_ASSET_VERSION_C2PA,
  kind: "C2PA_EMBEDDED" as const,
  file_name: "summer_campaign_hero_c2pa.mp4",
  embed_status: "EMBEDDING" as const,
  created_at: "2026-04-18T09:14:45Z",
};

const embeddedVersion = {
  version_id: MOCK_ASSET_VERSION_C2PA,
  kind: "C2PA_EMBEDDED" as const,
  file_name: "summer_campaign_hero_c2pa.mp4",
  download_url: "/placeholder.svg",
  embed_status: "EMBEDDED" as const,
  created_at: "2026-04-18T09:15:00Z",
};

const withEmbedding: Asset = {
  ...baseAsset,
  versions: [originalVersion, embeddingVersion],
};

const withEmbedded: Asset = {
  ...baseAsset,
  versions: [originalVersion, embeddedVersion],
};

const originalOnly: Asset = {
  ...baseAsset,
  versions: [originalVersion],
};

export const assetScenarios: Record<MockScenario, Asset> = {
  "in-progress": originalOnly,
  block: withEmbedding,
  "challenge-pending": withEmbedding,
  "system-error": originalOnly,
  "allow-with-warnings": withEmbedded,
  allow: withEmbedded,
  "approved-pending-proof": withEmbedded,
  "publish-cleared": withEmbedded,
};

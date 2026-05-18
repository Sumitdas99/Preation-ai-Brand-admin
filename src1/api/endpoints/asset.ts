import { apiClient } from "../client";
import { Asset } from "../schemas/asset";

export function getAsset(
  assetId: string,
  signal?: AbortSignal,
): Promise<Asset> {
  return apiClient.get(
    `/api/v1/assets/${encodeURIComponent(assetId)}`,
    Asset,
    { signal },
  );
}

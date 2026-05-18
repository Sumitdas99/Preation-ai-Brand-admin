import { apiClient } from "../client";
import {
  C2paEmbedRequest,
  C2paEmbedResponse,
} from "../schemas/c2pa";

export function embedC2paManifest(
  assetId: string,
  body: Omit<C2paEmbedRequest, "asset_id"> = {},
): Promise<C2paEmbedResponse> {
  const payload: C2paEmbedRequest = { asset_id: assetId, ...body };
  C2paEmbedRequest.parse(payload);
  return apiClient.post(
    `/api/v1/c2pa/${encodeURIComponent(assetId)}/embed`,
    payload,
    C2paEmbedResponse,
  );
}

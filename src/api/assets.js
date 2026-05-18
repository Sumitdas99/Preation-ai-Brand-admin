import ApiClient from "../api-client";
import { API_URL } from "../environment";

/**
 * Compute SHA-256 hash of a File (for multipart duplicate check).
 * @param {File} file
 * @returns {Promise<string>} 64-char hex string
 */
export const computeFileSha256 = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
};

/**
 * Upload an asset file
 * @param {FormData} formData - FormData object containing the file and metadata
 * @param {Function} onUploadProgress - Callback for upload progress events
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @returns {Promise<Object>} Response with uploaded asset details
 */
export const uploadAsset = async (formData, onUploadProgress, dispatch = null) => {
    try {
        const response = await ApiClient.upload(
            `${API_URL}/assets/upload`,
            formData,
            null,
            onUploadProgress
        );
        return response;
    } catch (error) {
        const errorMessage = error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Failed to upload asset. Please try again.";
        throw new Error(errorMessage);
    }
};

/**
 * Get list of assets (paginated, newest first)
 * @param {Object} params - Query parameters (brand_id, skip, limit)
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @returns {Promise<{ items: Array, total: number }>} { items: list of assets, total: total count }
 */
export const getAssets = async (params = {}, dispatch = null) => {
    try {
        const response = await ApiClient.get(
            `${API_URL}/assets/`,
            params,
            null,
            dispatch,
            { timeout: 90000 }
        );
        // API returns { items, total }; support legacy array response for backward compatibility
        if (response && typeof response.total === "number" && Array.isArray(response.items)) {
            return response;
        }
        if (Array.isArray(response)) {
            return { items: response, total: response.length };
        }
        return { items: [], total: 0 };
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to fetch assets");
    }
};
export const deleteAsset = async (params = {}, dispatch = null) => {

};

/**
 * Get asset by ID
 * @param {string} assetId - Asset UUID
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @returns {Promise<Object>} Asset details
 */
export const getAsset = async (assetId, dispatch = null) => {
    try {
        const response = await ApiClient.get(
            `${API_URL}/assets/${assetId}`,
            {},
            null,
            dispatch
        );
        return response;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to fetch asset");
    }
};

/**
 * Get presigned URL for asset preview
 * @param {string} assetId - Asset UUID
 * @param {number} expiration - URL expiration time in seconds (default: 3600)
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @returns {Promise<Object>} Object with preview_url and expires_in
 */
export const getAssetPreviewUrl = async (assetId, expiration = 3600, dispatch = null) => {
    try {
        const response = await ApiClient.get(
            `${API_URL}/assets/${assetId}/preview-url`,
            { expiration },
            null,
            dispatch
        );
        return response;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to get asset preview URL");
    }
};

/**
 * Get asset analysis status (asset_analysis_status table via Preflight Orchestrator).
 * Fire-and-forget: call from Asset Review; response is not displayed in UI.
 * @param {string} assetId - Asset UUID
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @returns {Promise<Object|null>} Analysis status or null on error (no throw)
 */
export const getAssetAnalysisStatus = async (assetId, dispatch = null) => {
    try {
        const response = await ApiClient.get(
            `${API_URL}/assets/${assetId}/analysis-status`,
            {},
            null,
            dispatch
        );
        return response;
    } catch (error) {
        // Intentionally not throwing: this call is optional and not shown in UI
        return null;
    }
};

// ==========================================
// S3 Multipart Upload Methods
// ==========================================

import axios from "axios";

/**
 * Initiate Multipart Upload
 * @param {Object} payload - { filename, file_type, file_size_bytes, brand_id, file_sha256?, ... }
 * @returns {Promise<Object>} { asset_id, upload_id, key }
 * @throws On 409: duplicate file; error.message and error.existingAssetId may be set
 */
export const initiateMultipartUpload = async (payload) => {
    try {
        const response = await ApiClient.post(
            `${API_URL}/assets/upload/initiate`,
            payload,
            null,
            null
        );
        return response;
    } catch (error) {
        const detail = error.response?.data?.detail;
        if (error.response?.status === 409 && detail && typeof detail === "object" && detail.existing_asset_id) {
            const e = new Error(detail.message || "An asset with this file already exists.");
            e.existingAssetId = detail.existing_asset_id;
            e.code = "DUPLICATE_ASSET";
            throw e;
        }
        throw new Error(typeof detail === "string" ? detail : detail?.message || "Failed to initiate upload");
    }
};

/**
 * Get Presigned URL for a Part
 * @param {string} assetId 
 * @param {string} uploadId 
 * @param {number} partNumber 
 * @returns {Promise<string>} Presigned URL
 */
export const getPresignedUrl = async (assetId, uploadId, partNumber) => {
    try {
        const response = await ApiClient.post(
            `${API_URL}/assets/upload/${assetId}/presign`,
            { upload_id: uploadId, part_number: partNumber },
            null,
            null
        );
        return response.url;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to get upload URL");
    }
};

/**
 * Get presigned URLs for multiple parts in one request (batch).
 * @param {string} assetId 
 * @param {string} uploadId 
 * @param {number[]} partNumbers - e.g. [1, 2, 3, ...]
 * @returns {Promise<Array<{ part_number: number, url: string }>>}
 */
export const getPresignedUrlBatch = async (assetId, uploadId, partNumbers) => {
    try {
        const response = await ApiClient.post(
            `${API_URL}/assets/upload/${assetId}/presign-batch`,
            { upload_id: uploadId, part_numbers: partNumbers },
            null,
            null
        );
        return response.urls || [];
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to get upload URLs");
    }
};

/**
 * Upload a chunk directly to S3
 * @param {string} url - Presigned URL
 * @param {Blob} chunkBlob - The chunk data
 * @param {Function} onProgress - (progressEvent) => void
 * @returns {Promise<string>} ETag
 */
export const uploadPartToS3 = async (url, chunkBlob, onProgress) => {
    try {
        // Use raw axios to avoid ApiClient interceptors (Authorization headers etc.)
        const response = await axios.put(url, chunkBlob, {
            headers: {
                "Content-Type": "application/octet-stream"
            },
            onUploadProgress: onProgress
        });

        // ETag is required for completion
        let etag = response.headers.etag || response.headers.ETag;
        if (etag) {
            return etag.replaceAll('"', ''); // Remove surrounding quotes if present
        }
        throw new Error("No ETag in S3 response");
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw new Error("Failed to upload chunk to S3");
    }
};

/**
 * Complete Multipart Upload
 * @param {string} assetId 
 * @param {string} uploadId 
 * @param {Array} parts - [{ PartNumber, ETag }]
 * @returns {Promise<Object>} Completed Asset
 */
export const completeMultipartUpload = async (assetId, uploadId, parts) => {
    try {
        // Sort parts by PartNumber just in case
        const sortedParts = parts.sort((a, b) => a.PartNumber - b.PartNumber);

        const response = await ApiClient.post(
            `${API_URL}/assets/upload/${assetId}/complete`,
            { upload_id: uploadId, parts: sortedParts },
            null,
            null
        );
        return response;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to complete upload");
    }
};

/**
 * Abort Multipart Upload
 * @param {string} assetId 
 * @param {string} uploadId 
 */
export const abortMultipartUpload = async (assetId, uploadId) => {
    try {
        await ApiClient.post(
            `${API_URL}/assets/upload/${assetId}/abort?upload_id=${encodeURIComponent(uploadId)}`,
            {}, // Empty body
            null,
            null
        );
    } catch (error) {
        console.warn("Abort failed:", error);
    }
};

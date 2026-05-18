import ApiClient, { axiosInstance } from "../api-client";
import { API_URL } from "../environment";


/**
 * Create a new brand
 * @param {Object} payload - Brand creation payload
 * @param {string} payload.brand_name - Brand name
 * @param {string} [payload.legal_company_name] - Legal company name
 * @param {string} [payload.address] - Business address
 * @param {string} payload.country - Country
 * @param {string} [payload.business_contact_email] - Business contact email
 * @param {string} [payload.business_phone] - Business phone
 * @param {string} [payload.website_url] - Website URL
 * @param {string} [payload.industry] - Industry
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @returns {Promise<Object>} Response with created brand details
 */
export const createBrand = async (payload, dispatch = null) => {
    try {
        const response = await ApiClient.post(
            `${API_URL}/brands`,
            payload,
            null,
            dispatch
        );
        return response;
    } catch (error) {
        const errorMessage = error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Failed to create brand. Please try again.";
        throw new Error(errorMessage);
    }
};



/**
 * Update brand thresholds
 * @param {string} brandId - Brand ID (UUID string)
 * @param {Object} payload - Thresholds update payload
 * @param {number} [payload.synthetic_threshold] - Synthetic threshold value
 * @param {number} [payload.suitability_threshold] - Suitability threshold value
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @returns {Promise<Object>} Response with updated thresholds
 */
export const updateBrandThresholds = async (brandId, payload, dispatch = null) => {
    try {
        const response = await ApiClient.put(
            `${API_URL}/brands/${brandId}/thresholds`,
            payload,
            null,
            dispatch
        );
        return response;
    } catch (error) {
        const errorMessage = error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Failed to update thresholds. Please try again.";
        throw new Error(errorMessage);
    }
};

/**
 * Update brand integrations
 * @param {string} brandId - Brand ID (UUID string)
 * @param {Object} payload - Integrations update payload
 * @param {boolean} [payload.google_drive_enabled] - Google Drive enabled flag
 * @param {boolean} [payload.sharepoint_enabled] - SharePoint enabled flag
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @returns {Promise<Object>} Response with updated integrations
 */
export const updateBrandIntegrations = async (brandId, payload, dispatch = null) => {
    try {
        const response = await ApiClient.put(
            `${API_URL}/brands/${brandId}/integrations`,
            payload,
            null,
            dispatch
        );
        return response;
    } catch (error) {
        const errorMessage = error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Failed to update integrations. Please try again.";
        throw new Error(errorMessage);
    }
};



/**
 * Get a single brand by ID
 * @param {string} brandId - Brand ID (UUID string)
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @returns {Promise<Object>} Response with brand details
 */
export const getBrand = async (brandId, dispatch = null) => {
    try {
        const response = await ApiClient.get(
            `${API_URL}/brands/${brandId}`,
            {},
            null,
            dispatch
        );
        return response;
    } catch (error) {
        const errorMessage = error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch brand. Please try again.";
        throw new Error(errorMessage);
    }
};

/**
 * Update a brand
 * @param {string} brandId - Brand ID (UUID string)
 * @param {Object} payload - Brand update payload
 * @param {string} [payload.brand_name] - Brand name
 * @param {string} [payload.description] - Brand description
 * @param {number} [payload.synthetic_threshold] - Synthetic threshold value
 * @param {number} [payload.suitability_threshold] - Suitability threshold value
 * @param {boolean} [payload.google_drive_enabled] - Google Drive enabled flag
 * @param {boolean} [payload.sharepoint_enabled] - SharePoint enabled flag
 * @param {boolean} [payload.is_active] - Brand active status
 * @param {string[]} [payload.enabled_jurisdictions] - Workspace policy: regions to apply (e.g. DE, FR, EU). Empty/null = no filter.
 * @param {string[]} [payload.enabled_platforms] - Workspace policy: platforms to apply (e.g. INSTAGRAM, TIKTOK). Empty/null = no filter.
 * @param {string[]} [payload.enabled_pack_ids] - Workspace policy: allowlist of policy pack IDs. Empty/null = no filter.
 * Policies screen (all optional 0-1 floats or booleans): synthetic_high_threshold, synthetic_probable_threshold,
 * alcohol_block_threshold, alcohol_flag_threshold, minors_block_threshold, minors_review_threshold,
 * violence_block_threshold, violence_flag_threshold, nudity_block_threshold, nudity_flag_threshold,
 * hate_symbols_block_threshold, hate_symbols_flag_threshold, drugs_block_threshold, drugs_flag_threshold,
 * face_detection_confidence, face_prominence_threshold, synthetic_voice_threshold, human_voice_prominence,
 * background_speech_threshold, germany_strict_enabled, france_beauty_enabled.
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @returns {Promise<Object>} Response with updated brand details
 */
export const updateBrand = async (brandId, payload, dispatch = null) => {
    try {
        const response = await ApiClient.put(
            `${API_URL}/brands/${brandId}`,
            payload,
            null,
            dispatch
        );
        return response;
    } catch (error) {
        const errorMessage = error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Failed to update brand. Please try again.";
        throw new Error(errorMessage);
    }
};



/**
 * Delete a brand (soft delete)
 * @param {string} brandId - Brand ID (UUID string)
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @returns {Promise<Object>} Response with deletion confirmation
 */
export const deleteBrand = async (brandId, dispatch = null) => {
    try {
        const response = await ApiClient.delete(
            `${API_URL}/brands/${brandId}`,
            {},
            null,
            dispatch
        );
        return response;
    } catch (error) {
        const errorMessage = error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Failed to delete brand. Please try again.";
        throw new Error(errorMessage);
    }
};


/**
 * Disconnect Google Drive: stop watch folders, revoke token at Google, remove from DB.
 * @param {string} brandId - Brand ID
 * @param {Function} dispatch - Redux dispatch (optional)
 */
export const disconnectGoogleDrive = async (brandId, dispatch = null) => {
    await ApiClient.delete(
        `${API_URL}/brands/${brandId}/integrations/google`,
        {},
        null,
        dispatch
    );
};

/**
 * Disconnect SharePoint: remove watch folders and tokens from DB.
 * @param {string} brandId - Brand ID
 * @param {Function} dispatch - Redux dispatch (optional)
 */
export const disconnectSharePoint = async (brandId, dispatch = null) => {
    await ApiClient.delete(
        `${API_URL}/brands/${brandId}/integrations/microsoft`,
        {},
        null,
        dispatch
    );
};

/**
 * Get Google Drive OAuth URL
 * @param {string} brandId - Brand ID
 * @param {string} redirectUri - Redirect URI
 * @param {Function} dispatch - Redux dispatch (optional)
 * @returns {Promise<Object>} Response with auth_url
 */
export const getGoogleAuthUrl = async (brandId, redirectUri, dispatch = null) => {
    try {
        const response = await ApiClient.get(
            `${API_URL}/brands/${brandId}/integrations/google/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`,
            {},
            null,
            dispatch
        );
        return response;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to get auth URL");
    }
};

/**
 * Handle Google Drive OAuth Callback
 * @param {string} brandId - Brand ID
 * @param {string} code - OAuth code
 * @param {string} redirectUri - Redirect URI used
 * @param {Function} dispatch - Redux dispatch (optional)
 * @returns {Promise<Object>} Response with user info
 */
export const handleGoogleCallback = async (brandId, code, redirectUri, dispatch = null) => {
    try {
        const response = await ApiClient.post(
            `${API_URL}/brands/${brandId}/integrations/google/callback`,
            { code, redirect_uri: redirectUri },
            null,
            dispatch
        );
        return response;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to connect Google Drive");
    }
};

/**
 * Setup a watch folder
 * @param {string} brandId - Brand ID
 * @param {Object} payload - Watch config
 * @param {string} payload.source - 'google_drive' or 'sharepoint'
 * @param {string} payload.folder_id - Folder ID
 * @param {string} [payload.folder_name] - Folder Name
 * @param {Function} dispatch - Redux dispatch (optional)
 * @returns {Promise<Object>} Response with watch details
 */
export const setupWatchFolder = async (brandId, payload, dispatch = null) => {
    try {
        const response = await ApiClient.post(
            `${API_URL}/brands/${brandId}/watch`,
            payload,
            null,
            dispatch
        );
        return response;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to setup watch folder");
    }
};

/**
 * List watch folders for a brand
 * @param {string} brandId - Brand ID
 * @param {Function} dispatch - Redux dispatch (optional)
 * @returns {Promise<Array>} List of watch folders { id, folder_id, folder_name, provider, is_active }
 */
export const listWatchedFolders = async (brandId, dispatch = null) => {
    try {
        const response = await ApiClient.get(
            `${API_URL}/brands/${brandId}/watch`,
            {},
            null,
            dispatch
        );
        return Array.isArray(response) ? response : [];
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to list watch folders");
    }
};

/**
 * Remove (stop) a watch folder for the brand
 * @param {string} brandId - Brand ID
 * @param {string} watchId - Watch folder ID (UUID)
 * @param {Function} dispatch - Redux dispatch (optional)
 */
export const removeWatchFolder = async (brandId, watchId, dispatch = null) => {
    await ApiClient.delete(
        `${API_URL}/brands/${brandId}/watch/${watchId}`,
        {},
        null,
        dispatch
    );
};

/**
 * List Google Drive Files
 * @param {string} brandId - Brand ID
 * @param {string} [pageToken] - Page token
 * @param {Function} dispatch - Redux dispatch (optional)
 * @returns {Promise<Object>} List of files
 */
export const listGoogleFiles = async (brandId, pageToken = null, q = null, folderId = 'root', fileType = null, section = 'my_drive', dispatch = null) => {
    try {
        const params = new URLSearchParams();
        if (pageToken) params.append("page_token", pageToken);
        if (q) params.append("q", q);
        if (folderId) params.append("folder_id", folderId);
        if (fileType) params.append("type", fileType);
        if (section) params.append("section", section);

        const url = `${API_URL}/brands/${brandId}/integrations/google/files?${params.toString()}`;
        const response = await ApiClient.get(
            url,
            {},
            null,
            dispatch
        );
        return response;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to list files");
    }
};

/**
 * Import Google Drive File
 * @param {string} brandId - Brand ID
 * @param {Object} file - File object (id, name, mimeType)
 * @param {Function} dispatch - Redux dispatch (optional)
 * @returns {Promise<Blob>} File content blob
 */
export const importGoogleFile = async (brandId, file, dispatch = null) => {
    try {
        const response = await axiosInstance.post(
            `${API_URL}/brands/${brandId}/integrations/google/import`,
            {
                file_id: file.id,
                file_name: file.name,
                mime_type: file.mimeType
            },
            {
                // Important: Request blob response to handle binary file data
                responseType: 'blob',
                headers: {
                    // Authorization header is added by interceptor, but we can ensure JSON content type for payload
                    "Content-Type": "application/json",
                }
            }
        );
        return response.data; // This will be the Blob object
    } catch (error) {
        // If response is a blob (error case), we might need to parse it to text to see error message
        if (error.response && error.response.data instanceof Blob) {
            try {
                const text = await error.response.data.text();
                const errorJson = JSON.parse(text);
                throw new Error(errorJson.detail || "Failed to import file");
            } catch (e) {
                // If parsing fails, fall back to generic error
            }
        }
        throw new Error(error.response?.data?.detail || "Failed to import file");
    }
};
/**
 * Get Microsoft OAuth URL
 * @param {string} brandId - Brand ID
 * @param {string} redirectUri - Redirect URI
 * @param {Function} dispatch - Redux dispatch (optional)
 * @returns {Promise<Object>} Response with auth_url
 */
export const getMicrosoftAuthUrl = async (brandId, redirectUri, dispatch = null) => {
    try {
        const response = await ApiClient.get(
            `${API_URL}/brands/${brandId}/integrations/microsoft/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`,
            {},
            null,
            dispatch
        );
        return response;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to get auth URL");
    }
};

/**
 * Handle Microsoft OAuth Callback
 * @param {string} brandId - Brand ID
 * @param {string} code - OAuth code
 * @param {string} redirectUri - Redirect URI used
 * @param {Function} dispatch - Redux dispatch (optional)
 * @returns {Promise<Object>} Response with user info
 */
export const handleMicrosoftCallback = async (brandId, code, redirectUri, dispatch = null) => {
    try {
        const response = await ApiClient.post(
            `${API_URL}/brands/${brandId}/integrations/microsoft/callback`,
            { code, redirect_uri: redirectUri },
            null,
            dispatch
        );
        return response;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to connect SharePoint");
    }
};

/**
 * List Microsoft SharePoint/OneDrive Files
 * @param {string} brandId - Brand ID
 * @param {string} [folderId] - Folder ID (default 'root')
 * @param {string} [pageToken] - Page token
 * @param {Function} dispatch - Redux dispatch (optional)
 * @returns {Promise<Object>} List of files
 */
export const listMicrosoftFiles = async (brandId, folderId = 'root', pageToken = null, dispatch = null) => {
    try {
        const params = new URLSearchParams();
        if (folderId) params.append("folder_id", folderId);
        if (pageToken) params.append("page_token", pageToken);

        const url = `${API_URL}/brands/${brandId}/integrations/microsoft/files?${params.toString()}`;
        const response = await ApiClient.get(
            url,
            {},
            null,
            dispatch
        );
        return response;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to list SharePoint files");
    }
};

import ApiClient from "../api-client";
import { API_URL } from "../environment";

/**
 * Get audit logs with pagination and filtering
 * @param {Object} params - Query parameters
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 20)
 *   - action: Filter by action type
 *   - search: Search in action, resource, or status
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @returns {Promise<Object>} { items: Array, total: number, page: number, limit: number, pages: number }
 */
export const getAuditLogs = async (params = {}, dispatch = null) => {
    try {
        const response = await ApiClient.get(
            `${API_URL}/audit/logs`,
            params,
            null,
            dispatch
        );
        return response;
    } catch (error) {
        const errorMessage = error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch audit logs. Please try again.";
        throw new Error(errorMessage);
    }
};




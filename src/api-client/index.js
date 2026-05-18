import axios from "axios";
import { API_URL } from "../environment";
import { logout as logoutAction } from "../context/slice/authSlice";
import { store } from "../context/store";

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token and common headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage (synced with Redux persist)
    const authState = JSON.parse(localStorage.getItem("persist:root") || "{}");
    let token = null;

    try {
      const auth = JSON.parse(authState.auth || "{}");
      token = auth.token;
    } catch (e) {
      // If parsing fails, token remains null
    }

    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add referrer module header
    if (typeof window !== "undefined") {
      config.headers.referrermodule = window.location.href;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      error.message = error.message || "Network error. Please check your connection.";
      return Promise.reject(error);
    }

    // Handle specific status codes
    const status = error.response?.status;
    const statusCode = error.response?.data?.statusCode;

    // 401 Unauthorized - Invalid or expired token
    if (status === 401 || statusCode === 401) {
      handleUnauthorized();
    }

    // 403 Forbidden - Account not approved or insufficient permissions
    if (status === 403 || statusCode === 403) {
      handleForbidden();
    }

    return Promise.reject(error);
  }
);

// Handle unauthorized access (401) - e.g. force logout, expired or invalid token
const handleUnauthorized = () => {
  // Clear auth state from storage
  localStorage.removeItem("persist:root");
  localStorage.removeItem("userRole");
  localStorage.removeItem("auth_token");

  // Clear Redux auth state so UI reflects logged-out state
  try {
    store.dispatch(logoutAction());
  } catch (e) {
    // ignore if store not ready
  }

  // Redirect to login so user must sign in again (full navigation clears any in-memory state)
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// Handle forbidden access (403)
const handleForbidden = () => {
  // Do not clear auth state on 403. 
  // 403 means authenticated but not authorized for this resource.
  // We should just show an error, not log the user out.

  // localStorage.removeItem("persist:root");
  // localStorage.removeItem("userRole");

  // Do NOT automatically redirect. Let the caller handle the 403 error.
};

// Helper to get token from Redux store (for manual token passing if needed)
const getTokenFromStore = (store) => {
  if (!store) return null;
  try {
    const state = store.getState();
    return state?.auth?.token || null;
  } catch (e) {
    return null;
  }
};

// Helper to build query string from params
const buildQueryString = (params) => {
  if (!params || typeof params !== "object") return "";

  const queryParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== null && params[key] !== undefined) {
      queryParams.append(key, params[key]);
    }
  });

  const query = queryParams.toString();
  return query ? `?${query}` : "";
};

/**
 * Centralized API Client for making HTTP requests
 * Automatically handles:
 * - Base URL from environment
 * - Authentication tokens from Redux store
 * - Error handling and status codes
 * - Request/response interceptors
 */
class ApiClient {
  /**
   * Store reference for manual token access (optional)
   * Can be set via setStore() method
   */
  static store = null;

  /**
   * Set Redux store reference (optional, for advanced use cases)
   * @param {Object} store - Redux store instance
   */
  static setStore(store) {
    this.store = store;
  }

  /**
   * Make POST request
   * @param {string} url - API endpoint (relative to base URL)
   * @param {Object} data - Request body data
   * @param {string|null} token - Optional token override (if not provided, uses token from store)
   * @param {Function|null} dispatch - Optional Redux dispatch function for logout actions
   * @returns {Promise} Promise that resolves with response data or rejects with error
   */
  static async post(url, data = {}, token = null, dispatch = null) {
    try {
      const config = {};

      // Override token if provided
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }

      const response = await axiosInstance.post(url, data, config);
      return response.data;
    } catch (error) {
      // Error is already processed by interceptor
      // But we handle logout dispatch if provided
      if (dispatch && (error.response?.status === 401 || error.response?.status === 403)) {
        dispatch(logoutAction());
      }
      throw error;
    }
  }

  /**
   * Make PUT request
   * @param {string} url - API endpoint (relative to base URL)
   * @param {Object} data - Request body data
   * @param {string|null} token - Optional token override
   * @param {Function|null} dispatch - Optional Redux dispatch function
   * @returns {Promise} Promise that resolves with response data or rejects with error
   */
  static async put(url, data = {}, token = null, dispatch = null) {
    try {
      const config = {};

      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }

      const response = await axiosInstance.put(url, data, config);
      return response.data;
    } catch (error) {
      if (dispatch && (error.response?.status === 401 || error.response?.status === 403)) {
        dispatch(logoutAction());
      }
      throw error;
    }
  }

  /**
   * Make GET request
   * @param {string} url - API endpoint (relative to base URL)
   * @param {Object} params - Query parameters
   * @param {string|null} token - Optional token override
   * @param {Function|null} dispatch - Optional Redux dispatch function
   * @param {Object} options - Optional request options (e.g. { timeout: 60000 })
   * @returns {Promise} Promise that resolves with response data or rejects with error
   */
  static async get(url, params = {}, token = null, dispatch = null, options = {}) {
    try {
      const queryString = buildQueryString(params);
      const fullUrl = queryString ? `${url}${queryString}` : url;

      const config = { ...options };

      if (token) {
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
      }

      const response = await axiosInstance.get(fullUrl, config);
      return response.data;
    } catch (error) {
      if (dispatch && (error.response?.status === 401 || error.response?.status === 403)) {
        dispatch(logoutAction());
      }
      throw error;
    }
  }

  /**
   * Make DELETE request
   * @param {string} url - API endpoint (relative to base URL)
   * @param {Object} data - Optional request body data
   * @param {string|null} token - Optional token override
   * @param {Function|null} dispatch - Optional Redux dispatch function
   * @returns {Promise} Promise that resolves with response data or rejects with error
   */
  static async delete(url, data = {}, token = null, dispatch = null) {
    try {
      const config = {};

      if (data && Object.keys(data).length > 0) {
        config.data = data;
      }

      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }

      const response = await axiosInstance.delete(url, config);
      return response.data;
    } catch (error) {
      if (dispatch && (error.response?.status === 401 || error.response?.status === 403)) {
        dispatch(logoutAction());
      }
      throw error;
    }
  }

  /**
   * Make PATCH request
   * @param {string} url - API endpoint (relative to base URL)
   * @param {Object} data - Request body data
   * @param {string|null} token - Optional token override
   * @param {Function|null} dispatch - Optional Redux dispatch function
   * @returns {Promise} Promise that resolves with response data or rejects with error
   */
  static async patch(url, data = {}, token = null, dispatch = null) {
    try {
      const config = {};

      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }

      const response = await axiosInstance.patch(url, data, config);
      return response.data;
    } catch (error) {
      if (dispatch && (error.response?.status === 401 || error.response?.status === 403)) {
        dispatch(logoutAction());
      }
      throw error;
    }
  }

  /**
   * Upload file with multipart/form-data
   * @param {string} url - API endpoint (relative to base URL)
   * @param {FormData} formData - FormData object with file
   * @param {string|null} token - Optional token override
   * @param {Function} onUploadProgress - Optional progress callback
   * @returns {Promise} Promise that resolves with response data or rejects with error
   */
  static async upload(url, formData, token = null, onUploadProgress = null) {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (onUploadProgress) {
        config.onUploadProgress = onUploadProgress;
      }

      const response = await axiosInstance.post(url, formData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export axios instance for advanced use cases
export { axiosInstance };

export default ApiClient;

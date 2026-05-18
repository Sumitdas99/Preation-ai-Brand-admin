/**
 * Error Handler Utility
 * Provides consistent error handling and user-friendly error messages
 */

/**
 * Extract user-friendly error message from API error
 * @param {Error} error - Error object from API call
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Network errors
  if (!error.response) {
    return error.message || "Network error. Please check your connection and try again.";
  }

  // Server errors with response
  const response = error.response;
  const data = response.data;

  // Try to extract message from different response formats
  if (data?.message) {
    return data.message;
  }

  if (data?.detail) {
    return data.detail;
  }

  if (data?.error) {
    return typeof data.error === "string" ? data.error : data.error.message || "An error occurred";
  }

  // Status code based messages
  const status = response.status;
  switch (status) {
    case 400:
      return "Invalid request. Please check your input and try again.";
    case 401:
      return "Authentication failed. Please log in again.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "A conflict occurred. The resource may already exist.";
    case 422:
      return "Validation error. Please check your input.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
      return "Server error. Please try again later.";
    case 502:
      return "Service temporarily unavailable. Please try again later.";
    case 503:
      return "Service unavailable. Please try again later.";
    default:
      return `An error occurred (${status}). Please try again.`;
  }
};

/**
 * Check if error is a network error
 * @param {Error} error - Error object
 * @returns {boolean} True if network error
 */
export const isNetworkError = (error) => {
  return !error.response && (error.code === "ECONNABORTED" || error.message === "Network Error");
};

/**
 * Check if error is an authentication error
 * @param {Error} error - Error object
 * @returns {boolean} True if authentication error
 */
export const isAuthError = (error) => {
  const status = error.response?.status;
  return status === 401 || status === 403;
};

/**
 * Check if error is a validation error
 * @param {Error} error - Error object
 * @returns {boolean} True if validation error
 */
export const isValidationError = (error) => {
  return error.response?.status === 422 || error.response?.status === 400;
};

/**
 * Extract validation errors from error response
 * @param {Error} error - Error object
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const getValidationErrors = (error) => {
  if (!isValidationError(error)) {
    return {};
  }

  const data = error.response?.data;
  
  // Handle different validation error formats
  if (data?.errors) {
    return data.errors;
  }

  if (data?.detail && Array.isArray(data.detail)) {
    const errors = {};
    data.detail.forEach((item) => {
      if (item.loc && item.msg) {
        const field = item.loc[item.loc.length - 1];
        errors[field] = item.msg;
      }
    });
    return errors;
  }

  return {};
};

export default {
  getErrorMessage,
  isNetworkError,
  isAuthError,
  isValidationError,
  getValidationErrors,
};




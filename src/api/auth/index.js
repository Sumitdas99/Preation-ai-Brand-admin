import axios from "axios";
import ApiClient from "../../api-client";
import { API_URL } from "../../environment";


/**
 * Send OTP for signup (Step 1 of 2-step signup flow)
 * @param {Object} payload - Signup OTP request payload
 * @param {string} payload.firstName - User's first name
 * @param {string} payload.lastName - User's last name
 * @param {string} payload.email - User's email address
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @returns {Promise<Object>} Response with message, email, and expires_in
 */
export const sendSignupOtp = async ({ firstName, lastName, email }, dispatch = null) => {
  try {
    const response = await ApiClient.post(
      `${API_URL}/auth/signup/send-otp`,
      { firstName, lastName, email },
      null,
    );
    return response;
  } catch (error) {
    // Extract error message from backend response
    const errorMessage = error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Failed to send verification code. Please try again.";
    throw new Error(errorMessage);
  }
};

/**
 * Verify OTP and complete signup (Step 2 of 2-step signup flow)
 * @param {Object} payload - Verify OTP and signup request payload
 * @param {string} payload.email - User's email address
 * @param {string} payload.otp - 6-digit OTP code
 * @param {string} payload.firstName - User's first name
 * @param {string} payload.lastName - User's last name
 * @param {string} payload.password - User's password
 * @param {string} payload.brand_name - Brand/company name
 * @param {string} payload.country - Country
 * @param {string} [payload.display_name] - Optional display name
 * @param {string} [payload.legal_company_name] - Optional legal company name
 * @param {string} [payload.address] - Optional business address
 * @param {string} [payload.business_contact_email] - Optional business contact email
 * @param {string} [payload.business_phone] - Optional business phone
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @returns {Promise<Object>} Response with user details and brand information
 */
export const verifySignupWithOtp = async (payload, dispatch = null) => {
  try {

    const endpoint = payload.checkOnly ? '/auth/signup/verify-otp-check' : '/auth/signup';

    const response = await ApiClient.post(
      `${API_URL}${endpoint}`,
      payload,
      null,
      dispatch
    );
    return response;
  } catch (error) {
    // Extract error message from backend response
    const errorMessage = error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Failed to complete signup. Please try again.";
    throw new Error(errorMessage);
  }
};

/**
 * User login - Authenticate user and get access token
 * @param {Object} payload - Login request payload
 * @param {string} payload.email - User's email address
 * @param {string} payload.password - User's password
 * @param {Function} dispatch - Redux dispatch function (optional)
 * @returns {Promise<Object>} Response with user details and access token
 */
export const login = async ({ email, password }, dispatch = null) => {
  try {
    const response = await ApiClient.post(
      `${API_URL}/auth/login`,
      { email, password },
      null,
      dispatch
    );
    return response;
  } catch (error) {
    // Extract error message from backend response
    const errorMessage = error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Login failed. Please check your credentials and try again.";
    throw new Error(errorMessage);
  }
};

/**
 * Super Admin login - dedicated endpoint; only accepts SUPER_ADMIN role.
 * @param {Object} payload - { email, password }
 * @param {Function} dispatch - Redux dispatch (optional)
 * @returns {Promise<Object>} Same shape as login (user_id, email, role, access_token, etc.)
 */
export const loginSuperAdmin = async ({ email, password }, dispatch = null) => {
  try {
    const response = await ApiClient.post(
      `${API_URL}/auth/super-admin/login`,
      { email, password },
      null,
      dispatch
    );
    return response;
  } catch (error) {
    const errorMessage = error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Login failed. Please check your credentials and try again.";
    throw new Error(errorMessage);
  }
};

// Google SSO
export const initiateGoogleSSO = async () => {
  try {
    const response = await ApiClient.get(`${API_URL}/auth/google/auth-url`);
    return response.auth_url;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to initiate Google SSO");
  }
};

export const handleGoogleCallback = async (code, dispatch = null) => {
  try {
    const response = await ApiClient.post(
      `${API_URL}/auth/google/callback`,
      { code },
      null,
      dispatch
    );
    return response;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || "Google authentication failed";
    throw new Error(errorMessage);
  }
};

// Microsoft SSO
export const initiateMicrosoftSSO = async () => {
  try {
    const response = await ApiClient.get(`${API_URL}/auth/microsoft/auth-url`);
    return response.auth_url;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to initiate Microsoft SSO");
  }
};

export const handleMicrosoftCallback = async (code, dispatch = null) => {
  try {
    const response = await ApiClient.post(
      `${API_URL}/auth/microsoft/callback`,
      { code },
      null,
      dispatch
    );
    return response;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || "Microsoft authentication failed";
    throw new Error(errorMessage);
  }
};

export const completeSSORegistration = async (payload, dispatch = null) => {
  try {
    const response = await ApiClient.post(
      `${API_URL}/auth/complete-registration`,
      payload,
      null,
      dispatch
    );
    return response;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || "Registration failed";
    throw new Error(errorMessage);
  }
};

// Forgot Password Flow
/**
 * Send OTP for forgot password
 * @param {string} email - User's email
 */
export const sendForgotPasswordOtp = async (email, dispatch = null) => {
  try {
    const response = await ApiClient.post(
      `${API_URL}/auth/forgot-password/send-otp`,
      { email },
      null,
      dispatch
    );
    return response;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || "Failed to send OTP";
    throw new Error(errorMessage);
  }
};

/**
 * Verify OTP for forgot password
 * @param {string} email - User's email
 * @param {string} otp - OTP code
 */
export const verifyForgotPasswordOtp = async (email, otp, dispatch = null) => {
  try {
    const response = await ApiClient.post(
      `${API_URL}/auth/forgot-password/verify-otp`,
      { email, otp },
      null,
      dispatch
    );
    return response;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || "Invalid or expired OTP";
    throw new Error(errorMessage);
  }
};

/**
 * Reset password with OTP
 * @param {string} email - User's email
 * @param {string} otp - OTP code
 * @param {string} newPassword - New password
 */
export const resetPasswordWithOtp = async (email, otp, newPassword, dispatch = null) => {
  try {
    const response = await ApiClient.post(
      `${API_URL}/auth/forgot-password/reset`,
      { email, otp, new_password: newPassword },
      null,
      dispatch
    );
    return response;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || "Failed to reset password";
    throw new Error(errorMessage);
  }
};
export const signUp = ({ values, dispatch }) => {
  return ApiClient.post(`${API_URL}/auth-service/auth/register`, values, null, dispatch);
};

export const signIn = ({ values, dispatch }) => {
  return ApiClient.post(`${API_URL}/auth-service/auth/login`, values, null, dispatch);
};

export const verification2FA = ({ values, dispatch }) => {
  return ApiClient.post(`${API_URL}/auth-service/auth/otp-verify`, values, null, dispatch);
};

export const resendOTP = ({ values, dispatch }) => {
  return ApiClient.post(`${API_URL}/auth-service/auth/otp-resend`, values, null, dispatch);
};

export const forgotPassword = ({ values, dispatch }) => {
  return ApiClient.post(`${API_URL}/auth-service/auth/forgot-password`, values, null, dispatch);
};

export const resetPassword = ({ values, dispatch }) => {
  return ApiClient.put(`${API_URL}/auth-service/auth/reset-password`, values, null, dispatch);
};

export const changePassword = ({ values, token, dispatch }) => {
  return ApiClient.put(`${API_URL}/auth-service/auth/change-password`, values, token, dispatch)
};

export const fetchUserData = ({ values, token, dispatch }) => {
  return ApiClient.post(`${API_URL}/auth-service/auth/get-login-user`, values, token, dispatch)
};

export const logout = ({ values, dispatch }) => {
  return ApiClient.post(`${API_URL}/auth-service/auth/logout`, values, null, dispatch);
};

export const verifyToken = ({ values, dispatch, token }) => {
  return ApiClient.put(`${API_URL}/auth-service/auth/verify-enrollment-token`, values, token, dispatch);
};

export const fetchAgent = ({ token, dispatch, values }) => {
  return ApiClient.get(`${API_URL}/auth-service/auth/get-agent`, {}, token, dispatch);
};

export const updateAgent = async (token, dispatch, formData) => {
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1], "formdata enter");
  }
  const response = await axios.put(`${API_URL}/auth-service/auth/update-agent`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data
  // return ApiClient.put(`${API_URL}/user-service/enrollment/update-agent`, formData, token, dispatch);
};

export const completeNewPasswordChallenge = async (payload, dispatch = null) => {
  try {
    const response = await ApiClient.post(
      `${API_URL}/auth/complete-new-password`,
      payload,
      null,
      dispatch
    );
    return response;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || "Failed to set new password";
    throw new Error(errorMessage);
  }
};

/**
 * Get user profile
 * @returns {Promise<Object>} User profile with email, firstName, lastName
 */
export const getProfile = async (dispatch = null) => {
  try {
    const response = await ApiClient.get(
      `${API_URL}/auth/profile`,
      {},
      null,
      dispatch
    );
    return response;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || "Failed to fetch profile";
    throw new Error(errorMessage);
  }
};

/**
 * Update user profile
 * @param {Object} payload - Profile update payload
 * @param {string} payload.firstName - User's first name
 * @param {string} payload.lastName - User's last name
 * @returns {Promise<Object>} Updated user profile
 */
export const updateProfile = async (payload, dispatch = null) => {
  try {
    const response = await ApiClient.put(
      `${API_URL}/auth/profile`,
      payload,
      null,
      dispatch
    );
    return response;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || "Failed to update profile";
    throw new Error(errorMessage);
  }
};

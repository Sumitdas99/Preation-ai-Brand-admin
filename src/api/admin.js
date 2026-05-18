import ApiClient from "../api-client";
import { API_URL } from "../environment";
import { decryptPayload } from "../lib/encryption";

export const adminApi = {
    // Brand Admin Requests (Legacy/Specific Feature)
    getBrandAdminRequests: async ({ status, search, page = 1, limit = 20 }) => {
        const params = {
            page,
            limit
        };
        if (status && status !== 'All Status') params.status = status.toLowerCase();
        if (search) params.search = search;

        const response = await ApiClient.get(`${API_URL}/auth/admin/approval-requests`, params);
        return decryptPayload(response);
    },

    getDashboardStats: async () => {
        return await ApiClient.get(`${API_URL}/auth/admin/dashboard/stats`);
    },

    approveBrandAdmin: async (userId) => {
        return await ApiClient.post(`${API_URL}/auth/admin/approval-requests/${userId}/approve`);
    },

    rejectBrandAdmin: async (userId, reason) => {
        return await ApiClient.post(`${API_URL}/auth/admin/approval-requests/${userId}/reject`, { reason });
    },

    /** Super Admin: Create brand and send Brand Admin invite (invite-link flow, no OTP). */
    createBrandAdminInvite: async (data) => {
        return await ApiClient.post(`${API_URL}/auth/super-admin/brand-admin/invite`, data);
    },

    // ==========================================
    // User Management (New Feature)
    // ==========================================

    getUsers: async ({ search, role, workspace, brand, status, start_date, end_date, page = 1, limit = 20 }) => {
        const params = { page, limit };
        if (search) params.search = search;
        if (role && role !== 'All Roles') params.role = role;
        if (workspace && workspace !== 'All Workspaces') params.workspace = workspace;
        if (brand && brand !== 'All Brands') params.brand = brand;
        if (status && status !== 'all') params.status = status;
        if (start_date) params.start_date = start_date;
        if (end_date) params.end_date = end_date;

        return await ApiClient.get(`${API_URL}/auth/admin/users`, params);
    },

    getRoles: async () => {
        return await ApiClient.get(`${API_URL}/auth/admin/roles`);
    },

    getWorkspaces: async () => {
        return await ApiClient.get(`${API_URL}/workspaces`);
    },

    inviteUser: async (data) => {
        return await ApiClient.post(`${API_URL}/users/invitations/`, data);
    },

    /** Super Admin: list brands with id and name (for invite-by-brand dropdown). */
    getBrandsList: async () => {
        return await ApiClient.get(`${API_URL}/auth/admin/brands/list`);
    },

    /** Super Admin: get current Brand Admin for a brand (for transfer UI). */
    getBrandAdmin: async (brandId) => {
        return await ApiClient.get(`${API_URL}/auth/admin/brands/${brandId}/brand-admin`);
    },

    /** Super Admin: change Brand Admin to (existing or new) email; optional password and name for new user. */
    transferBrandAdmin: async ({ brandId, fromUserId, toUserEmail, newTemporaryPassword, toUserFirstName, toUserLastName }) => {
        const body = {
            brand_id: brandId,
            from_user_id: fromUserId,
            to_user_email: toUserEmail,
        };
        if (newTemporaryPassword && newTemporaryPassword.length >= 8) {
            body.new_temporary_password = newTemporaryPassword;
        }
        if (toUserFirstName?.trim()) body.to_user_first_name = toUserFirstName.trim();
        if (toUserLastName?.trim()) body.to_user_last_name = toUserLastName.trim();
        return await ApiClient.post(`${API_URL}/auth/admin/transfer-brand-admin`, body);
    },

    /** Super Admin: invite user to a selected brand (brand_id + email + role + temp_password). */
    inviteUserAsSuperAdmin: async (data) => {
        return await ApiClient.post(`${API_URL}/users/invitations/super-admin`, data);
    },

    acceptInvitation: async (token) => {
        return await ApiClient.post(`${API_URL}/users/invitations/accept`, { token });
    },

    updateUserStatus: async (userId, isActive) => {
        return await ApiClient.post(`${API_URL}/auth/admin/users/${userId}/status`, { is_active: isActive });
    },

    /** Super Admin: force logout one user (sign out from all devices). */
    forceLogoutUser: async (userId) => {
        return await ApiClient.post(`${API_URL}/auth/admin/users/${userId}/force-logout`);
    },

    /** Super Admin: force logout all users. */
    forceLogoutAll: async () => {
        return await ApiClient.post(`${API_URL}/auth/admin/force-logout-all`);
    },

    /** Super Admin: force password reset for one user (set temp password; user must change on next login). */
    forcePasswordResetUser: async (userId, newTemporaryPassword) => {
        return await ApiClient.post(`${API_URL}/auth/admin/users/${userId}/force-password-reset`, {
            new_temporary_password: newTemporaryPassword,
        });
    },

    /** Super Admin: force password reset for all users. */
    forcePasswordResetAll: async (newTemporaryPassword) => {
        return await ApiClient.post(`${API_URL}/auth/admin/force-password-reset-all`, {
            new_temporary_password: newTemporaryPassword,
        });
    },

    // ==========================================
    // Team Members (Brand Admin Workspace Members)
    // ==========================================

    getTeamMembers: async ({ page = 1, limit = 10, search } = {}) => {
        const params = { page, limit };
        if (search) params.search = search;
        return await ApiClient.get(`${API_URL}/users/team-members/`, params);
    },

    /** Update a team member's role (Brand Admin / Super Admin). */
    updateMemberRole: async (userId, role) => {
        return await ApiClient.patch(`${API_URL}/users/team-members/${userId}/role`, { role });
    },

    /** Get pending invitations for a brand (Super Admin only). */
    getInvitationsByBrand: async (brandId) => {
        return await ApiClient.get(`${API_URL}/users/invitations/super-admin/by-brand`, { brand_id: brandId });
    },

    /** Get pending invitations for my brand (Brand Admin only). */
    getMyBrandInvitations: async () => {
        return await ApiClient.get(`${API_URL}/users/invitations/`);
    },
};

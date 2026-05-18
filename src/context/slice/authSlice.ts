import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "ADMIN" | "SUPER_ADMIN" | "BRAND_ADMIN" | "CONTENT_REVIEWER" | "LEGAL_APPROVER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  brandId?: string;
  brand_id?: string;
  brandName?: string;
  brand_name?: string;

  [key: string]: any;
}

interface AuthState {
  user: User | null;               // Stores logged-in user details
  token: string | null;            // Stores authentication token
  isAuthenticated: boolean;        // Tracks if user is logged in
  isLoading: boolean;              // Loading state for async actions
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

interface LoginPayload {
  user: User;
  token: string;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ✅ Login: Save user & token, update authentication state
    loginSuccess(state, action: PayloadAction<LoginPayload>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = !!action.payload.token;
    },

    // ✅ Logout: Reset to initial state
    logout() {
      return initialState;
    },

    // ✅ Set loading state for async actions
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    // ✅ Update user profile (firstName, lastName, name)
    updateUserProfile(state, action: PayloadAction<{ firstName: string; lastName: string }>) {
      if (state.user) {
        state.user.firstName = action.payload.firstName;
        state.user.lastName = action.payload.lastName;
        // Update name field for header display
        state.user.name = `${action.payload.firstName} ${action.payload.lastName}`.trim();
      }
    },
  },
});

// Export actions for use in components
export const { loginSuccess, logout, setLoading, updateUserProfile } = authSlice.actions;

// Selectors
export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectUserRole = (state: { auth: AuthState }): UserRole | null =>
  state.auth.user?.role || null;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;

// Export reducer to configure the Redux store
export default authSlice.reducer;


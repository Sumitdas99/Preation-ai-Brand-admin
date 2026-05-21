import ApiClient from "@/api-client";
import { API_URL } from "@/environment";

export interface BillingPack {
  brand_id: string;
  [key: string]: any;
}

export const billingService = {
  /**
   * Get billing pack details for a brand.
   * GET /api/v1/billing/admin/brands/:brandId/pack
   */
  getBillingPack: async (brandId: string): Promise<any> => {
    try {
      const response = await ApiClient.get(`${API_URL}/billing/admin/brands/${brandId}/pack`);
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.message || 
        "Failed to fetch billing pack details"
      );
    }
  },

  /**
   * Set up a billing/payment link.
   * POST /api/v1/billing/setup-link
   * Payload: { brand_id: string, billing_frequency: string }
   */
  setupBillingLink: async (data: { brand_id: string; billing_frequency?: "monthly" | "annually" | string }): Promise<any> => {
    try {
      const response = await ApiClient.post(`${API_URL}/billing/setup-link`, data);
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.message || 
        "Failed to set up billing link"
      );
    }
  },

  /**
   * Activate billing for a brand.
   * POST /api/v1/billing/activate
   * Payload: { brand_id: string }
   */
  activateBilling: async (data: { brand_id: string }): Promise<any> => {
    try {
      const response = await ApiClient.post(`${API_URL}/billing/activate`, data);
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.message || 
        "Failed to activate billing"
      );
    }
  },

  /**
   * Get payment status details for a brand.
   * GET /api/v1/billing/payment-status/:brandId
   */
  getPaymentStatus: async (brandId: string): Promise<any> => {
    try {
      const response = await ApiClient.get(`${API_URL}/billing/payment-status/${brandId}`);
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.message || 
        "Failed to fetch payment status"
      );
    }
  },

  /**
   * Get billing usage details for a brand.
   * GET /api/v1/billing/usage/:brandId
   */
  getBillingUsage: async (brandId: string): Promise<any> => {
    try {
      const response = await ApiClient.get(`${API_URL}/billing/usage/${brandId}`);
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.message || 
        "Failed to fetch billing usage details"
      );
    }
  }
};

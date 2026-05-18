export type BrandAdminRequestStatus = "pending" | "approved" | "rejected";

export interface BrandAdminRequest {
  id: string;
  brandName: string;
  adminName: string;
  workEmail: string;
  signupDate: Date;
  status: BrandAdminRequestStatus;
  organizationName: string;
  fullName: string;
  consentTimestamp: Date;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  aiComplianceConsent: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
}



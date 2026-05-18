import { request } from "../client";
import {
  ActivateSubscriptionRequest,
  ActivateSubscriptionResponse,
  BrandDetail,
  BrandListResponse,
  CreateBrandRequest,
  CreateBrandResponse,
  OveragePreviewResponse,
  PaymentStatus,
  SendInvitationRequest,
  SendInvitationResponse,
  SetupLinkRequest,
  SetupLinkResponse,
  UpdateBrandPackRequest,
  UpdateBrandPackResponse,
  UsageSnapshot,
} from "../schemas/billing";

const BILLING_BASE = "/api/v1/billing";
const ADMIN_BASE = `${BILLING_BASE}/admin`;

function billingHeaders(scenario: string): Record<string, string> {
  return { "x-billing-scenario": scenario };
}

export function listBrands(
  scenario: string,
  signal?: AbortSignal,
): Promise<BrandListResponse> {
  return request(`${ADMIN_BASE}/brands`, {
    method: "GET",
    schema: BrandListResponse,
    signal,
    headers: billingHeaders(scenario),
  });
}

export function getBrand(
  brandId: string,
  scenario: string,
  signal?: AbortSignal,
): Promise<BrandDetail> {
  return request(`${ADMIN_BASE}/brands/${encodeURIComponent(brandId)}`, {
    method: "GET",
    schema: BrandDetail,
    signal,
    headers: billingHeaders(scenario),
  });
}

export function createBrand(
  payload: CreateBrandRequest,
  scenario: string,
): Promise<CreateBrandResponse> {
  CreateBrandRequest.parse(payload);
  return request(`${ADMIN_BASE}/brands`, {
    method: "POST",
    body: payload,
    schema: CreateBrandResponse,
    headers: billingHeaders(scenario),
  });
}

export function getBrandPack(
  brandId: string,
  scenario: string,
  signal?: AbortSignal,
): Promise<UpdateBrandPackResponse> {
  return request(`${ADMIN_BASE}/brands/${encodeURIComponent(brandId)}/pack`, {
    method: "GET",
    schema: UpdateBrandPackResponse,
    signal,
    headers: billingHeaders(scenario),
  });
}

export function updateBrandPack(
  brandId: string,
  payload: UpdateBrandPackRequest,
  scenario: string,
): Promise<UpdateBrandPackResponse> {
  UpdateBrandPackRequest.parse(payload);
  return request(`${ADMIN_BASE}/brands/${encodeURIComponent(brandId)}/pack`, {
    method: "PATCH",
    body: payload,
    schema: UpdateBrandPackResponse,
    headers: billingHeaders(scenario),
  });
}

export function getOveragePreview(
  brandId: string,
  scenario: string,
  signal?: AbortSignal,
): Promise<OveragePreviewResponse> {
  return request(
    `${ADMIN_BASE}/brands/${encodeURIComponent(brandId)}/overage-preview`,
    {
      method: "GET",
      schema: OveragePreviewResponse,
      signal,
      headers: billingHeaders(scenario),
    },
  );
}

export function sendBrandInvitation(
  payload: SendInvitationRequest,
  scenario: string,
): Promise<SendInvitationResponse> {
  SendInvitationRequest.parse(payload);
  return request(
    `${ADMIN_BASE}/brands/${encodeURIComponent(payload.brand_id)}/invitation`,
    {
      method: "POST",
      body: payload,
      schema: SendInvitationResponse,
      headers: billingHeaders(scenario),
    },
  );
}

export function getUsage(
  brandId: string,
  scenario: string,
  signal?: AbortSignal,
): Promise<UsageSnapshot> {
  return request(`${BILLING_BASE}/usage/${encodeURIComponent(brandId)}`, {
    method: "GET",
    schema: UsageSnapshot,
    signal,
    headers: billingHeaders(scenario),
  });
}

export function getPaymentStatus(
  brandId: string,
  scenario: string,
  signal?: AbortSignal,
): Promise<PaymentStatus> {
  return request(
    `${BILLING_BASE}/payment-status/${encodeURIComponent(brandId)}`,
    {
      method: "GET",
      schema: PaymentStatus,
      signal,
      headers: billingHeaders(scenario),
    },
  );
}

export function createSetupLink(
  payload: SetupLinkRequest,
  scenario: string,
): Promise<SetupLinkResponse> {
  SetupLinkRequest.parse(payload);
  return request(`${BILLING_BASE}/setup-link`, {
    method: "POST",
    body: payload,
    schema: SetupLinkResponse,
    headers: billingHeaders(scenario),
  });
}

export function activateSubscription(
  payload: ActivateSubscriptionRequest,
  scenario: string,
): Promise<ActivateSubscriptionResponse> {
  ActivateSubscriptionRequest.parse(payload);
  return request(`${BILLING_BASE}/activate`, {
    method: "POST",
    body: payload,
    schema: ActivateSubscriptionResponse,
    headers: billingHeaders(scenario),
  });
}

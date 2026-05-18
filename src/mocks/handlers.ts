import { http, HttpResponse } from "msw";
import type { PathParams } from "msw";
import type {
  ApprovalDetail,
  ApproveRequest,
  ForcePassRequest,
  RejectRequest,
  SubmitApprovalRequest,
  SubmitApprovalResponse,
} from "@/api/schemas/approvals";
import type {
  HumanPresenceSubmission,
  RplSubmission,
} from "@/api/schemas/consent";
import type {
  DisclosureAcknowledgeChallengeRequest,
  DisclosureChallengeRequest,
  DisclosureSpec,
  ListDisclosureTemplatesResponse,
  UpdateDisclosureSpecRequest,
} from "@/api/schemas/disclosure";
import type { EvidencePack } from "@/api/schemas/evidence";
import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import type { ProofSpec, SubmitProofPayload } from "@/api/schemas/proof";
import type { PatchWorkspaceSettingsRequest } from "@/api/schemas/policyThresholds";
import type {
  AcceptFlaggedRequest,
  WithdrawRequest,
} from "@/api/schemas/suitability";
import type { C2paEmbedResponse } from "@/api/schemas/c2pa";
import {
  MOCK_ASSET_ID,
  MOCK_ASSET_VERSION_C2PA,
  MOCK_EVIDENCE_PACK_ID,
  MOCK_LEGAL_ID,
  MOCK_POLICY_DECISION_ID,
  MOCK_RUN_ID,
  MOCK_WORKSPACE_ID,
} from "./constants";
import { assetScenarios } from "./scenarios/asset";
import {
  billingScenarios,
  findBrandById,
  resolveBillingScenario,
} from "./scenarios/billing";
import type {
  ActivateSubscriptionRequest,
  CreateBrandRequest,
  SendInvitationRequest,
  SetupLinkRequest,
  UpdateBrandPackRequest,
} from "@/api/schemas/billing";
import { disclosureScenarios } from "./scenarios/disclosure";
import { filterDisclosureTemplates } from "./scenarios/disclosure/templates";
import { preflightScenarios } from "./scenarios/preflight";
import { policyPresetItems, provenanceSummary } from "./scenarios/policyThresholds";
import {
  applyHumanPresenceSubmission,
  applyLegalApprovalMutation,
  applyProofSubmission,
  applyRplSubmission,
  applySuitabilityAcceptFlagged,
  applySuitabilityWithdraw,
  applyTransition,
  approvalStateForAction,
  clearDisclosureDraft,
  getApproval,
  getConsentDraft,
  getDisclosureDraft,
  getEvidencePackPreviewFixture,
  getLegalApprovalById,
  getLegalAsset,
  getLegalDisclosure,
  getLegalFixture,
  getLegalFixtureByRunId,
  getPolicyThresholdDraft,
  getProofDraft,
  getSuitabilityDraft,
  legalQueueCounts,
  lockDisclosureDraft,
  markC2paEmbedding,
  markEvidencePackGenerated,
  mergeDisclosureForm,
  queryLegalQueue,
  resolveConsentScenario,
  resolveLegalScenario,
  resolvePolicyThresholdsScenario,
  resolveScenario,
  resolveSuitabilityScenario,
  setApproval,
  patchPolicyThresholdDraft,
  updateApprovalState,
} from "./state";

function scenarioFromRequest(request: Request) {
  return resolveScenario(request.headers.get("x-mock-scenario"));
}

function consentScenarioFromRequest(request: Request) {
  return resolveConsentScenario(request.headers.get("x-consent-scenario"));
}

function suitabilityScenarioFromRequest(request: Request) {
  return resolveSuitabilityScenario(
    request.headers.get("x-suitability-scenario"),
  );
}

function policyThresholdsScenarioFromRequest(request: Request) {
  return resolvePolicyThresholdsScenario(
    request.headers.get("x-policy-thresholds-scenario"),
  );
}

function legalScenarioFromRequest(request: Request) {
  return resolveLegalScenario(request.headers.get("x-legal-scenario"));
}

function billingScenarioFromRequest(request: Request) {
  return resolveBillingScenario(request.headers.get("x-billing-scenario"));
}

export const handlers = [
  http.get("/api/v1/preflight/:runId/status", ({ request, params }) => {
    const runId = String((params as PathParams).runId);
    const legalFixture = getLegalFixtureByRunId(runId);
    if (legalFixture) {
      const overrideId = legalScenarioFromRequest(request);
      const fixture = getLegalFixture(overrideId);
      return HttpResponse.json({ ...fixture.preflight, preflight_run_id: runId });
    }
    const scenario = scenarioFromRequest(request);
    const payload: PreflightStatusResponse = preflightScenarios[scenario];
    return HttpResponse.json(payload);
  }),

  http.post("/api/v1/preflight/evaluate", async () => {
    const payload: PreflightStatusResponse = preflightScenarios["in-progress"];
    return HttpResponse.json(payload);
  }),

  http.post("/api/v1/preflight/:runId/rerun", ({ request }) => {
    const scenario = scenarioFromRequest(request);
    if (scenario === "system-error") {
      applyTransition("in-progress");
    }
    return HttpResponse.json(preflightScenarios["in-progress"]);
  }),

  http.get("/api/v1/assets/:assetId", ({ request, params }) => {
    const assetId = String((params as PathParams).assetId);
    const legalAsset = getLegalAsset(assetId);
    if (legalAsset) return HttpResponse.json(legalAsset);
    const scenario = scenarioFromRequest(request);
    return HttpResponse.json(assetScenarios[scenario]);
  }),

  http.get("/api/v1/disclosure/templates", ({ request }) => {
    const url = new URL(request.url);
    const items = filterDisclosureTemplates({
      trigger: url.searchParams.get("trigger") ?? undefined,
      modality: url.searchParams.get("modality") ?? undefined,
      scope: url.searchParams.get("scope") ?? undefined,
      lang: url.searchParams.get("lang") ?? undefined,
    });
    const payload: ListDisclosureTemplatesResponse = { items };
    return HttpResponse.json(payload);
  }),

  http.get("/api/v1/disclosure/:specId", ({ request, params }) => {
    const specId = String((params as PathParams).specId);
    const legalDisc = getLegalDisclosure(specId);
    if (legalDisc) return HttpResponse.json(legalDisc);
    const scenario = scenarioFromRequest(request);
    const draft = getDisclosureDraft(scenario);
    const spec = draft ?? disclosureScenarios[scenario];
    if (!spec) {
      return HttpResponse.json(
        { error: "NOT_FOUND", message: "No disclosure spec for this scenario" },
        { status: 404 },
      );
    }
    return HttpResponse.json(spec);
  }),

  http.post("/api/v1/disclosure/:specId/spec", async ({ request }) => {
    const scenario = scenarioFromRequest(request);
    const body = (await request.json()) as UpdateDisclosureSpecRequest;
    const next = mergeDisclosureForm(scenario, body);
    if (!next) {
      return HttpResponse.json(
        {
          error: "NOT_FOUND",
          message: "No disclosure draft available for this scenario",
        },
        { status: 404 },
      );
    }
    return HttpResponse.json(next);
  }),

  http.post("/api/v1/disclosure/:specId/lock", ({ request }) => {
    const scenario = scenarioFromRequest(request);
    const locked = lockDisclosureDraft(scenario);
    if (!locked) {
      return HttpResponse.json(
        {
          error: "VALIDATION_FAILED",
          message:
            "Cannot lock disclosure specification: not all validation checks pass.",
        },
        { status: 422 },
      );
    }
    applyTransition("allow-with-warnings");
    const response: DisclosureSpec = locked;
    queueMicrotask(() => {
      clearDisclosureDraft();
    });
    return HttpResponse.json(response);
  }),

  http.post(
    "/api/v1/disclosure/:specId/challenge",
    async ({ request, params }) => {
      const body = (await request.json()) as DisclosureChallengeRequest;
      applyTransition("challenge-pending");
      const response: DisclosureSpec = {
        spec_id: String((params as PathParams).specId),
        asset_id: MOCK_ASSET_ID,
        status: "DISCLOSURE_CHALLENGE_PENDING",
        challenge: {
          submitted_at: new Date().toISOString(),
          submitted_by: "Reviewer (mock)",
          justification: body.justification,
          declaration_confirmed: body.declaration_confirmed,
          audit_trail_id: "aud_demo_challenge",
        },
        updated_at: new Date().toISOString(),
      };
      return HttpResponse.json(response);
    },
  ),

  http.post(
    "/api/v1/disclosure/:specId/acknowledge-challenge",
    async ({ request, params }) => {
      const body =
        (await request.json()) as DisclosureAcknowledgeChallengeRequest;
      if (body.decision === "ACCEPTED") {
        applyTransition("allow");
      } else {
        applyTransition("block");
      }
      const response: DisclosureSpec = {
        spec_id: String((params as PathParams).specId),
        asset_id: MOCK_ASSET_ID,
        status:
          body.decision === "ACCEPTED"
            ? "DISCLOSURE_NOT_REQUIRED"
            : "DISCLOSURE_REQUIRED",
        updated_at: new Date().toISOString(),
      };
      return HttpResponse.json(response);
    },
  ),

  http.post(
    "/api/v1/disclosure/:specId/proof",
    async ({ params }) => {
      const response: DisclosureSpec = {
        spec_id: String((params as PathParams).specId),
        asset_id: MOCK_ASSET_ID,
        status: "DISCLOSURE_PROOF_UPLOADED",
        updated_at: new Date().toISOString(),
      };
      return HttpResponse.json(response);
    },
  ),

  http.post("/api/v1/c2pa/:assetId/embed", ({ request, params }) => {
    markC2paEmbedding();
    const scenario = scenarioFromRequest(request);
    if (scenario !== "allow" && scenario !== "allow-with-warnings") {
      applyTransition("in-progress");
    }
    const response: C2paEmbedResponse = {
      asset_id: String((params as PathParams).assetId),
      embed_status: "EMBEDDING",
      version_id: MOCK_ASSET_VERSION_C2PA,
      started_at: new Date().toISOString(),
    };
    return HttpResponse.json(response);
  }),

  http.post("/api/v1/evidence/generate", async ({ request }) => {
    const scenario = scenarioFromRequest(request);
    if (scenario !== "allow" && scenario !== "allow-with-warnings") {
      return HttpResponse.json(
        {
          error: "OBLIGATIONS_NOT_RESOLVED",
          message:
            "Evidence pack cannot be generated while obligations remain unresolved.",
        },
        { status: 422 },
      );
    }
    markEvidencePackGenerated();
    const response: EvidencePack = {
      evidence_pack_id: MOCK_EVIDENCE_PACK_ID,
      asset_id: MOCK_ASSET_ID,
      preflight_run_id: MOCK_RUN_ID,
      workspace_id: MOCK_WORKSPACE_ID,
      status: "COMPLETE",
      hash: "sha256:demo",
      download_url: "/placeholder.svg",
      generated_at: new Date().toISOString(),
    };
    return HttpResponse.json(response);
  }),

  http.post("/api/v1/approvals/submit", async ({ request }) => {
    const body = (await request.json()) as SubmitApprovalRequest;
    const approval: ApprovalDetail = {
      approval_id: "apr_demo_0001",
      state: "PENDING_REVIEW",
      asset_id: body.asset_id,
      preflight_run_id: body.preflight_run_id,
      evidence_pack_id: body.evidence_pack_id,
      submitted_at: new Date().toISOString(),
      submitted_by: body.submitted_by,
    };
    setApproval(approval);
    const response: SubmitApprovalResponse = {
      approval_id: approval.approval_id,
      state: approval.state,
      asset_id: approval.asset_id,
      preflight_run_id: approval.preflight_run_id,
      evidence_pack_id: approval.evidence_pack_id ?? body.evidence_pack_id,
      submitted_at: approval.submitted_at,
    };
    return HttpResponse.json(response);
  }),

  http.post("/api/v1/approvals/:approvalId/approve", async ({ request, params }) => {
    const body = (await request.json()) as ApproveRequest;
    const approvalId = String((params as PathParams).approvalId);
    const attestationId = `att_${Math.random().toString(16).slice(2, 10)}c91`;
    const patch = {
      state: approvalStateForAction("approve"),
      resolved_at: new Date().toISOString(),
      resolved_by: MOCK_LEGAL_ID,
      resolved_by_name: "S. Chen",
      attestation_type: body.attestation_type,
      attestation_id: attestationId,
      commentary: body.override_commentary,
      pack_status: "GENERATING" as const,
    };
    const next =
      updateApprovalState(approvalId, patch) ??
      applyLegalApprovalMutation(approvalId, patch);
    if (!next) return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return HttpResponse.json(next);
  }),

  http.post(
    "/api/v1/approvals/:approvalId/force-pass",
    async ({ request, params }) => {
      const body = (await request.json()) as ForcePassRequest;
      const approvalId = String((params as PathParams).approvalId);
      const attestationId = `att_${Math.random().toString(16).slice(2, 10)}fp1`;
      const patch = {
        state: approvalStateForAction("force-pass"),
        resolved_at: new Date().toISOString(),
        resolved_by: MOCK_LEGAL_ID,
        resolved_by_name: "S. Chen",
        commentary: body.commentary,
        attestation_id: attestationId,
        is_force_pass: true,
        pack_status: "GENERATING" as const,
      };
      const next =
        updateApprovalState(approvalId, patch) ??
        applyLegalApprovalMutation(approvalId, patch);
      if (!next)
        return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
      return HttpResponse.json(next);
    },
  ),

  http.post("/api/v1/approvals/:approvalId/reject", async ({ request, params }) => {
    const body = (await request.json()) as RejectRequest;
    const approvalId = String((params as PathParams).approvalId);
    const patch = {
      state: approvalStateForAction("reject"),
      resolved_at: new Date().toISOString(),
      resolved_by: MOCK_LEGAL_ID,
      rejection_notes: body.rejection_notes,
      routing_instructions: body.routing_instructions,
    };
    const next =
      updateApprovalState(approvalId, patch) ??
      applyLegalApprovalMutation(approvalId, patch);
    if (!next) return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return HttpResponse.json(next);
  }),

  http.get("/api/v1/approvals/queue", ({ request }) => {
    const url = new URL(request.url);
    const runIdFilter = url.searchParams.get("preflight_run_id") ?? undefined;
    if (runIdFilter) {
      const legalFixture = getLegalFixtureByRunId(runIdFilter);
      if (legalFixture) {
        const overrideId = legalScenarioFromRequest(request);
        const fixture = getLegalFixture(overrideId);
        const approvalForRun: ApprovalDetail = {
          ...fixture.approval,
          preflight_run_id: runIdFilter,
          asset_id: legalFixture.asset_id,
        };
        return HttpResponse.json({
          items: [approvalForRun],
          total_count: 1,
          counts: legalQueueCounts,
        });
      }
    }
    const items = queryLegalQueue({
      preflight_run_id: runIdFilter,
      status: url.searchParams.get("status") ?? undefined,
      workspace_id: url.searchParams.get("workspace_id") ?? undefined,
      submitted_by: url.searchParams.get("submitted_by") ?? undefined,
      approver_id: url.searchParams.get("approver_id") ?? undefined,
      since: url.searchParams.get("since") ?? undefined,
      until: url.searchParams.get("until") ?? undefined,
      state: url.searchParams.get("state") ?? undefined,
    });
    return HttpResponse.json({
      items,
      total_count: items.length,
      counts: legalQueueCounts,
    });
  }),

  http.get("/api/v1/approvals/:approvalId", ({ params }) => {
    const approvalId = String((params as PathParams).approvalId);
    const sessionApproval = getApproval();
    if (sessionApproval && sessionApproval.approval_id === approvalId) {
      return HttpResponse.json(sessionApproval);
    }
    const fromLegal = getLegalApprovalById(approvalId);
    if (fromLegal) return HttpResponse.json(fromLegal);
    return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }),

  http.get("/api/v1/evidence/:packId/preview", ({ params }) => {
    const packId = String((params as PathParams).packId);
    const pack = getEvidencePackPreviewFixture(packId);
    if (!pack) {
      return HttpResponse.json(
        {
          error: "NOT_FOUND",
          message: `No evidence pack preview for ${packId}`,
        },
        { status: 404 },
      );
    }
    return HttpResponse.json(pack);
  }),

  http.get("/api/v1/proof/:specId", ({ request }) => {
    const scenario = scenarioFromRequest(request);
    const spec = getProofDraft(scenario);
    if (!spec) {
      return HttpResponse.json(
        { error: "NOT_FOUND", message: "No proof spec for this scenario" },
        { status: 404 },
      );
    }
    return HttpResponse.json(spec);
  }),

  http.post("/api/v1/proof/:specId/submit", async ({ request }) => {
    const scenario = scenarioFromRequest(request);
    const body = (await request.json()) as SubmitProofPayload;
    const next = applyProofSubmission(scenario, body);
    if (!next) {
      return HttpResponse.json(
        {
          error: "NOT_FOUND",
          message: "No proof draft available for this scenario",
        },
        { status: 404 },
      );
    }
    applyTransition("publish-cleared");
    const response: ProofSpec = next;
    return HttpResponse.json(response);
  }),

  http.get("/api/v1/consent/:specId", ({ request }) => {
    const scenario = consentScenarioFromRequest(request);
    return HttpResponse.json(getConsentDraft(scenario));
  }),

  http.get("/api/v1/workspaces/:workspaceId/settings", ({ request }) => {
    const scenario = policyThresholdsScenarioFromRequest(request);
    if (scenario === "reviewer-forbidden") {
      return HttpResponse.json(
        {
          error: "FORBIDDEN",
          message: "Brand Admin access required",
        },
        { status: 403 },
      );
    }
    return HttpResponse.json(getPolicyThresholdDraft(scenario));
  }),

  http.patch(
    "/api/v1/workspaces/:workspaceId/settings",
    async ({ request }) => {
      const scenario = policyThresholdsScenarioFromRequest(request);
      if (scenario === "reviewer-forbidden") {
        return HttpResponse.json(
          {
            error: "FORBIDDEN",
            message: "Brand Admin access required",
          },
          { status: 403 },
        );
      }
      const body = (await request.json()) as PatchWorkspaceSettingsRequest;
      const hasLockedOverride = (body.threshold_overrides ?? []).some((override) =>
        ["hate_symbols_block", "minor_detected_block"].includes(
          override.category_key,
        ),
      );
      if (hasLockedOverride) {
        return HttpResponse.json(
          {
            error: "THRESHOLD_OVERRIDE_REJECTED",
            audit_event: "audit.threshold_override_rejected",
            message: "System-locked thresholds cannot be overridden.",
          },
          { status: 422 },
        );
      }
      return HttpResponse.json(patchPolicyThresholdDraft(scenario, body));
    },
  ),

  http.get("/api/v1/policy/presets", () =>
    HttpResponse.json({ items: policyPresetItems }),
  ),

  http.get("/api/v1/workspaces/:workspaceId/provenance-summary", ({ request }) => {
    const scenario = policyThresholdsScenarioFromRequest(request);
    if (scenario === "reviewer-forbidden") {
      return HttpResponse.json(
        {
          error: "FORBIDDEN",
          message: "Brand Admin access required",
        },
        { status: 403 },
      );
    }
    return HttpResponse.json(provenanceSummary);
  }),

  http.post("/api/v1/consent/:specId/rpl", async ({ request }) => {
    const scenario = consentScenarioFromRequest(request);
    const body = (await request.json()) as RplSubmission;
    const next = applyRplSubmission(scenario, body);
    if (!next) {
      return HttpResponse.json(
        {
          error: "VALIDATION_FAILED",
          message: "RPL section is not present for this scenario.",
        },
        { status: 422 },
      );
    }
    return HttpResponse.json(next);
  }),

  http.post(
    "/api/v1/consent/:specId/human-presence",
    async ({ request }) => {
      const scenario = consentScenarioFromRequest(request);
      const body = (await request.json()) as HumanPresenceSubmission;
      const next = applyHumanPresenceSubmission(scenario, body);
      if (!next) {
        return HttpResponse.json(
          {
            error: "VALIDATION_FAILED",
            message: "Human presence section is not present for this scenario.",
          },
          { status: 422 },
        );
      }
      return HttpResponse.json(next);
    },
  ),

  http.get("/api/v1/suitability/:runId/results", ({ request }) => {
    const scenario = suitabilityScenarioFromRequest(request);
    return HttpResponse.json(getSuitabilityDraft(scenario));
  }),

  http.post(
    "/api/v1/suitability/:runId/accept-flagged",
    async ({ request }) => {
      const scenario = suitabilityScenarioFromRequest(request);
      const body = (await request.json()) as AcceptFlaggedRequest;
      const next = applySuitabilityAcceptFlagged(scenario, body);
      if (!next) {
        return HttpResponse.json(
          {
            error: "INVALID_STATE",
            message:
              "Cannot accept flagged categories: results contain blocked items or are already cleared.",
          },
          { status: 422 },
        );
      }
      return HttpResponse.json(next);
    },
  ),

  http.post("/api/v1/suitability/:runId/withdraw", async ({ request }) => {
    const scenario = suitabilityScenarioFromRequest(request);
    const body = (await request.json().catch(() => ({}))) as WithdrawRequest;
    const next = applySuitabilityWithdraw(scenario, body ?? {});
    return HttpResponse.json(next);
  }),

  http.get("/api/v1/billing/admin/brands", ({ request }) => {
    const scenario = billingScenarioFromRequest(request);
    return HttpResponse.json(billingScenarios[scenario].brandList);
  }),

  http.get("/api/v1/billing/admin/brands/:brandId", ({ params }) => {
    const brandId = String((params as PathParams).brandId);
    const brand = findBrandById(brandId);
    if (!brand) {
      return HttpResponse.json(
        { error: "NOT_FOUND", message: `No brand with id ${brandId}` },
        { status: 404 },
      );
    }
    return HttpResponse.json(brand);
  }),

  http.post("/api/v1/billing/admin/brands", async ({ request }) => {
    const body = (await request.json()) as CreateBrandRequest;
    const newBrandId = `brn_demo_${Math.random().toString(16).slice(2, 8)}`;
    return HttpResponse.json({
      brand_id: newBrandId,
      brand_name: body.brand_name,
      pack_type: body.pack.pack_type,
      override_type: body.pack.override_type,
      subscription_status: "AWAITING_ACTIVATION",
      payment_configured: false,
      pack_configured: true,
      trial_end: body.pack.trial_end,
      badge_labels: ["Trial", "Awaiting activation"],
      contact: body.contact,
      pack: { ...body.pack, brand_id: newBrandId },
      stripe_subscription_id: null,
    });
  }),

  http.get("/api/v1/billing/admin/brands/:brandId/pack", ({ params }) => {
    const brandId = String((params as PathParams).brandId);
    const brand = findBrandById(brandId);
    if (!brand?.pack) {
      return HttpResponse.json(
        { error: "NOT_FOUND", message: "Pack not configured" },
        { status: 404 },
      );
    }
    return HttpResponse.json(brand.pack);
  }),

  http.patch(
    "/api/v1/billing/admin/brands/:brandId/pack",
    async ({ request, params }) => {
      const brandId = String((params as PathParams).brandId);
      const brand = findBrandById(brandId);
      if (!brand) {
        return HttpResponse.json(
          { error: "NOT_FOUND", message: `No brand with id ${brandId}` },
          { status: 404 },
        );
      }
      const body = (await request.json()) as UpdateBrandPackRequest;
      const merged = {
        ...(brand.pack ?? { brand_id: brandId, pack_type: "STANDARD" as const }),
        ...body,
        brand_id: brandId,
        updated_at: new Date().toISOString(),
      };
      return HttpResponse.json(merged);
    },
  ),

  http.get(
    "/api/v1/billing/admin/brands/:brandId/overage-preview",
    ({ request, params }) => {
      const brandId = String((params as PathParams).brandId);
      const scenario = billingScenarioFromRequest(request);
      const fixture = billingScenarios[scenario];
      if (fixture.activeBrandId !== brandId) {
        return HttpResponse.json({ ...fixture.usage, brand_id: brandId, applies: false });
      }
      return HttpResponse.json({ ...fixture.usage, applies: true });
    },
  ),

  http.post(
    "/api/v1/billing/admin/brands/:brandId/invitation",
    async ({ request }) => {
      const body = (await request.json()) as SendInvitationRequest;
      return HttpResponse.json({
        brand_id: body.brand_id,
        invitation_id: `inv_${Math.random().toString(16).slice(2, 10)}`,
        sent_at: new Date().toISOString(),
        sent_to: "brand-admin@example.com",
      });
    },
  ),

  http.get("/api/v1/billing/usage/:brandId", ({ request, params }) => {
    const brandId = String((params as PathParams).brandId);
    const scenario = billingScenarioFromRequest(request);
    const fixture = billingScenarios[scenario];
    return HttpResponse.json({ ...fixture.usage, brand_id: brandId });
  }),

  http.get("/api/v1/billing/payment-status/:brandId", ({ request, params }) => {
    const brandId = String((params as PathParams).brandId);
    const scenario = billingScenarioFromRequest(request);
    const fixture = billingScenarios[scenario];
    return HttpResponse.json({ ...fixture.paymentStatus, brand_id: brandId });
  }),

  http.post("/api/v1/billing/setup-link", async ({ request }) => {
    const body = (await request.json()) as SetupLinkRequest;
    return HttpResponse.json({
      session_id: `cs_demo_${Math.random().toString(16).slice(2, 12)}`,
      hosted_url: body.return_url ?? "https://stripe.com/checkout/demo",
      expires_at: new Date(Date.now() + 30 * 60_000).toISOString(),
    });
  }),

  http.post("/api/v1/billing/activate", async ({ request }) => {
    const scenario = billingScenarioFromRequest(request);
    const body = (await request.json()) as ActivateSubscriptionRequest;
    const fixture = billingScenarios[scenario];
    if (!fixture.paymentStatus.payment_configured) {
      return HttpResponse.json(
        {
          error: "PAYMENT_NOT_CONFIGURED",
          message:
            "Payment must be configured in Stripe before activation.",
        },
        { status: 422 },
      );
    }
    return HttpResponse.json({
      brand_id: body.brand_id,
      subscription_status: "ACTIVE",
      stripe_subscription_id: `sub_${Math.random().toString(16).slice(2, 12)}`,
      activated_at: new Date().toISOString(),
      cycle_start: new Date().toISOString().slice(0, 10),
      cycle_end: new Date(Date.now() + 30 * 86_400_000)
        .toISOString()
        .slice(0, 10),
    });
  }),
];

export { MOCK_POLICY_DECISION_ID };

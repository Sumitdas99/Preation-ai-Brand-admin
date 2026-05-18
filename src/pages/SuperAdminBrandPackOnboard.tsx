import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdminTopBar,
  BrandDetailsForm,
  BrandDetailsReadOnly,
  InlineNotice,
  StepProgress,
  type BreadcrumbSegment,
  type StepDefinition,
} from "@/components/billing";
import {
  DevBillingPanel,
  PackConfigurationForm,
  brandDetailsFormDefaults,
  brandDetailsFormSchema,
  fromPackFormValues,
  packConfigFormDefaults,
  useCreateBrand,
  type BrandDetailsFormValues,
  type PackConfigFormValues,
} from "@/features/billing";
import type {
  BrandPack,
  CreateBrandRequest,
  Currency,
} from "@/api/schemas/billing";

const STEPS: StepDefinition[] = [
  { id: "details", label: "Step 1 — Brand Details" },
  { id: "pack", label: "Step 2 — Pack Configuration" },
  { id: "invite", label: "Send Invitation" },
];

const PLACEHOLDER_BRAND_NAME = "New brand";

export default function SuperAdminBrandPackOnboard() {
  const navigate = useNavigate();
  const createMutation = useCreateBrand();

  useEffect(() => {
    document.title = "Onboard new brand · Praetion AI";
  }, []);

  const detailsForm = useForm<BrandDetailsFormValues>({
    resolver: zodResolver(brandDetailsFormSchema),
    defaultValues: brandDetailsFormDefaults,
    mode: "onBlur",
  });

  const [stepIndex, setStepIndex] = useState(0);
  const [brandDetails, setBrandDetails] = useState<BrandDetailsFormValues | null>(null);
  const [packDraft, setPackDraft] = useState<PackConfigFormValues>(
    packConfigFormDefaults,
  );

  const handleContinue = detailsForm.handleSubmit((values) => {
    setBrandDetails(values);
    setStepIndex(1);
  });

  const handleBack = () => {
    setStepIndex(0);
  };

  const submitOnboarding = async (
    values: PackConfigFormValues,
    sendInvitation: boolean,
  ) => {
    if (!brandDetails) return;
    setPackDraft(values);
    const packPayload = fromPackFormValues(values) as Omit<BrandPack, "brand_id">;
    const payload: CreateBrandRequest = {
      brand_name: brandDetails.brand_name,
      contact: {
        brand_admin_name: brandDetails.brand_admin_name,
        brand_admin_email: brandDetails.brand_admin_email,
        registered_country: brandDetails.registered_country,
        registered_address: brandDetails.registered_address,
      },
      pack: packPayload,
    };
    const result = await createMutation.mutateAsync({
      payload,
      sendInvitation,
    });
    if (sendInvitation) {
      navigate(`/super-admin/brand-packs/${result.brand.brand_id}`);
    } else {
      navigate("/super-admin/brand-packs");
    }
  };

  const brandNameForSummary = useMemo(() => {
    return (
      detailsForm.getValues("brand_name") ||
      brandDetails?.brand_name ||
      PLACEHOLDER_BRAND_NAME
    );
  }, [detailsForm, brandDetails]);

  const currency: Currency = "EUR";

  const stepLabel = stepIndex === 0 ? "Step 1: Brand Details" : "Step 2: Pack Configuration";
  const breadcrumbs: BreadcrumbSegment[] = brandDetails
    ? [{ label: "Brands" }, { label: "New Brand" }, { label: brandDetails.brand_name }, { label: stepLabel }]
    : [{ label: "Brands" }, { label: "New Brand" }, { label: stepLabel }];

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <AdminTopBar title="Brand Pack Manager" breadcrumbs={breadcrumbs} />

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl space-y-5 px-6 py-6">
          <StepProgress steps={STEPS} activeIndex={stepIndex} />

          {stepIndex === 0 ? (
            <form
              onSubmit={handleContinue}
              className="space-y-5"
              noValidate
            >
              <BrandDetailsForm
                control={detailsForm.control}
                errors={detailsForm.formState.errors}
              />
              <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-1 py-3 backdrop-blur">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/super-admin/brand-packs")}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button
                  type="submit"
                  className="bg-[#0A1F44] text-white hover:bg-[#0A1F44]/90"
                >
                  Continue to pack configuration
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </footer>
            </form>
          ) : null}

          {stepIndex === 1 && brandDetails ? (
            <>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  Pack Configuration — {brandNameForSummary}
                </h2>
                <p className="text-sm text-slate-600">
                  Configure the billing pack for this brand. Saved to{" "}
                  <code className="font-mono text-xs">brand_subscriptions.custom_*</code>{" "}
                  — no Stripe call is made at this stage. The Brand Admin invitation fires
                  only after this step is saved.
                </p>
              </div>
              <InlineNotice tone="amber" title="No Stripe call on save">
                The Brand Admin activates the subscription from their own Billing
                Dashboard after completing payment setup. The Activate Subscription
                button is not here.
              </InlineNotice>
              <PackConfigurationForm
                brandName={brandNameForSummary}
                defaultValues={packDraft}
                currency={currency}
                isSubmitting={createMutation.isPending}
                topSlot={
                  <BrandDetailsReadOnly
                    brandName={brandDetails.brand_name}
                    contact={{
                      brand_admin_name: brandDetails.brand_admin_name,
                      brand_admin_email: brandDetails.brand_admin_email,
                      registered_country: brandDetails.registered_country,
                      registered_address: brandDetails.registered_address,
                    }}
                  />
                }
                primaryLabel="Save pack & send invitation"
                onPrimarySubmit={(values) => submitOnboarding(values, true)}
                secondaryLabel="Save & configure later"
                secondaryVariant="outline"
                onSecondarySubmit={(values) => submitOnboarding(values, false)}
                ghostLabel="Back to brand details"
                onGhost={handleBack}
              />
            </>
          ) : null}
        </div>
      </main>

      <DevBillingPanel />
    </div>
  );
}

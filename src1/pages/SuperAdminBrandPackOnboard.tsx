import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdminTopBar,
  BrandDetailsForm,
  BrandDetailsReadOnly,
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
  { id: "details", label: "Brand Details" },
  { id: "pack", label: "Pack Configuration" },
  { id: "invite", label: "Send Invitation" },
];

const PLACEHOLDER_BRAND_NAME = "New brand";

export default function SuperAdminBrandPackOnboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createMutation = useCreateBrand();

  useEffect(() => {
    document.title = "Onboard new brand · Praetion AI";
  }, []);

  const detailsForm = useForm<BrandDetailsFormValues>({
    resolver: zodResolver(brandDetailsFormSchema),
    defaultValues: brandDetailsFormDefaults,
    mode: "onBlur",
  });

  const [brandDetails, setBrandDetails] = useState<BrandDetailsFormValues | null>(null);
  const [packDraft, setPackDraft] = useState<PackConfigFormValues>(
    packConfigFormDefaults,
  );

  const stepIndex = searchParams.get("step") === "pack" && brandDetails ? 1 : 0;

  const handleContinue = detailsForm.handleSubmit((values) => {
    setBrandDetails(values);
    navigate("?step=pack");
  });

  const handleBack = () => {
    navigate(-1);
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
      navigate(`/super-admin/brand-packs/${result.brand.brand_id}`, { replace: true });
    } else {
      navigate("/super-admin/brand-packs", { replace: true });
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
    <div className="flex h-screen flex-col bg-background">
      <AdminTopBar title="Brand Pack Manager" breadcrumbs={breadcrumbs} />

      <StepProgress steps={STEPS} activeIndex={stepIndex} />

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl space-y-5 px-6 py-6">

          {stepIndex === 0 ? (
            <form
              onSubmit={handleContinue}
              className="mx-auto max-w-2xl space-y-5"
              noValidate
            >
              <BrandDetailsForm
                control={detailsForm.control}
              />
              <footer className="flex flex-col-reverse items-stretch gap-3 rounded-md border border-border bg-card px-6 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="h-11 shrink-0 border-0 bg-slate-100 font-semibold text-slate-800 hover:bg-slate-200"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="h-11 shrink-0 bg-[#0f1d3b] text-sm font-bold text-white hover:bg-[#1a2c52] focus-visible:ring-[#0f1d3b]"
                >
                  Continue to pack configuration
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Button>
              </footer>
            </form>
          ) : null}

          {stepIndex === 1 && brandDetails ? (
            <>
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

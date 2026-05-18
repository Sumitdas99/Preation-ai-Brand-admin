import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AdminTopBar,
  BrandListPanel,
  EditPanelHeader,
  OveragePreviewCard,
  type BreadcrumbSegment,
} from "@/components/billing";
import {
  BrandPackEmptyState,
  BrandPackErrorScreen,
  BrandPackSkeleton,
  DevBillingPanel,
  PackConfigurationForm,
  filterBrandList,
  toBrandListData,
  toOveragePreviewData,
  toPackFormValues,
  fromPackFormValues,
  useBrand,
  useBrands,
  useOveragePreview,
  useUpdateBrandPack,
} from "@/features/billing";
import type {
  Currency,
  UpdateBrandPackRequest,
} from "@/api/schemas/billing";

export default function SuperAdminBrandPacks() {
  const navigate = useNavigate();
  const params = useParams<{ brandId?: string }>();

  useEffect(() => {
    document.title = "Brand Pack Manager · Praetion AI";
  }, []);

  const {
    brands,
    isPending: brandsPending,
    error: brandsError,
    refetch: refetchBrands,
  } = useBrands();

  const [query, setQuery] = useState("");
  const [resetTick, setResetTick] = useState(0);

  const rows = useMemo(() => toBrandListData(brands), [brands]);
  const filteredRows = useMemo(
    () => filterBrandList(rows, query),
    [rows, query],
  );

  const selectedBrandId =
    params.brandId ?? (brands.length > 0 ? brands[0].brand_id : undefined);

  const {
    brand,
    isPending: brandPending,
    error: brandError,
    refetch: refetchBrand,
  } = useBrand(selectedBrandId);

  const isActiveSubscription = brand?.subscription_status === "ACTIVE";

  const {
    preview,
    isPending: previewPending,
    refetch: refetchPreview,
  } = useOveragePreview(selectedBrandId, { enabled: isActiveSubscription });

  const updateMutation = useUpdateBrandPack(selectedBrandId);

  const formDefaults = useMemo(() => toPackFormValues(brand), [brand]);
  const currency: Currency = (brand?.pack?.currency as Currency) ?? "EUR";
  const trialExpired =
    brand?.pack_type === "TRIAL" &&
    brand?.pack?.trial_end &&
    new Date(brand.pack.trial_end).getTime() < Date.now() &&
    brand?.subscription_status !== "ACTIVE";

  const handleSelect = (brandId: string) => {
    navigate(`/super-admin/brand-packs/${brandId}`);
  };

  const handleOnboard = () => {
    navigate("/super-admin/brand-packs/new");
  };

  const handleSave = async (
    values: Parameters<typeof fromPackFormValues>[0],
  ) => {
    if (!selectedBrandId) return;
    const payload = fromPackFormValues(values) as UpdateBrandPackRequest;
    await updateMutation.mutateAsync(payload);
  };

  const handleDiscard = () => {
    setResetTick((t) => t + 1);
  };

  const overageVM = preview ? toOveragePreviewData(preview) : undefined;

  const breadcrumbs: BreadcrumbSegment[] = brand
    ? [{ label: "Brands" }, { label: brand.brand_name }]
    : [{ label: "Brands" }];

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <AdminTopBar title="Brand Pack Manager" breadcrumbs={breadcrumbs} />

      <div className="grid min-h-0 flex-1 overflow-hidden bg-white lg:grid-cols-[320px_minmax(0,1fr)]">
        <BrandListPanel
          rows={filteredRows}
          selectedBrandId={selectedBrandId}
          onSelect={handleSelect}
          query={query}
          onQueryChange={setQuery}
          onOnboardClick={handleOnboard}
          isPending={brandsPending}
        />

        <main className="flex min-h-0 flex-col overflow-hidden">
          {brandsError ? (
            <BrandPackErrorScreen
              title="Could not load brands"
              description={
                brandsError instanceof Error ? brandsError.message : undefined
              }
              onRetry={() => refetchBrands()}
            />
          ) : !selectedBrandId ? (
            <BrandPackEmptyState />
          ) : brandError ? (
            <BrandPackErrorScreen
              description={
                brandError instanceof Error ? brandError.message : undefined
              }
              onRetry={() => refetchBrand()}
            />
          ) : !brand || brandPending ? (
            <div className="overflow-y-auto p-6">
              <BrandPackSkeleton />
            </div>
          ) : (
            <>
              <EditPanelHeader brand={brand} />
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <PackConfigurationForm
                  brandName={brand.brand_name}
                  defaultValues={formDefaults}
                  currency={currency}
                  resetKey={resetTick}
                  isSubmitting={updateMutation.isPending}
                  trialExpiredNotice={Boolean(trialExpired)}
                  trialEnd={brand.pack?.trial_end}
                  subscriptionActive={isActiveSubscription}
                  usageCrossRef={
                    preview
                      ? {
                          imageUsed: preview.image_scans.used,
                          imageOverage: preview.image_scans.overage,
                          videoUsed: preview.video_minutes.used,
                          videoOverage: preview.video_minutes.overage,
                        }
                      : undefined
                  }
                  topSlot={
                    isActiveSubscription ? (
                      <OveragePreviewCard
                        vm={overageVM}
                        isPending={previewPending}
                        onRefresh={() => refetchPreview()}
                      />
                    ) : undefined
                  }
                  primaryLabel="Save pack changes"
                  onPrimarySubmit={handleSave}
                  ghostLabel="Discard changes"
                  onGhost={handleDiscard}
                />
              </div>
            </>
          )}
        </main>
      </div>

      <DevBillingPanel />
    </div>
  );
}

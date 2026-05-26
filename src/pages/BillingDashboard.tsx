import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { billingService } from "@/services/billing";
import { toast } from "sonner";
import {
  ActivateCallout,
  BillingDashboardHeader,
  CardOnFileRow,
  PaymentIssueAlert,
  PaymentReadyCard,
  PaymentSetupCard,
  SubscriptionCard,
  UsageCard,
  VerifyingPaymentOverlay,
} from "@/components/billing";
import {
  BrandPackErrorScreen,
  BrandPackSkeleton,
  DevBillingPanel,
  toBillingDashboardData,
  useStripeSetupReturn,
  markStripeSetupInitiated,
} from "@/features/billing";

export default function BillingDashboard() {
  // Use the specified brandId for now (will be retrieved from profile details later)
  const brandId = "ded09d20-2fb6-4d31-b906-2a562d8c0238";

  useEffect(() => {
    document.title = "Billing & Usage · Praetion AI";
  }, []);

  const stripeReturn = useStripeSetupReturn(brandId);

  // Call the getPaymentStatus API using React Query
  const { data: paymentStatus, isPending: paymentPending, error: paymentError, refetch: refetchPayment } = useQuery({
    queryKey: ["paymentStatus", brandId],
    queryFn: () => billingService.getPaymentStatus(brandId),
    enabled: Boolean(brandId),
    refetchInterval: stripeReturn.isVerifying ? 2000 : false,
  });

  // Call the getBillingPack API using React Query
  const { data: billingPack, isPending: packPending, error: packError, refetch: refetchPack } = useQuery({
    queryKey: ["billingPack", brandId],
    queryFn: () => billingService.getBillingPack(brandId),
    enabled: Boolean(brandId),
  });

  // Call the getBillingUsage API using React Query
  const { data: billingUsage, refetch: refetchUsage } = useQuery({
    queryKey: ["billingUsage", brandId],
    queryFn: () => billingService.getBillingUsage(brandId),
    enabled: Boolean(brandId),
    retry: false,
  });

  // Call setupBillingLink mutation passing only the brand_id
  const setupLinkMutation = useMutation({
    mutationFn: (id: string) => billingService.setupBillingLink({ brand_id: id }),
    onSuccess: (response) => {
      if (brandId) {
        markStripeSetupInitiated(brandId);
      }
      if (response && response.checkout_url) {
        window.open(response.checkout_url, "_self", "noopener,noreferrer");
      } else if (response && response.hosted_url) {
        window.open(response.hosted_url, "_self", "noopener,noreferrer");
      }
    },
    onError: (error: any) => {
      const message = error instanceof Error ? error.message : "Could not open secure payment page";
      toast.error("Could not open Stripe", { description: message });
    }
  });

  // Call activateBilling API when the user activates
  const activateMut = useMutation({
    mutationFn: () => billingService.activateBilling({ brand_id: brandId }),
    onSuccess: () => {
      toast.success("Subscription activated", {
        description: "Your compliance workspace is now active.",
      });
      refetchPack();
      refetchPayment();
      refetchUsage();
    },
    onError: (error: any) => {
      const message = error instanceof Error ? error.message : "Could not activate subscription";
      toast.error("Activation failed", { description: message });
    }
  });

  // Helper to convert nulls to undefined to avoid calling .toLocaleString() on null values in adapters recursively
  const stripNulls = (obj: any): any => {
    if (obj === null || obj === undefined) return undefined;
    if (Array.isArray(obj)) {
      return obj.map(stripNulls);
    }
    if (typeof obj !== "object") return obj;
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      newObj[key] = obj[key] === null ? undefined : stripNulls(obj[key]);
    }
    return newObj;
  };

  // Helper to calculate first charge date as override_expiry_date + 1 day
  const getFirstChargeDate = (expiryDateStr: string | undefined): string | undefined => {
    if (!expiryDateStr) return undefined;
    const d = new Date(expiryDateStr);
    if (Number.isNaN(d.getTime())) return undefined;
    d.setDate(d.getDate() + 1);
    return d.toISOString();
  };

  // Safely fallback to generated values if the backend endpoints are missing or return 404
  const fallbackBrand = useMemo(() => {
    if (!billingPack) return undefined;

    const cleanedPack = stripNulls(billingPack);
    const customPriceNum = typeof cleanedPack.custom_price === "string"
      ? parseFloat(cleanedPack.custom_price)
      : cleanedPack.custom_price;

    const rawOverrideType = (cleanedPack.override_type || "").toUpperCase();
    let packType: "TRIAL" | "ENTERPRISE" | "STANDARD" = "STANDARD";
    if (rawOverrideType.includes("TRIAL")) {
      packType = "TRIAL";
    } else if (rawOverrideType.includes("ENTERPRISE")) {
      packType = "ENTERPRISE";
    }

    const overageImagePrice = cleanedPack.custom_overage_image_price !== undefined
      ? parseFloat(cleanedPack.custom_overage_image_price)
      : undefined;
    const overageVideoPrice = cleanedPack.custom_overage_video_price !== undefined
      ? parseFloat(cleanedPack.custom_overage_video_price)
      : undefined;

    const isConfigured = paymentStatus?.payment_configured ?? false;
    let statusStr = "AWAITING_ACTIVATION";
    if (paymentStatus?.status) {
      statusStr = paymentStatus.status.toUpperCase();
    } else if (isConfigured) {
      statusStr = "ACTIVE";
    }

    return {
      brand_id: brandId,
      brand_name: "Brand Workspace",
      pack_type: packType,
      subscription_status: statusStr,
      payment_configured: isConfigured,
      pack_configured: true,
      trial_end: cleanedPack.override_expiry_date,
      stripe_subscription_id: paymentStatus?.stripe_subscription_id ?? (isConfigured ? "sub_mock_123" : null),
      pack: {
        ...cleanedPack,
        pack_type: packType,
        custom_price: customPriceNum,
        monthly_price: customPriceNum,
        overage_image_price: overageImagePrice,
        overage_video_price: overageVideoPrice,
        trial_end: cleanedPack.override_expiry_date,
        first_charge_date: getFirstChargeDate(cleanedPack.override_expiry_date),
      },
    };
  }, [billingPack, brandId, paymentStatus]);

  const fallbackPaymentStatus = useMemo(() => {
    const isConfigured = paymentStatus?.payment_configured ?? false;
    let statusStr = "AWAITING_ACTIVATION";
    if (paymentStatus?.status) {
      statusStr = paymentStatus.status.toUpperCase();
    } else if (isConfigured) {
      statusStr = "ACTIVE";
    }

    return {
      brand_id: brandId,
      payment_configured: isConfigured,
      stripe_subscription_id: paymentStatus?.stripe_subscription_id ?? (isConfigured ? "sub_mock_123" : null),
      subscription_status: statusStr,
      card_brand: paymentStatus?.card_brand,
      card_last4: paymentStatus?.card_last4,
      card_expiry: paymentStatus?.card_expiry,
      currency: paymentStatus?.currency ?? "EUR",
    };
  }, [brandId, paymentStatus]);

  const fallbackUsage = useMemo(() => {
    if (!billingPack) return undefined;

    const cleanedPack = stripNulls(billingPack);

    const rawOverrideType = (cleanedPack.override_type || "").toUpperCase();
    const isTrial = rawOverrideType.includes("TRIAL");

    const imageLimit = isTrial
      ? (cleanedPack.trial_image_limit ?? 20)
      : (cleanedPack.custom_image_limit ?? 20);
    const videoLimit = isTrial
      ? (cleanedPack.trial_video_limit ?? 1)
      : (cleanedPack.custom_video_limit ?? 2);

    const overageImagePrice = cleanedPack.custom_overage_image_price !== undefined
      ? parseFloat(cleanedPack.custom_overage_image_price)
      : undefined;
    const overageVideoPrice = cleanedPack.custom_overage_video_price !== undefined
      ? parseFloat(cleanedPack.custom_overage_video_price)
      : undefined;

    return {
      brand_id: brandId,
      cycle_start: new Date().toISOString(),
      cycle_end: new Date(Date.now() + 30 * 86400000).toISOString(),
      days_remaining: 30,
      is_trial: isTrial,
      image_scans: {
        used: 0,
        limit: imageLimit,
        overage: 0,
        estimated_overage_charge: 0,
        overage_unit_price: overageImagePrice,
      },
      video_minutes: {
        used: 0,
        limit: videoLimit,
        overage: 0,
        estimated_overage_charge: 0,
        overage_unit_price: overageVideoPrice,
      },
      estimated_overage_total: 0,
      currency: "EUR",
    };
  }, [billingPack, brandId]);

  const usageData = useMemo(() => {
    if (billingUsage) {
      const cleaned = stripNulls(billingUsage);

      const mapMetric = (apiMetric: any, fallbackMetric: any) => {
        if (!apiMetric && !fallbackMetric) {
          return { used: 0, limit: 0, overage: 0, estimated_overage_charge: 0 };
        }
        const used = apiMetric?.current ?? apiMetric?.used ?? 0;
        const limit = apiMetric?.limit ?? fallbackMetric?.limit ?? 0;
        const overage = Math.max(0, used - limit);
        const price = fallbackMetric?.overage_unit_price ?? 0;

        return {
          used,
          limit,
          overage,
          estimated_overage_charge: overage * price,
          overage_unit_price: price,
        };
      };

      return {
        ...fallbackUsage,
        ...cleaned,
        image_scans: mapMetric(
          cleaned.image ?? cleaned.image_scans ?? cleaned.images,
          fallbackUsage?.image_scans
        ),
        video_minutes: mapMetric(
          cleaned.video ?? cleaned.video_minutes ?? cleaned.videos,
          fallbackUsage?.video_minutes
        ),
      };
    }
    return fallbackUsage;
  }, [billingUsage, fallbackUsage]);

  const vm = useMemo(() => {
    if (!fallbackBrand || !fallbackPaymentStatus) return undefined;
    return toBillingDashboardData({
      brand: fallbackBrand,
      paymentStatus: fallbackPaymentStatus,
      usage: usageData,
    });
  }, [fallbackBrand, fallbackPaymentStatus, usageData]);

  // Loading state blocks on the primary billingPack loading and payment status loading
  const isLoading = packPending || paymentPending;

  const handleSetup = () => {
    if (!brandId) return;
    stripeReturn.start();
    setupLinkMutation.mutate(brandId);
  };

  const handleActivate = () => {
    if (!brandId) return;
    activateMut.mutate();
  };

  const handleUpdatePayment = () => {
    if (!brandId) return;
    stripeReturn.start();
    setupLinkMutation.mutate(brandId);
  };

  const { isVerifying: isStripeVerifying, stop: stopStripeVerify } = stripeReturn;
  useEffect(() => {
    if (!isStripeVerifying) return;

    if (paymentStatus?.payment_configured) {
      stopStripeVerify();
      toast.success("Payment details configured successfully!");
      refetchPack();
    }
  }, [isStripeVerifying, paymentStatus?.payment_configured, stopStripeVerify, refetchPack]);

  return (
    <div className="flex h-full min-h-screen flex-col">
      {vm ? (
        <BillingDashboardHeader
          title={vm.header.title}
          subtitle={vm.header.subtitle}
          variant={vm.header.variant}
        />
      ) : (
        <div className="border-b bg-[#0A1F44] px-6 py-5 text-white">
          <h1 className="text-xl font-semibold">Billing &amp; Usage</h1>
          <p className="text-sm text-white/70">Loading…</p>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl space-y-5 px-6 py-6">
          {packError || paymentError ? (
            <BrandPackErrorScreen
              title="Could not load billing data"
              description={
                (packError || paymentError) instanceof Error
                  ? ((packError || paymentError) as Error).message
                  : undefined
              }
              onRetry={() => {
                refetchPack();
                refetchPayment();
              }}
            />
          ) : isLoading || !vm ? (
            <BrandPackSkeleton />
          ) : (
            <DashboardBody
              vm={vm}
              onSetup={handleSetup}
              onActivate={handleActivate}
              onUpdatePayment={handleUpdatePayment}
              setupPending={setupLinkMutation.isPending}
              activatePending={activateMut.isPending}
            />
          )}
        </div>
      </main>

      <VerifyingPaymentOverlay visible={stripeReturn.isVerifying} />
      {/* <DevBillingPanel /> */}
    </div>
  );
}

interface DashboardBodyProps {
  vm: NonNullable<ReturnType<typeof toBillingDashboardData>>;
  onSetup: () => void;
  onActivate: () => void;
  onUpdatePayment: () => void;
  setupPending: boolean;
  activatePending: boolean;
}

function DashboardBody({
  vm,
  onSetup,
  onActivate,
  onUpdatePayment,
  setupPending,
  activatePending,
}: DashboardBodyProps) {
  const cardOnFileSlot = (
    <CardOnFileRow onUpdatePayment={onUpdatePayment} isPending={setupPending} />
  );

  return (
    <>
      {vm.pastDue ? (
        <PaymentIssueAlert
          block={vm.pastDue}
          onUpdatePayment={onUpdatePayment}
          isPending={setupPending}
        />
      ) : null}

      {vm.paymentVariant === "setup" && vm.payment && "calloutTitle" in vm.payment ? (
        <PaymentSetupCard
          block={vm.payment}
          onSetup={onSetup}
          isPending={setupPending}
        />
      ) : null}

      {vm.paymentVariant === "ready" && vm.payment && "cardLine" in vm.payment ? (
        <PaymentReadyCard block={vm.payment} />
      ) : null}

      {vm.subscription ? (
        <SubscriptionCard
          block={vm.subscription}
          cardOnFileSlot={cardOnFileSlot}
          belowGridSlot={
            vm.activate ? (
              <ActivateCallout
                block={vm.activate}
                onActivate={onActivate}
                isPending={activatePending}
              />
            ) : undefined
          }
        />
      ) : null}

      <UsageCard block={vm.usage} />
    </>
  );
}

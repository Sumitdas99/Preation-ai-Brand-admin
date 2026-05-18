import { useEffect, useMemo } from "react";
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
  useActivateSubscription,
  useActiveBrandId,
  useBrand,
  usePaymentStatus,
  useSetupLink,
  useStripeSetupReturn,
  useUsage,
} from "@/features/billing";

export default function BillingDashboard() {
  const brandId = useActiveBrandId();

  useEffect(() => {
    document.title = "Billing & Usage · Praetion AI";
  }, []);

  const { brand, isPending: brandPending, error: brandError, refetch: refetchBrand } = useBrand(brandId);
  const { paymentStatus, isPending: statusPending, refetch: refetchStatus } =
    usePaymentStatus(brandId);
  const { usage, isPending: usagePending } = useUsage(brandId);

  const setupLink = useSetupLink();
  const activateMut = useActivateSubscription();
  const stripeReturn = useStripeSetupReturn(brandId);

  const vm = useMemo(() => {
    if (!brand || !paymentStatus) return undefined;
    return toBillingDashboardData({ brand, paymentStatus, usage });
  }, [brand, paymentStatus, usage]);

  const isLoading =
    brandPending || statusPending || (vm?.tone !== "welcome-payment-required" && vm?.tone !== "welcome-activate" && usagePending);

  const handleSetup = () => {
    if (!brandId) return;
    stripeReturn.start();
    setupLink.mutate({ brand_id: brandId });
  };

  const handleActivate = () => {
    if (!brandId) return;
    activateMut.mutate({ brand_id: brandId });
  };

  const handleUpdatePayment = () => {
    if (!brandId) return;
    stripeReturn.start();
    setupLink.mutate({ brand_id: brandId });
  };

  const { isVerifying: isStripeVerifying, stop: stopStripeVerify } = stripeReturn;
  useEffect(() => {
    if (!isStripeVerifying) return;
    if (paymentStatus?.payment_configured) {
      stopStripeVerify();
    }
  }, [isStripeVerifying, stopStripeVerify, paymentStatus?.payment_configured]);

  return (
    <div className="flex h-full min-h-screen flex-col bg-slate-100">
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
          {brandError ? (
            <BrandPackErrorScreen
              title="Could not load billing data"
              description={
                brandError instanceof Error ? brandError.message : undefined
              }
              onRetry={() => {
                refetchBrand();
                refetchStatus();
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
              setupPending={setupLink.isPending}
              activatePending={activateMut.isPending}
            />
          )}
        </div>
      </main>

      <VerifyingPaymentOverlay visible={stripeReturn.isVerifying} />
      <DevBillingPanel />
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

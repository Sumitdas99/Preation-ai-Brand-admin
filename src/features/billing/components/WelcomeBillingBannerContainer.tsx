import { WelcomeBillingBanner } from "@/components/billing";
import { useNavigate } from "react-router-dom";
import {
  deriveDashboardTone,
  useActiveBrandId,
  useBrand,
  usePaymentStatus,
  useSetupLink,
} from "..";

export function WelcomeBillingBannerContainer() {
  const navigate = useNavigate();
  const brandId = useActiveBrandId();
  const { brand } = useBrand(brandId);
  const { paymentStatus } = usePaymentStatus(brandId);
  const setupLink = useSetupLink();

  if (!brand || !paymentStatus) return null;
  const tone = deriveDashboardTone(brand, paymentStatus);
  if (tone !== "welcome-payment-required" && tone !== "welcome-activate") {
    return null;
  }

  const handlePrimary = () => {
    if (tone === "welcome-payment-required") {
      setupLink.mutate({ brand_id: brandId });
    } else {
      navigate("/billing");
    }
  };

  return (
    <WelcomeBillingBanner
      tone={tone}
      onPrimary={handlePrimary}
      isPending={setupLink.isPending}
    />
  );
}

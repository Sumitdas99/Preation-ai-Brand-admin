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

  const adminName = brand.contact?.brand_admin_name?.split(" ")[0];

  return (
    <WelcomeBillingBanner
      tone={tone}
      onPrimary={handlePrimary}
      isPending={setupLink.isPending}
      userName={adminName}
      roleName="Brand Admin"
      workspaceName={brand.brand_name}
    />
  );
}

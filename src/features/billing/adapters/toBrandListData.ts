import type { BrandSummary } from "@/api/schemas/billing";
import type { BrandSummaryRow } from "@/components/billing/types";
import { PACK_TYPE_LABEL } from "./copy";
import { formatDate } from "./format";
import { toBrandStatusBadges } from "./toBadges";

export function toBrandListData(brands: BrandSummary[]): BrandSummaryRow[] {
  return brands.map((brand) => ({
    brandId: brand.brand_id,
    brandName: brand.brand_name,
    packType: brand.pack_type,
    packLabel: brand.pack_type ? PACK_TYPE_LABEL[brand.pack_type] : "—",
    subscriptionStatus: brand.subscription_status,
    badges: toBrandStatusBadges(brand),
    trialExpiresLabel: brand.trial_end
      ? `Trial expires ${formatDate(brand.trial_end)}`
      : undefined,
  }));
}

export function filterBrandList(
  rows: BrandSummaryRow[],
  query: string,
): BrandSummaryRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) => {
    const haystack = [row.brandName, row.brandId, row.packLabel]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

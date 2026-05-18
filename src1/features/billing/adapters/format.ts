import type { Currency } from "@/api/schemas/billing";

const CURRENCY_SYMBOL: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

export function currencySymbol(currency: Currency | string | undefined): string {
  if (!currency) return "€";
  return CURRENCY_SYMBOL[currency] ?? `${currency} `;
}

export function formatMoney(
  amount: number | undefined | null,
  currency: Currency | string | undefined,
  fractionDigits = 2,
): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    return "—";
  }
  const symbol = currencySymbol(currency);
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

export function formatInteger(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return value.toLocaleString();
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatShortDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export function formatCycleRange(
  start: string | undefined,
  end: string | undefined,
): string | undefined {
  if (!start || !end) return undefined;
  return `${formatShortDate(start)} – ${formatDate(end)}`;
}

export function addDaysIso(iso: string | undefined, days: number): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

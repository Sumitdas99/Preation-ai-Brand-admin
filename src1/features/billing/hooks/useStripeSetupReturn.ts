import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBillingScenario } from "@/api/billingScenario";
import { billingKeys } from "./queryKeys";

const RETURN_KEY = "praetion.billing.stripeReturn";
const POLL_INTERVAL_MS = 3_000;
const MAX_DURATION_MS = 5_000;
const STALE_AFTER_MS = 5 * 60_000;

export function markStripeSetupInitiated(brandId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      RETURN_KEY,
      JSON.stringify({ brandId, ts: Date.now() }),
    );
  } catch {
    return;
  }
}

function readReturnMarker(): { brandId: string; ts: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(RETURN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { brandId?: string; ts?: number };
    if (
      typeof parsed?.brandId !== "string" ||
      typeof parsed?.ts !== "number"
    ) {
      return null;
    }
    return { brandId: parsed.brandId, ts: parsed.ts };
  } catch {
    return null;
  }
}

function clearReturnMarker(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(RETURN_KEY);
  } catch {
    return;
  }
}

export interface UseStripeSetupReturnResult {
  isVerifying: boolean;
  start: () => void;
  stop: () => void;
}

export function useStripeSetupReturn(
  brandId: string | undefined,
): UseStripeSetupReturnResult {
  const queryClient = useQueryClient();
  const [isVerifying, setIsVerifying] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const scenario = useBillingScenario();

  const stop = useCallback(() => {
    setIsVerifying(false);
    startedAtRef.current = null;
    clearReturnMarker();
  }, []);

  const start = useCallback(() => {
    if (!brandId) return;
    markStripeSetupInitiated(brandId);
    startedAtRef.current = Date.now();
    setIsVerifying(true);
  }, [brandId]);

  useEffect(() => {
    if (!brandId) return;
    const marker = readReturnMarker();
    if (!marker) return;
    if (marker.brandId !== brandId) return;
    if (Date.now() - marker.ts > STALE_AFTER_MS) {
      clearReturnMarker();
      return;
    }
    startedAtRef.current = Date.now();
    setIsVerifying(true);
  }, [brandId]);

  useEffect(() => {
    if (!isVerifying || !brandId) return;
    const interval = window.setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: billingKeys.paymentStatus(brandId, scenario),
      });
      queryClient.invalidateQueries({
        queryKey: billingKeys.brand(brandId, scenario),
      });
      const startedAt = startedAtRef.current;
      if (startedAt && Date.now() - startedAt > MAX_DURATION_MS) {
        stop();
      }
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [isVerifying, brandId, scenario, queryClient, stop]);

  return { isVerifying, start, stop };
}

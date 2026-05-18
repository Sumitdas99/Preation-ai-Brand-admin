import { useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { USE_MSW } from "@/lib/env";
import type { ViewerRole } from "@/components/preflight/viewerRole";

const DEFAULT_ROLE: ViewerRole = "Reviewer";

function parseRoleParam(raw: string | null): ViewerRole | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower === "legal") return "Legal";
  if (lower === "reviewer") return "Reviewer";
  return null;
}

function readRoleFromSession(): ViewerRole {
  return DEFAULT_ROLE;
}

interface UseCurrentViewerRoleResult {
  role: ViewerRole;
  canSwitchRole: boolean;
  setRole: (next: ViewerRole) => void;
}

export function useCurrentViewerRole(): UseCurrentViewerRoleResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const arrivedWithRole = useRef(searchParams.get("r"));

  const role = useMemo<ViewerRole>(() => {
    if (USE_MSW) {
      return parseRoleParam(searchParams.get("r")) ?? DEFAULT_ROLE;
    }
    return readRoleFromSession();
  }, [searchParams]);

  const canSwitchRole =
    USE_MSW && parseRoleParam(arrivedWithRole.current) === null;

  const setRole = useCallback(
    (next: ViewerRole) => {
      if (!USE_MSW) return;
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next === "Reviewer") params.delete("r");
          else params.set("r", "legal");
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { role, canSwitchRole, setRole };
}

import type { DisclosureSpec } from "@/api/schemas/disclosure";
import type {
  LockFooterVM,
  LockStatusTone,
  ValidationPanelVM,
} from "@/components/disclosure/types";
import { LOCK_FOOTER_COPY } from "../copy";

export function toLockFooter(
  spec: DisclosureSpec,
  validation: ValidationPanelVM,
): LockFooterVM {
  const locked = spec.status === "DISCLOSURE_SPEC_LOCKED";
  const disabled = locked || !validation.allPass;

  let heading: string;
  let body: string;
  let statusTone: LockStatusTone;
  if (locked) {
    heading = LOCK_FOOTER_COPY.lockedHeading;
    body = LOCK_FOOTER_COPY.lockedBody;
    statusTone = "locked";
  } else if (validation.allPass) {
    heading = LOCK_FOOTER_COPY.readyHeading;
    body = LOCK_FOOTER_COPY.readyBody;
    statusTone = "ready";
  } else {
    heading = LOCK_FOOTER_COPY.pendingHeading(
      validation.passCount,
      validation.totalCount,
    );
    body = LOCK_FOOTER_COPY.pendingBody;
    statusTone = "pending";
  }

  return {
    statusTone,
    heading,
    body,
    passCount: validation.passCount,
    totalCount: validation.totalCount,
    ctaLabel: LOCK_FOOTER_COPY.ctaLabel,
    disabled,
    locked,
    lockedAt: spec.locked_at,
    lockedHash: spec.locked_hash,
  };
}

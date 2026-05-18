import type { ReactNode } from "react";

const DEFAULT_BODY =
  "Updates apply to new checks only. Existing assets keep their previous results. Thresholds can be lowered within the active geo preset limit.";

interface ChangesTakeEffectNoticeProps {
  body?: ReactNode;
}

export function ChangesTakeEffectNotice({ body }: ChangesTakeEffectNoticeProps = {}) {
  return (
    <div className="rounded-r-md border-l-4 border-l-amber-600 bg-amber-50 px-4 py-3 text-sm font-semibold leading-relaxed text-amber-900">
      <p>
        <span className="font-bold">
          Changes take effect on the next preflight run only.
        </span>{" "}
        {body ?? DEFAULT_BODY}
      </p>
    </div>
  );
}

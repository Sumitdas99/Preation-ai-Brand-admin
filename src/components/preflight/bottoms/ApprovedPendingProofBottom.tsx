import { ArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePreFlightActions } from "@/features/preflight/actions/PreFlightActionsContext";
import { ActionsSection } from "../actions/ActionsSection";
import type { PreFlightData } from "../types";

interface Props {
  data: PreFlightData;
}

const REQUIRED_ACTION_ID = "upload-disclosure-proof";

export function ApprovedPendingProofBottom({ data }: Props) {
  const otherSections = data.actionSections.filter(
    (s) => !s.items.some((i) => i.id === REQUIRED_ACTION_ID),
  );

  return (
    <section className="space-y-6 px-6 pb-8 pt-5">
      <RequiredActionPanel />

      {otherSections.map((section, i) => (
        <ActionsSection key={i} title={section.title} items={section.items} />
      ))}
    </section>
  );
}

function RequiredActionPanel() {
  const { onAction, pendingAction, disabledActions } = usePreFlightActions();
  const id = REQUIRED_ACTION_ID;
  const isPending = pendingAction === id;
  const isDisabled = disabledActions.has(id) || Boolean(pendingAction);

  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Required Action
      </h3>

      <div className="flex flex-col gap-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-4 sm:flex-row sm:items-center">
        <p className="min-w-0 flex-1 text-sm leading-relaxed text-emerald-900">
          <span className="font-bold">
            Upload disclosure proof to complete publish clearance.
          </span>{" "}
          <span className="font-semibold text-emerald-900/80">
            Attach the final asset with the disclosure overlay applied, or a platform screenshot showing the disclosure in context.
          </span>
        </p>

        <Button
          type="button"
          onClick={() =>
            onAction(id, {
              id,
              label: "Upload Disclosure Proof",
              primary: true,
            })
          }
          disabled={isDisabled}
          className={cn(
            "shrink-0 self-start text-base font-bold sm:self-auto",
            "bg-emerald-700 text-white hover:bg-emerald-800",
            "focus-visible:ring-emerald-700",
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <ArrowUp className="h-4 w-4" aria-hidden />
          )}
          Upload Disclosure Proof
        </Button>
      </div>
    </div>
  );
}

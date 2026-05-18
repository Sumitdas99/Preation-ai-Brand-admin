import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  C2paEmbeddingCard,
  ChangesTakeEffectNotice,
  ProvenanceSummaryCard,
} from "@/components/policyThresholds";
import { ValidationError } from "@/api/errors";
import type {
  PatchWorkspaceSettingsRequest,
  ProvenanceSummary,
  WorkspaceSettings,
} from "@/api/schemas/policyThresholds";
import { useToast } from "@/hooks/use-toast";

interface ProvenanceTabProps {
  settings: WorkspaceSettings;
  provenanceSummary?: ProvenanceSummary;
  isProvenancePending: boolean;
  isSaving: boolean;
  onSave: (
    payload: PatchWorkspaceSettingsRequest,
  ) => Promise<WorkspaceSettings>;
}

const resolveCurrent = (settings: WorkspaceSettings) =>
  settings.provenance_embed_on_human_generated ?? true;

export function ProvenanceTab({
  settings,
  provenanceSummary,
  isProvenancePending,
  isSaving,
  onSave,
}: ProvenanceTabProps) {
  const { toast } = useToast();
  const savedValue = resolveCurrent(settings);
  const [pendingValue, setPendingValue] = useState<boolean>(savedValue);

  useEffect(() => {
    setPendingValue(savedValue);
  }, [savedValue]);

  const isDirty = pendingValue !== savedValue;

  const handleSave = async () => {
    if (!isDirty) return;
    try {
      await onSave({ provenance_embed_on_human_generated: pendingValue });
      toast({
        title: "Provenance settings saved",
        description: pendingValue
          ? "C2PA embedding will run on human-generated assets on the next preflight run."
          : "C2PA embedding skipped for human-generated assets on the next preflight run.",
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        toast({
          variant: "destructive",
          title: "Provenance update rejected",
          description: "The provenance setting was rejected by the server.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Save failed",
          description:
            err instanceof Error ? err.message : "Unable to save settings.",
        });
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">Provenance Settings</h1>
          <p className="mt-1 max-w-3xl text-sm font-semibold leading-relaxed text-foreground/80">
            Configure how the Provenance Engine handles C2PA embedding for
            assets in this workspace.
          </p>
        </div>
        <Button
          className="mt-0 w-full font-semibold sm:w-auto sm:shrink-0"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? "Saving…" : "Save settings"}
        </Button>
      </div>

      <ChangesTakeEffectNotice
        body={
          <>
            Updates apply to new checks only. Existing assets keep their
            previous provenance status. Run a new preflight check to apply this
            setting to an existing asset.
          </>
        }
      />

      <C2paEmbeddingCard
        pendingValue={pendingValue}
        onChange={setPendingValue}
      />

      <ProvenanceSummaryCard
        summary={provenanceSummary}
        isPending={isProvenancePending && !provenanceSummary}
      />
    </div>
  );
}

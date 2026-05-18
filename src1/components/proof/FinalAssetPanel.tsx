import { HashCard } from "./HashCard";
import { MetadataValidationCard } from "./MetadataValidationCard";
import { StepHeader } from "./StepHeader";
import { UploadDropZone } from "./UploadDropZone";
import type { ProofFinalAssetForm } from "./types";

interface Props {
  data: ProofFinalAssetForm;
  selectedFile: File | null;
  hash?: string;
  computingHash?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  onFileSelected: (file: File) => void;
  onClear: () => void;
}

export function FinalAssetPanel({
  data,
  selectedFile,
  hash,
  computingHash,
  errorMessage,
  disabled,
  onFileSelected,
  onClear,
}: Props) {
  return (
    <section className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <StepHeader step={2} title={data.heading} />

      <div className="space-y-5 px-6 py-5">
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {data.uploadHeading}
            {!selectedFile ? (
              <span className="ml-2 text-xs font-semibold text-red-600">Required</span>
            ) : null}
          </h3>
          <UploadDropZone
            ctaLabel={data.uploadCta}
            hint={data.uploadHint}
            selectedFile={selectedFile}
            computingHash={computingHash}
            onFileSelected={onFileSelected}
            onClear={onClear}
            disabled={disabled}
            errorMessage={errorMessage}
          />
        </div>

        {selectedFile ? (
          <HashCard
            header={data.hashHeader}
            hint={data.hashHint}
            hash={hash}
            pending={computingHash}
          />
        ) : null}

        <MetadataValidationCard
          header={data.validationHeader}
          checks={data.validationChecks}
        />
      </div>
    </section>
  );
}

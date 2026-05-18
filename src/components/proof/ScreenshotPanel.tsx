import { StepHeader } from "./StepHeader";
import { UploadDropZone } from "./UploadDropZone";
import type { ProofScreenshotForm } from "./types";

interface Props {
  data: ProofScreenshotForm;
  selectedFile: File | null;
  attestationConfirmed: boolean;
  errorMessage?: string;
  attestationError?: string;
  disabled?: boolean;
  onFileSelected: (file: File) => void;
  onClear: () => void;
  onAttestationChange: (next: boolean) => void;
}

export function ScreenshotPanel({
  data,
  selectedFile,
  attestationConfirmed,
  errorMessage,
  attestationError,
  disabled,
  onFileSelected,
  onClear,
  onAttestationChange,
}: Props) {
  return (
    <section className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <StepHeader step={2} title={data.heading} />

      <div className="space-y-5 px-6 py-5">
        <p className="text-sm font-semibold leading-relaxed text-foreground/80">
          {data.description}
        </p>

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
            accept="image/*"
            selectedFile={selectedFile}
            onFileSelected={onFileSelected}
            onClear={onClear}
            disabled={disabled}
            errorMessage={errorMessage}
          />
        </div>

        <label
          className="flex items-start gap-3 rounded-md bg-muted/30 px-4 py-3"
          htmlFor="screenshot-attestation"
        >
          <input
            id="screenshot-attestation"
            type="checkbox"
            checked={attestationConfirmed}
            onChange={(e) => onAttestationChange(e.target.checked)}
            disabled={disabled}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-slate-400 bg-white text-white transition-colors peer-checked:border-[#0f1d3b] peer-checked:bg-[#0f1d3b] peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
          >
            {attestationConfirmed ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
              >
                <path d="M4 13.5l5 5L21 5" />
              </svg>
            ) : null}
          </span>
          <span className="text-sm font-semibold leading-relaxed text-foreground">
            {data.attestationLabel}
          </span>
        </label>
        {attestationError ? (
          <p className="-mt-3 text-xs font-semibold text-red-600">
            {attestationError}
          </p>
        ) : null}
      </div>
    </section>
  );
}

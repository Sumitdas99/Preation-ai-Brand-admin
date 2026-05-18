import { Upload } from "lucide-react";
import { useCallback, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  ctaLabel: string;
  hint: string;
  accept?: string;
  selectedFile?: File | null;
  computingHash?: boolean;
  onFileSelected: (file: File) => void;
  onClear?: () => void;
  disabled?: boolean;
  errorMessage?: string;
}

export function UploadDropZone({
  ctaLabel,
  hint,
  accept,
  selectedFile,
  computingHash,
  onFileSelected,
  onClear,
  disabled,
  errorMessage,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      onFileSelected(file);
    },
    [onFileSelected],
  );

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled) return;
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-[152px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-6 text-center transition-colors",
          isDragOver
            ? "border-[#0f1d3b] bg-[#0f1d3b]/5"
            : "border-[#0f1d3b]/40 bg-[#f3f6fc]",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
          className="sr-only"
        />

        <span
          aria-hidden
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0f1d3b] shadow-sm"
        >
          <Upload className="h-4 w-4" strokeWidth={2.5} />
        </span>

        {selectedFile ? (
          <>
            <div className="text-sm font-bold text-[#0f1d3b]">
              {selectedFile.name}
            </div>
            <div className="text-xs font-semibold text-[#0f1d3b]/80">
              {formatBytes(selectedFile.size)}
              {computingHash ? " · computing SHA-256…" : ""}
            </div>
            {onClear ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onClear();
                  if (inputRef.current) inputRef.current.value = "";
                }}
                disabled={disabled}
                className="mt-1 text-xs font-bold text-[#0f1d3b]"
              >
                Replace file
              </button>
            ) : null}
          </>
        ) : (
          <>
            <div className="text-sm font-bold text-[#0f1d3b]">{ctaLabel}</div>
            <p className="max-w-md text-xs font-semibold leading-relaxed text-[#0f1d3b]/80">
              {hint}
            </p>
          </>
        )}
      </label>
      {errorMessage ? (
        <p className="text-xs font-semibold text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

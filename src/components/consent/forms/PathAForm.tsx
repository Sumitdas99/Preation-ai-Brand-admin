import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PathAFormSchema,
  type PathAFormValues,
} from "@/features/consent/forms/rplFormSchemas";
import { sha256File } from "@/features/consent/lib/sha256";
import type { RplSubmissionPathA } from "@/api/schemas/consent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuditFooter } from "../primitives/AuditFooter";
import type { RplSectionVM } from "../types";

interface Props {
  copy: RplSectionVM["pathACopy"];
  consentTypeOptions: RplSectionVM["consentTypeOptions"];
  organisationName: string;
  disabled: boolean;
  submitting: boolean;
  onSubmit: (body: RplSubmissionPathA) => void;
}

export function PathAForm({
  copy,
  consentTypeOptions,
  organisationName,
  disabled,
  submitting,
  onSubmit,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [hashing, setHashing] = useState(false);
  const [computedHash, setComputedHash] = useState<string | undefined>();
  const [dragOver, setDragOver] = useState(false);

  const form = useForm<PathAFormValues>({
    resolver: zodResolver(PathAFormSchema),
    defaultValues: {
      consent_path: "A",
      document_description: "",
      declaration_confirmed: false,
    },
    mode: "onSubmit",
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = form;

  const file = watch("document") as File | undefined;
  const declarationConfirmed = watch("declaration_confirmed");

  const handleFileChange = async (next: File | undefined) => {
    if (!next) {
      setValue("document", undefined as unknown as File, {
        shouldValidate: true,
      });
      setComputedHash(undefined);
      return;
    }
    setValue("document", next, { shouldValidate: true });
    setHashing(true);
    try {
      const hash = await sha256File(next);
      setComputedHash(hash);
    } catch {
      setComputedHash(undefined);
    } finally {
      setHashing(false);
    }
  };

  const submit = handleSubmit(async (values) => {
    const hash = computedHash ?? (await sha256File(values.document));
    const body: RplSubmissionPathA = {
      consent_path: "A",
      consent_type: values.consent_type,
      document_filename: values.document.name,
      document_size_bytes: values.document.size,
      document_hash: hash,
      document_description: values.document_description,
      declaration_confirmed: true,
    };
    onSubmit(body);
  });

  const declarationCopy = copy.declarationText.replace(
    "[Organisation]",
    organisationName,
  );
  const orgHighlighted = declarationCopy
    .split(organisationName)
    .reduce<React.ReactNode[]>((acc, chunk, idx, arr) => {
      acc.push(<span key={`txt-${idx}`}>{chunk}</span>);
      if (idx < arr.length - 1) {
        acc.push(
          <strong key={`org-${idx}`} className="font-bold text-slate-900">
            {organisationName}
          </strong>,
        );
      }
      return acc;
    }, []);

  const criteriaMet = Boolean(file) && Boolean(declarationConfirmed);

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {copy.step2Heading}
        </h2>
        {!criteriaMet ? (
          <span className="text-[11px] font-bold leading-none text-rose-700">
            Required
          </span>
        ) : null}
      </div>

      <section className="rounded-lg border border-emerald-200/80 bg-emerald-50/30 p-4">
        <div className="space-y-3">
          <FieldLabel label={copy.uploadLabel.toUpperCase()} />

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled={disabled}
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            className="sr-only"
          />

          {!file ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) handleFileChange(dropped);
              }}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-emerald-50/40 px-4 py-7 text-center transition-colors",
                "border-emerald-300 hover:bg-emerald-50/70",
                dragOver && "border-emerald-500 bg-emerald-50",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                <Upload className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-sm font-semibold text-emerald-800">
                Upload consent document
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {copy.uploadHint}
              </span>
            </button>
          ) : (
            <FilePreview
              file={file}
              disabled={disabled}
              onClear={() => handleFileChange(undefined)}
            />
          )}

          {errors.document ? (
            <p className="text-xs font-medium text-rose-700">
              {String(errors.document.message)}
            </p>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <FieldLabel label={copy.consentTypeLabel.toUpperCase()} />
            <Controller
              control={control}
              name="consent_type"
              render={({ field }) => (
                <Select
                  disabled={disabled}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    ref={field.ref}
                    onBlur={field.onBlur}
                    className={cn(
                      "h-10 w-full rounded-md border-slate-300 bg-white text-sm font-semibold text-slate-900",
                      "focus:ring-emerald-300 focus:ring-offset-0",
                      "data-[placeholder]:text-slate-400",
                    )}
                  >
                    <SelectValue placeholder="Select consent type…" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md">
                    {consentTypeOptions.map((o) => (
                      <SelectItem
                        key={o.value}
                        value={o.value}
                        className="font-semibold text-slate-900 focus:text-slate-900"
                      >
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.consent_type ? (
              <p className="text-xs font-medium text-rose-700">
                {String(errors.consent_type.message)}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <FieldLabel label={copy.descriptionLabel.toUpperCase()} />
            <input
              type="text"
              placeholder={copy.descriptionPlaceholder}
              disabled={disabled}
              {...register("document_description")}
              className={cn(
                "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400",
                "focus:border-emerald-500 focus:outline-none focus:placeholder:text-transparent",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            />
            {errors.document_description ? (
              <p className="text-xs font-medium text-rose-700">
                {String(errors.document_description.message)}
              </p>
            ) : null}
          </div>
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm font-semibold leading-relaxed text-slate-700">
          <input
            type="checkbox"
            disabled={disabled}
            {...register("declaration_confirmed")}
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-300"
          />
          <span>{orgHighlighted}</span>
        </label>
        {errors.declaration_confirmed ? (
          <p className="mt-1 text-xs font-medium text-rose-700">
            {String(errors.declaration_confirmed.message)}
          </p>
        ) : null}
      </section>

      <AuditFooter
        tone="emerald"
        pendingHeading={copy.pendingHeading}
        pendingBody={copy.pendingBody}
        readyHeading={copy.readyHeading}
        readyBody={copy.readyBody}
        submitLabel={copy.submitLabel}
        submitting={submitting || hashing}
        submitDisabled={disabled || !file || !declarationConfirmed}
      />
    </form>
  );
}

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </span>
      {required ? (
        <span className="text-[11px] font-medium text-rose-700">Required</span>
      ) : null}
    </div>
  );
}

function FilePreview({
  file,
  disabled,
  onClear,
}: {
  file: File;
  disabled: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-white px-3.5 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
        <FileText className="h-4 w-4" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-semibold text-slate-900">
          {file.name}
        </span>
        <span className="text-[11px] font-semibold text-slate-500">
          {(file.size / 1024).toFixed(1)} KB · {file.type || "Unknown type"}
        </span>
      </div>
      <button
        type="button"
        aria-label="Remove file"
        disabled={disabled}
        onClick={onClear}
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors",
          "hover:bg-emerald-50 hover:text-emerald-700",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300",
          disabled && "cursor-not-allowed opacity-60 hover:bg-transparent hover:text-slate-400",
        )}
      >
        <X className="h-4 w-4" strokeWidth={2.25} aria-hidden />
      </button>
    </div>
  );
}

import { useEffect, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";
import type {
  DisclosureScope,
  PlacementLocation,
} from "@/api/schemas/disclosure";
import { cn } from "@/lib/utils";
import type { SectionCVM } from "../types";

export interface CaptionPatch {
  caption_text?: string;
  caption_first_line_confirmed?: boolean;
}

export interface ExternalPatch {
  external_justification?: string;
  external_acknowledged?: boolean;
}

interface Props {
  data: SectionCVM;
  disabled?: boolean;
  onLocationChange: (location: PlacementLocation) => void;
  onScopeChange: (scope: DisclosureScope) => void;
  onFullDurationToggle: (value: boolean) => void;
  onStartMsChange: (value: number | undefined) => void;
  onEndMsChange: (value: number | undefined) => void;
  onCaptionPatch: (patch: CaptionPatch) => void;
  onExternalPatch: (patch: ExternalPatch) => void;
}

export function SectionC({
  data,
  disabled,
  onLocationChange,
  onFullDurationToggle,
  onStartMsChange,
  onEndMsChange,
  onCaptionPatch,
  onExternalPatch,
}: Props) {
  const isLocked = data.locked;
  const fieldsDisabled = disabled || isLocked;

  const showOnAsset = isLocked || data.showOnAssetFields;
  const showCaption = !isLocked && data.showCaptionFields;
  const showExternal = !isLocked && data.showExternalFields;

  return (
    <section>
      <div className="overflow-hidden rounded-lg border-[1.25px] border-slate-200 bg-card shadow-sm [contain:layout_paint]">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-slate-50/60 px-6 py-3.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A1F44] text-sm font-semibold text-white">
            {data.badgeLetter}
          </span>
          <h3 className="text-xl font-semibold leading-none text-slate-600">
            {data.title}
          </h3>
        </header>

        <div
          className={cn(
            "space-y-6 px-6 py-6 transition-opacity",
            isLocked && "pointer-events-none opacity-50",
          )}
          aria-disabled={isLocked || undefined}
        >
          {showOnAsset ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="min-w-0 space-y-2">
                  <label className="block">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      {data.locationLabel}
                    </span>
                    <div className="relative mt-2">
                      <select
                        value={data.locationValue ?? ""}
                        disabled={fieldsDisabled}
                        onChange={(e) =>
                          onLocationChange(
                            e.target.value as PlacementLocation,
                          )
                        }
                        className="block w-full appearance-none rounded-md border border-slate-300 bg-white px-3.5 py-3 pr-9 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                      >
                        <option value="" disabled>
                          {data.locationPlaceholder}
                        </option>
                        {data.locationOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        aria-hidden
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                      />
                    </div>
                  </label>
                  <p className="text-xs font-medium leading-relaxed text-slate-500">
                    {data.locationHelper}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {data.scopeLabel}
                  </span>
                  <CheckboxRow
                    checked={data.fullDurationConfirmed}
                    disabled={
                      fieldsDisabled ||
                      data.scopeValue !== "FULL" ||
                      !data.locationValue
                    }
                    onChange={onFullDurationToggle}
                    label={data.fullDurationLabel}
                  />
                  <p className="text-xs font-medium leading-relaxed text-slate-500">
                    {data.fullDurationHelper}
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  "space-y-4 rounded-md border border-slate-200 bg-slate-50/40 px-4 py-4 transition-opacity",
                  data.timeRangeDimmed && "opacity-60",
                )}
              >
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Video preview - Time range selection
                </span>
                <ScrubberTrack
                  durationMs={data.assetDurationMs ?? 0}
                  selectionStartMs={data.startMs}
                  selectionEndMs={data.endMs}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <NumberField
                    label={data.timeRangeStartLabel}
                    placeholder={data.timeRangeStartPlaceholder}
                    value={data.startMs}
                    disabled={fieldsDisabled || data.timeRangeDimmed}
                    onChange={onStartMsChange}
                    max={data.assetDurationMs}
                  />
                  <NumberField
                    label={data.timeRangeEndLabel}
                    placeholder={data.timeRangeEndPlaceholder}
                    value={data.endMs}
                    disabled={fieldsDisabled || data.timeRangeDimmed}
                    onChange={onEndMsChange}
                    max={data.assetDurationMs}
                  />
                </div>
                <p className="text-xs font-medium leading-relaxed text-slate-500">
                  {data.timeRangeHelper}
                </p>
              </div>
            </div>
          ) : null}

          {showCaption ? (
            <div className="space-y-4">
              <label className="block">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {data.captionTextLabel}
                </span>
                <textarea
                  rows={3}
                  value={data.captionTextValue ?? ""}
                  placeholder={data.captionTextPlaceholder}
                  disabled={fieldsDisabled}
                  onChange={(e) => {
                    const value = e.target.value;
                    const patch: CaptionPatch = { caption_text: value };
                    if (!value.trim() && data.captionFirstLineConfirmed) {
                      patch.caption_first_line_confirmed = false;
                    }
                    onCaptionPatch(patch);
                  }}
                  className="mt-2 block w-full resize-none rounded-md border border-slate-300 bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:placeholder:text-transparent disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </label>
              <CheckboxRow
                checked={data.captionFirstLineConfirmed ?? false}
                disabled={fieldsDisabled || !data.captionTextValue?.trim()}
                onChange={(value) =>
                  onCaptionPatch({ caption_first_line_confirmed: value })
                }
                label={data.captionFirstLineLabel}
                tone="subdued"
              />
            </div>
          ) : null}

          {showExternal ? (
            <div className="space-y-4">
              <label className="block">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {data.externalJustificationLabel}
                </span>
                <textarea
                  rows={3}
                  value={data.externalJustificationValue ?? ""}
                  placeholder={data.externalJustificationPlaceholder}
                  disabled={fieldsDisabled}
                  onChange={(e) => {
                    const value = e.target.value;
                    const patch: ExternalPatch = {
                      external_justification: value,
                    };
                    if (!value.trim() && data.externalAcknowledged) {
                      patch.external_acknowledged = false;
                    }
                    onExternalPatch(patch);
                  }}
                  className="mt-2 block w-full resize-none rounded-md border border-slate-300 bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:placeholder:text-transparent disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </label>
              <CheckboxRow
                checked={data.externalAcknowledged ?? false}
                disabled={
                  fieldsDisabled ||
                  !data.externalJustificationValue?.trim()
                }
                onChange={(value) =>
                  onExternalPatch({ external_acknowledged: value })
                }
                label={data.externalAckLabel}
                tone="subdued"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

interface CheckboxRowProps {
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  label: string;
  tone?: "default" | "subdued";
}

function CheckboxRow({
  checked,
  disabled,
  onChange,
  label,
  tone = "default",
}: CheckboxRowProps) {
  return (
    <label
      className={cn(
        "flex w-fit cursor-pointer items-center gap-2.5 text-sm font-medium leading-none",
        tone === "subdued" ? "text-slate-500" : "text-slate-900",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border leading-none transition-colors",
          checked
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 bg-white",
        )}
      >
        <Check
          className={cn("block h-3 w-3", !checked && "invisible")}
          strokeWidth={3}
        />
      </span>
      <span className="leading-none">{label}</span>
    </label>
  );
}

interface NumberFieldProps {
  label: string;
  placeholder: string;
  value?: number;
  disabled?: boolean;
  onChange: (value: number | undefined) => void;
  max?: number;
}

function NumberField({
  label,
  placeholder,
  value,
  disabled,
  onChange,
  max,
}: NumberFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const focusedRef = useRef(false);
  const initialValueRef = useRef<string>(
    value !== undefined ? String(value) : "",
  );

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    if (focusedRef.current) return;
    const next = value !== undefined ? String(value) : "";
    if (el.value !== next) {
      el.value = next;
    }
  }, [value]);

  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        defaultValue={initialValueRef.current}
        placeholder={placeholder}
        disabled={disabled}
        onMouseDown={() => {
          focusedRef.current = true;
        }}
        onFocus={(e) => {
          focusedRef.current = true;
          const el = e.currentTarget;
          requestAnimationFrame(() => {
            if (document.activeElement === el) {
              const end = el.value.length;
              try {
                el.setSelectionRange(end, end);
              } catch { }
            }
          });
        }}
        onChange={(e) => {
          const el = e.currentTarget;
          const raw = el.value;
          const cleaned = raw.replace(/[^0-9]/g, "");
          if (cleaned !== raw) {
            const pos = (el.selectionStart ?? cleaned.length) - (raw.length - cleaned.length);
            el.value = cleaned;
            const safePos = Math.max(0, Math.min(pos, cleaned.length));
            try {
              el.setSelectionRange(safePos, safePos);
            } catch { }
          }
          if (cleaned === "") {
            onChange(undefined);
            return;
          }
          const n = Number(cleaned);
          if (!Number.isNaN(n)) onChange(n);
        }}
        onBlur={(e) => {
          focusedRef.current = false;
          const el = e.currentTarget;
          const current = el.value;
          if (current === "") {
            onChange(undefined);
            return;
          }
          const n = Number(current);
          if (Number.isNaN(n)) {
            el.value = value !== undefined ? String(value) : "";
            return;
          }
          const clamped =
            typeof max === "number"
              ? Math.min(Math.max(0, n), max)
              : Math.max(0, n);
          if (clamped !== n) el.value = String(clamped);
          onChange(clamped);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:placeholder:text-transparent disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
      />
    </label>
  );
}

interface ScrubberTrackProps {
  durationMs: number;
  selectionStartMs?: number;
  selectionEndMs?: number;
}

function ScrubberTrack({
  durationMs,
  selectionStartMs,
  selectionEndMs,
}: ScrubberTrackProps) {
  const hasValidRange =
    durationMs > 0 &&
    typeof selectionStartMs === "number" &&
    typeof selectionEndMs === "number" &&
    selectionStartMs >= 0 &&
    selectionEndMs > selectionStartMs;

  const clampedStart = hasValidRange
    ? Math.max(0, Math.min(selectionStartMs!, durationMs))
    : 0;
  const clampedEnd = hasValidRange
    ? Math.max(clampedStart, Math.min(selectionEndMs!, durationMs))
    : 0;

  const leftPct = hasValidRange ? (clampedStart / durationMs) * 100 : 0;
  const widthPct = hasValidRange
    ? ((clampedEnd - clampedStart) / durationMs) * 100
    : 0;

  return (
    <div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="absolute inset-y-0 rounded-full bg-blue-500 transition-[left,width] duration-300 ease-out"
          style={{
            left: `${leftPct}%`,
            width: `${hasValidRange ? widthPct : 0}%`,
          }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-500">
        <span>{formatMs(0)}</span>
        <span>{formatMs(durationMs)}</span>
      </div>
    </div>
  );
}

function formatMs(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

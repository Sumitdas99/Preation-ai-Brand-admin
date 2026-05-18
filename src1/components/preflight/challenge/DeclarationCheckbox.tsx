import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  checked: boolean;
  disabled?: boolean;
  errorMessage?: string;
  name: string;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

export const DeclarationCheckbox = forwardRef<HTMLInputElement, Props>(
  function DeclarationCheckbox(
    { label, checked, disabled, errorMessage, name, onBlur, onChange },
    ref,
  ) {
    return (
      <section className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold uppercase tracking-wider text-[#3C3489]">
            Declaration
          </span>
          {checked ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
              Confirmed
            </span>
          ) : (
            <span className="text-xs font-semibold text-rose-700">
              Required
            </span>
          )}
        </div>
        <label
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-md border-[0.5px] p-3 text-sm font-semibold leading-relaxed transition-colors",
            checked
              ? "border-emerald-400 bg-emerald-50/50 text-emerald-700"
              : "border-[#534BB7]/30 bg-white text-[#3C3489]",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <span className="relative mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center">
            <input
              type="checkbox"
              ref={ref}
              name={name}
              disabled={disabled}
              onBlur={onBlur}
              onChange={onChange}
              className={cn(
                "peer absolute inset-0 m-0 cursor-pointer appearance-none rounded-sm border-2 border-[#534BB7]/30 bg-white transition-colors",
                "checked:border-[#534BB7] checked:bg-[#534BB7]",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            />
            <Check
              className="pointer-events-none relative h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
              strokeWidth={2.5}
              aria-hidden
            />
          </span>
          <span>{label}</span>
        </label>
        {errorMessage ? (
          <p className="text-xs font-medium text-rose-700">{errorMessage}</p>
        ) : null}
      </section>
    );
  },
);

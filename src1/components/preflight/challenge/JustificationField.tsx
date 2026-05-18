import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  placeholder?: string;
  minLength: number;
  currentLength: number;
  disabled?: boolean;
  name: string;
  onBlur: React.FocusEventHandler<HTMLTextAreaElement>;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
}

export const JustificationField = forwardRef<HTMLTextAreaElement, Props>(
  function JustificationField(
    {
      label,
      placeholder,
      minLength,
      currentLength,
      disabled,
      name,
      onBlur,
      onChange,
    },
    ref,
  ) {
    const met = currentLength >= minLength;
    const remaining = Math.max(0, minLength - currentLength);
    const counter = met
      ? `${currentLength} characters, minimum met`
      : `${currentLength} / ${minLength} minimum, ${remaining} more character${remaining === 1 ? "" : "s"} required`;

    return (
      <section className="space-y-2">
        <label
          htmlFor={name}
          className="flex flex-wrap items-center gap-x-2 gap-y-1"
        >
          <span className="text-sm font-bold uppercase tracking-wider text-[#3C3489]">
            {label}
          </span>
          {met ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
              Minimum met
            </span>
          ) : (
            <span className="text-xs font-semibold text-rose-700">
              Required
            </span>
          )}
        </label>
        <textarea
          id={name}
          name={name}
          rows={4}
          ref={ref}
          placeholder={placeholder}
          disabled={disabled}
          onBlur={onBlur}
          onChange={onChange}
          className={cn(
            "block min-h-[7rem] w-full resize-y rounded-md border-[0.5px] bg-white px-3 py-2 text-sm leading-relaxed text-slate-900 outline-none transition-colors",
            "placeholder:text-slate-400 placeholder:transition-opacity placeholder:duration-150",
            met
              ? "border-emerald-400 focus:border-emerald-500"
              : "border-rose-400 focus:border-rose-500",
            "focus:placeholder:opacity-0 disabled:cursor-not-allowed disabled:opacity-60",
          )}
        />
        <div className="flex items-baseline justify-between gap-3 text-xs font-semibold">
          <span
            className={cn(met ? "text-emerald-700" : "text-rose-700")}
          >
            {met ? `✓ ${counter}` : counter}
          </span>
        </div>
      </section>
    );
  },
);

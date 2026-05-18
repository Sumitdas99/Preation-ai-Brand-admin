import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Variant = "light" | "dark";

interface FieldGroupProps {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  readOnly?: boolean;
  variant?: Variant;
  rightSlot?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function FieldGroup({
  id,
  label,
  hint,
  error,
  required,
  readOnly,
  variant = "light",
  rightSlot,
  children,
  className,
}: FieldGroupProps) {
  const isDark = variant === "dark";
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <Label
          htmlFor={id}
          className={cn(
            "text-[11px] font-semibold uppercase tracking-wider",
            isDark ? "text-white/80" : "text-slate-600",
          )}
        >
          <span className="inline-flex items-center gap-1">
            {label}
            {required ? (
              <span className={cn(isDark ? "text-amber-300" : "text-rose-500")}>
                *
              </span>
            ) : null}
            {readOnly ? (
              <span
                className={cn(
                  "ml-2 rounded px-1.5 py-px text-[10px] font-medium uppercase tracking-wider",
                  isDark
                    ? "bg-white/10 text-white/70"
                    : "bg-slate-200 text-slate-600",
                )}
              >
                Read-only
              </span>
            ) : null}
          </span>
        </Label>
        {rightSlot}
      </div>
      {children}
      {error ? (
        <p className={cn("text-xs", isDark ? "text-amber-300" : "text-rose-600")}>
          {error}
        </p>
      ) : hint ? (
        <p
          className={cn(
            "text-[11px] leading-snug",
            isDark ? "text-white/60" : "text-slate-500",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: Variant;
  hasError?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ variant = "light", hasError, className, ...rest }, ref) => {
    const isDark = variant === "dark";
    return (
      <Input
        ref={ref}
        className={cn(
          "h-10 rounded-md text-sm",
          isDark
            ? "border-white/15 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-amber-300/50 focus-visible:border-amber-300/50"
            : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#0A1F44]/30 focus-visible:border-[#0A1F44]",
          hasError &&
            (isDark
              ? "border-amber-300 focus-visible:border-amber-300"
              : "border-rose-400 focus-visible:border-rose-400"),
          className,
        )}
        {...rest}
      />
    );
  },
);
FormInput.displayName = "FormInput";

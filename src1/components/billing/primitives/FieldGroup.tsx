import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Variant = "light" | "dark";

interface FieldGroupProps {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  filled?: boolean;
  variant?: Variant;
  rightSlot?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function FieldGroup({
  id,
  label,
  hint,
  required,
  filled,
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
            "flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold uppercase tracking-wider",
            isDark ? "text-white/80" : "text-slate-600",
          )}
        >
          {label}
          {required && !filled ? (
            <span className={cn(
              "text-xs font-semibold normal-case tracking-normal",
              isDark ? "text-rose-400" : "text-rose-700",
            )}>
              Required
            </span>
          ) : null}
        </Label>
        {rightSlot}
      </div>
      {children}
      {hint ? (
        <p
          className={cn(
            "text-[11px] font-bold leading-snug",
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
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ variant = "light", className, ...rest }, ref) => {
    const isDark = variant === "dark";
    return (
      <Input
        ref={ref}
        className={cn(
          "h-10 rounded-md text-sm shadow-none focus:border-2 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
          isDark
            ? "border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-[#E8943A]"
            : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-300 placeholder:italic focus:border-[#0A1F44]",
          className,
        )}
        {...rest}
      />
    );
  },
);
FormInput.displayName = "FormInput";

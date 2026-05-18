import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  backCta: string;
  submitCta: string;
  submitting: boolean;
  submitDisabled: boolean;
  onBack: () => void;
}

export function ProofActionBar({
  backCta,
  submitCta,
  submitting,
  submitDisabled,
  onBack,
}: Props) {
  return (
    <section className="flex flex-col-reverse items-stretch gap-3 rounded-md border border-border bg-card px-6 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        disabled={submitting}
        className="h-11 shrink-0 self-start border-0 bg-slate-100 font-semibold text-slate-800 hover:bg-slate-200 sm:self-auto"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {backCta}
      </Button>

      <Button
        type="submit"
        disabled={submitDisabled}
        className={cn(
          "h-11 shrink-0 self-end text-sm font-bold sm:self-auto",
          "bg-[#0f1d3b] text-white hover:bg-[#1a2c52]",
          "focus-visible:ring-[#0f1d3b]",
        )}
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <CheckGlyph />
        )}
        {submitting ? "Submitting…" : submitCta}
      </Button>
    </section>
  );
}

function CheckGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={14}
      height={14}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 13.5l5 5L21 5" />
    </svg>
  );
}

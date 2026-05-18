import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BrandPackErrorScreenProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function BrandPackErrorScreen({
  title = "We couldn't load this brand",
  description,
  onRetry,
}: BrandPackErrorScreenProps) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-md rounded-xl border border-rose-200 bg-rose-50/60 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="mt-3 text-base font-semibold text-rose-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-rose-800/90">{description}</p>
        ) : null}
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
            className="mt-4 gap-2 border-rose-300 text-rose-700 hover:bg-rose-100"
          >
            <RefreshCcw className="h-4 w-4" /> Try again
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function BrandPackEmptyState() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center">
        <h2 className="text-base font-semibold text-slate-900">
          Select a brand to edit its pack
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Choose a brand from the list, or onboard a new one to get started.
        </p>
      </div>
    </div>
  );
}

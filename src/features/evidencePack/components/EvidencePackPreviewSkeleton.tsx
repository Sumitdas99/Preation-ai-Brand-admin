import { Skeleton } from "@/components/ui/skeleton";

export function EvidencePackPreviewSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div className="border-b px-6 py-3">
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="grid flex-1 gap-6 px-6 py-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

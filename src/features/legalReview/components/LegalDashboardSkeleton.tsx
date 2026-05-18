import { Skeleton } from "@/components/ui/skeleton";

export function LegalDashboardSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div className="border-b px-6 py-3">
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="border-b px-6 py-4">
        <Skeleton className="mb-2 h-6 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4 px-6 py-4 md:grid-cols-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex-1 space-y-3 px-6 py-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

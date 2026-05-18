import { Skeleton } from "@/components/ui/skeleton";

export function ProofSkeleton() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <div className="border-b px-6 py-3">
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="border-b px-6 py-4">
        <Skeleton className="mb-2 h-6 w-96" />
        <Skeleton className="h-4 w-[32rem]" />
      </div>
      <div className="flex-1 space-y-4 p-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

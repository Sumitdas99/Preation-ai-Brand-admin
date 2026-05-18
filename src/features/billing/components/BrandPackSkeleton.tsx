import { Skeleton } from "@/components/ui/skeleton";

export function BrandPackSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-44 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}

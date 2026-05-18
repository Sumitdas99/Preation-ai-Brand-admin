import { Skeleton } from "@/components/ui/skeleton";

export function PolicyThresholdsSkeleton() {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b bg-slate-900 px-6 py-3">
        <Skeleton className="h-5 w-96 bg-slate-700" />
      </div>
      <div className="border-b px-6 py-3">
        <Skeleton className="h-5 w-[32rem]" />
      </div>
      <main className="flex-1 space-y-4 overflow-y-auto p-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </main>
    </div>
  );
}

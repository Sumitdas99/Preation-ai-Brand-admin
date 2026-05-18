import { cn } from "@/lib/utils";

export function DashboardFooterNote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "mx-6 my-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-[13px] leading-relaxed text-blue-900",
        className,
      )}
    >
      {children}
    </aside>
  );
}

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  align?: "left" | "center" | "right" | "between";
  showCount?: boolean;
  itemLabel?: string;
  className?: string;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  align = "between",
  showCount = true,
  itemLabel = "assets",
  className,
}: DataTablePaginationProps) {
  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const alignClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  }[align];

  if (totalCount === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center gap-4 pt-6 border-t mt-6",
        alignClass,
        className
      )}
    >
      {showCount && (
        <p className="text-sm text-muted-foreground">
          Showing {startItem}–{endItem} of {totalCount} {itemLabel}
        </p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}



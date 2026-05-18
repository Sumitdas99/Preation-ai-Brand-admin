import { cn } from "@/lib/utils";
import { Inbox, type LucideIcon } from "lucide-react";

interface Props {
  title: string;
  body?: string;
  icon?: LucideIcon;
  className?: string;
}

export function EmptyState({
  title,
  body,
  icon: Icon = Inbox,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-6 py-12 text-center",
        className,
      )}
    >
      <Icon className="h-8 w-8 text-muted-foreground/70" aria-hidden />
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {body ? (
        <p className="max-w-md text-sm text-muted-foreground">{body}</p>
      ) : null}
    </div>
  );
}

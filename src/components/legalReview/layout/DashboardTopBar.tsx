import { cn } from "@/lib/utils";

interface Props {
  title: string;
  roleLabel: string;
  userName: string;
  workspace: string;
  className?: string;
}

const PILL =
  "shrink-0 whitespace-nowrap rounded-md border-[1.5px] border-white/40 bg-white/5 px-4 py-1.5 text-xs font-medium text-white";

export function DashboardTopBar({
  title,
  roleLabel,
  userName,
  workspace,
  className,
}: Props) {
  return (
    <header
      className={cn(
        "flex h-16 shrink-0 items-center gap-4 overflow-hidden bg-[#0A1F44] px-6 text-white shadow-sm",
        className,
      )}
    >
      <span className="shrink-0 whitespace-nowrap font-display text-lg font-semibold tracking-tight">
        Praetion <span className="text-[#7BB4E2]">AI</span>
      </span>

      <span className="h-5 w-px shrink-0 bg-white/20" aria-hidden />

      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
        {title}
      </span>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <span className={PILL}>{roleLabel}</span>
        <span className={cn(PILL, "inline-flex items-center gap-2")}>
          {userName}
          <span className="inline-block h-3 w-px bg-white/30" aria-hidden />
          {workspace}
        </span>
      </div>
    </header>
  );
}

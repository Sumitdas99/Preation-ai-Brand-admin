import { cn } from "@/lib/utils";

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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
        "flex h-16 shrink-0 items-center gap-3 overflow-hidden bg-[#0A1F44] px-4 md:px-6 text-white shadow-sm",
        className,
      )}
    >
      <Link
        to="/dashboard"
        className="flex items-center justify-center text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg p-2 mr-1 shrink-0"
        title="Exit to Dashboard"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <span className="shrink-0 whitespace-nowrap font-display text-sm sm:text-lg font-semibold tracking-tight hidden sm:inline">
        Praetion <span className="text-[#7BB4E2]">AI</span>
      </span>

      <span className="h-5 w-px shrink-0 bg-white/20 hidden sm:inline" aria-hidden />

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

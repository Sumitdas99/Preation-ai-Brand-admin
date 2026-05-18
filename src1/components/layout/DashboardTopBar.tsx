const BAR =
  "sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 bg-[#0A1F44] px-6 text-white shadow-sm overflow-hidden";

const PILL =
  "shrink-0 whitespace-nowrap rounded-md border-[1.5px] border-white/40 bg-white/5 px-4 py-1.5 text-xs font-medium text-white";

interface DashboardTopBarProps {
  title: string;
  role?: string;
  workspace?: string;
}

export function DashboardTopBar({
  title,
  role,
  workspace,
}: DashboardTopBarProps) {
  return (
    <header className={BAR}>
      <span className="shrink-0 whitespace-nowrap font-display text-lg font-semibold tracking-tight">
        Praetion <span className="text-[#7BB4E2]">AI</span>
      </span>

      <span className="h-5 w-px shrink-0 bg-white/20" aria-hidden />

      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
        {title}
      </span>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {role && <span className={PILL}>{role}</span>}
        {workspace && <span className={PILL}>{workspace}</span>}
      </div>
    </header>
  );
}

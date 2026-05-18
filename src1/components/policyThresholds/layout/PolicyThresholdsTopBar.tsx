import { Fragment } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const BAR =
  "flex h-16 shrink-0 items-center gap-3 bg-[#0A1F44] px-4 text-white shadow-sm overflow-hidden sm:gap-4 sm:px-6";

const PILL =
  "shrink-0 whitespace-nowrap rounded-md border-[1.5px] border-white/40 bg-white/5 px-3 py-1.5 text-xs font-medium text-white sm:px-4";

interface Props {
  workspaceName: string;
  viewerRole: string;
  onMenuClick?: () => void;
}

export function PolicyThresholdsTopBar({
  workspaceName,
  viewerRole,
  onMenuClick,
}: Props) {
  const trail = ["Settings", "Policy Threshold Configuration"];
  const lastIndex = trail.length - 1;

  return (
    <header className={BAR}>
      {onMenuClick ? (
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white md:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        </button>
      ) : null}

      <span className="shrink-0 whitespace-nowrap font-display text-lg font-semibold tracking-tight">
        Praetion <span className="text-[#7BB4E2]">AI</span>
      </span>

      <span className="hidden h-5 w-px shrink-0 bg-white/20 sm:block" aria-hidden />

      <nav
        aria-label="Breadcrumb"
        className="hidden min-w-0 flex-1 items-center gap-2 text-sm text-white/70 sm:flex"
      >
        {trail.map((item, i) => {
          const isLast = i === lastIndex;
          return (
            <Fragment key={item}>
              {i > 0 && (
                <span
                  aria-hidden
                  className="hidden shrink-0 text-white/40 md:inline"
                >
                  →
                </span>
              )}
              <span
                className={cn(
                  isLast
                    ? "min-w-0 flex-1 truncate font-medium text-white"
                    : "hidden shrink-0 whitespace-nowrap md:inline",
                )}
              >
                {item}
              </span>
            </Fragment>
          );
        })}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <span className={cn(PILL, "hidden sm:inline-flex")}>{viewerRole}</span>
        <span className={PILL}>
          <span className="hidden sm:inline">Workspace: </span>
          {workspaceName}
        </span>
      </div>
    </header>
  );
}

import { Fragment } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TopBar as TopBarData } from "../types";
import { useViewerRole } from "../viewerRole";

const BAR =
  "flex h-16 shrink-0 items-center gap-3 bg-[#0A1F44] px-4 text-white shadow-sm overflow-hidden sm:gap-4 sm:px-6";

const PILL =
  "shrink-0 whitespace-nowrap rounded-md border-[1.5px] border-white/40 bg-white/5 px-4 py-1.5 text-xs font-medium text-white";

interface Props {
  data: TopBarData;
  onMenuClick?: () => void;
}

export function TopBar({ data, onMenuClick }: Props) {
  const { trail, workspace } = data;
  const viewerRole = useViewerRole();
  const lastIndex = trail.length - 1;

  return (
    <header className={BAR}>
      {onMenuClick ? (
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white md:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        </button>
      ) : null}
      <span className="shrink-0 whitespace-nowrap font-display text-lg font-semibold tracking-tight">
        Praetion <span className="text-[#7BB4E2]">AI</span>
      </span>

      <span className="h-5 w-px shrink-0 bg-white/20" aria-hidden />

      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-1 items-center gap-2 text-sm text-white/70"
      >
        {trail.map((item, i) => {
          const isLast = i === lastIndex;
          return (
            <Fragment key={i}>
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
        <span className={PILL}>{viewerRole}</span>
        <span className={PILL}>{workspace}</span>
      </div>
    </header>
  );
}

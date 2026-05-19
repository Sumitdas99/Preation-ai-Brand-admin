import { Fragment } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TopBar as TopBarData } from "../types";
import { useViewerRole } from "../viewerRole";

const BAR =
  "flex h-16 shrink-0 items-center gap-3 bg-[#0A1F44] px-4 md:px-6 text-white shadow-sm overflow-hidden";

const PILL =
  "shrink-0 whitespace-nowrap rounded-md border-[1.5px] border-white/40 bg-white/5 px-4 py-1.5 text-xs font-medium text-white";

interface Props {
  data: TopBarData;
}

export function TopBar({ data }: Props) {
  const { trail, workspace } = data;
  const viewerRole = useViewerRole();
  const lastIndex = trail.length - 1;

  return (
    <header className={BAR}>
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

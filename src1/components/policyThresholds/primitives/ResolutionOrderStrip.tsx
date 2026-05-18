import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type LayerId = "system-default" | "geo-preset" | "workspace-override";

interface LayerPill {
  id: LayerId;
  label: string;
  caption: string;
}

const LAYERS: LayerPill[] = [
  { id: "system-default", label: "System Default", caption: "" },
  { id: "geo-preset", label: "Geo Preset", caption: "" },
  { id: "workspace-override", label: "Workspace Override", caption: "" },
];

interface ResolutionOrderStripProps {
  active: LayerId;
  description?: string;
  className?: string;
}

export function ResolutionOrderStrip({
  active,
  description,
  className,
}: ResolutionOrderStripProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-foreground/80">
        Threshold resolution order
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {LAYERS.map((layer, index) => (
          <div key={layer.id} className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-md border border-border bg-[#FFFFFF] px-3 py-1.5 text-xs font-extrabold text-foreground/80",
              )}
            >
              <span>{layer.label}</span>
              {layer.caption ? (
                <span className="text-[10px] font-normal text-muted-foreground">
                  {layer.caption}
                </span>
              ) : null}
            </span>
            {index < LAYERS.length - 1 ? (
              <ChevronRight
                className="h-4 w-4 text-foreground/70"
                strokeWidth={2.75}
                aria-hidden
              />
            ) : null}
          </div>
        ))}
      </div>
      {description ? (
        <p className="text-xs font-bold leading-relaxed text-foreground/80">
          {description}
        </p>
      ) : null}
    </div>
  );
}

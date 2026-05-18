import { CheckCircle2, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
  EngineStatus,
  EngineStatusStrip,
  EngineTile,
  Engines,
} from "../types";

interface Props {
  data: Engines;
}

export function EngineStatusRow({ data }: Props) {
  return (
    <section className="border-b border-border px-6 py-5">
      <header className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {data.headerLabel ?? "Parallel Engine Status"}
        </h2>
      </header>

      {data.mode === "skeleton" ? (
        <SkeletonTiles />
      ) : (
        <Tiles tiles={data.tiles} />
      )}

      {data.bottomStrip && <BottomStrip strip={data.bottomStrip} />}
    </section>
  );
}

type ToneKey = "success" | "danger" | "progress" | "challenge" | "muted";

const STATUS_TONE: Record<EngineStatus, ToneKey> = {
  skeleton: "muted",
  "not-started": "muted",
  "in-progress": "progress",
  "action-required": "danger",
  "flagged-reviewed": "progress",
  clear: "success",
  locked: "success",
  "challenge-pending": "challenge",
  embedded: "success",
};

const TONE_STYLES: Record<
  ToneKey,
  { tile: string; title: string; dot: string; label: string }
> = {
  success: {
    tile: "border-emerald-200 bg-emerald-50/60",
    title: "text-emerald-900",
    dot: "bg-emerald-500",
    label: "text-emerald-700",
  },
  danger: {
    tile: "border-red-200 bg-red-50",
    title: "text-red-900/70",
    dot: "bg-red-500",
    label: "text-red-700",
  },
  progress: {
    tile: "border-amber-300 bg-amber-50",
    title: "text-amber-900/70",
    dot: "bg-amber-500",
    label: "text-amber-700",
  },
  challenge: {
    tile: "border-indigo-200 bg-indigo-50",
    title: "text-indigo-900/70",
    dot: "bg-indigo-500",
    label: "text-indigo-700",
  },
  muted: {
    tile: "border-border/70 bg-card",
    title: "text-muted-foreground",
    dot: "bg-muted-foreground/30",
    label: "text-muted-foreground",
  },
};

function Tiles({ tiles }: { tiles: EngineTile[] }) {
  return (
    <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
      {tiles.map((tile, i) => (
        <Tile key={i} tile={tile} />
      ))}
    </div>
  );
}

function Tile({ tile }: { tile: EngineTile }) {
  const tone = STATUS_TONE[tile.status];
  const styles = TONE_STYLES[tone];
  return (
    <div className={cn("min-w-0 rounded-md border p-4", styles.tile)}>
      <h3
        className={cn(
          "mb-2 text-sm font-bold uppercase leading-tight tracking-wider",
          styles.title,
        )}
      >
        {tile.name}
      </h3>
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn("h-2 w-2 shrink-0 rounded-full", styles.dot)}
          aria-hidden
        />
        <span className={cn("text-xs font-semibold", styles.label)}>
          {tile.statusLabel}
        </span>
      </div>
      {tile.enumValue && (
        <div
          className="truncate font-mono text-xs font-bold leading-snug text-muted-foreground"
          title={tile.enumValue}
        >
          {tile.enumValue}
        </div>
      )}
    </div>
  );
}

function BottomStrip({ strip }: { strip: EngineStatusStrip }) {
  const isSuccess = strip.tone === "success";
  const Icon = strip.icon === "check" ? CheckCircle2 : Info;
  return (
    <div
      className={cn(
        "mt-3 flex items-start gap-2.5 rounded-md border px-3.5 py-2.5",
        isSuccess
          ? "border-emerald-200 bg-emerald-50"
          : "border-indigo-200 bg-indigo-50",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          isSuccess ? "text-emerald-600" : "text-indigo-600",
        )}
        strokeWidth={2.75}
        aria-hidden
      />
      <span
        className={cn(
          "text-sm font-semibold leading-relaxed",
          isSuccess ? "text-emerald-900" : "text-indigo-900",
        )}
      >
        {strip.text}
      </span>
    </div>
  );
}

const TILE_DELAYS = [
  "[animation-delay:0ms]",
  "[animation-delay:200ms]",
  "[animation-delay:400ms]",
];

function SkeletonTiles() {
  return (
    <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
      {TILE_DELAYS.map((delay, i) => (
        <div
          key={i}
          className="rounded-md border border-border bg-card p-5"
        >
          <div className="space-y-3">
            <Skeleton className={cn("h-3 w-2/3 rounded-full", delay)} />
            <Skeleton className={cn("h-3 w-1/2 rounded-full", delay)} />
            <Skeleton className={cn("h-3 w-4/5 rounded-full", delay)} />
          </div>
        </div>
      ))}
    </div>
  );
}

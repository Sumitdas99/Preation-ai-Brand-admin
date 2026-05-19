import { AlertCircle, AlertTriangle, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type {
  DetectionPillTone,
  DetectionSummaryRowVM,
  RequirementAlertVM,
  RequirementGridCell,
} from "../types";

interface Props {
  data: RequirementAlertVM;
}

export function RequirementAlert({ data }: Props) {
  return (
    <section>
      <div className="overflow-hidden rounded-b-md bg-card shadow-sm [contain:layout_paint]">
        <div className="h-1 bg-red-700" aria-hidden />
        <div className="overflow-hidden rounded-b-md border-x-[0.75px] border-b-[0.75px] border-red-700">
        <header className="flex items-start gap-4 border-b-[1.25px] border-red-200 bg-red-50 px-6 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-700">
            <AlertTriangle className="h-5 w-5 text-white" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-medium leading-tight text-red-700">
                {data.title}
              </h2>
              <span className="shrink-0 rounded-md bg-red-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                {data.severityLabel}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-red-900">
              {data.body}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-[1.25px] bg-slate-300 sm:grid-cols-3">
          {data.grid.map((cell) => (
            <GridCell key={cell.key} cell={cell} />
          ))}
        </div>

        <div className="border-t-[1.25px] border-slate-300 bg-card">
          <div className="border-b-[1.25px] border-slate-300 bg-slate-50/60 px-6 py-2.5">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-600">
              {data.detectionSummary.header}
            </span>
          </div>
          <ul className="divide-y-[1.25px] divide-slate-300 pb-1">
            {data.detectionSummary.rows.map((row) => (
              <li key={row.key}>
                <DetectionRow row={row} />
              </li>
            ))}
          </ul>
        </div>
        </div>
      </div>
    </section>
  );
}

function GridCell({ cell }: { cell: RequirementGridCell }) {
  return (
    <div className="bg-card px-5 py-4">
      <div className="text-[13px] font-bold uppercase tracking-wider text-slate-500">
        {cell.label}
      </div>
      <div className="mt-2 min-h-[28px]">
        <CellContent cell={cell} />
      </div>
      {cell.sublabel ? (
        <p className="mt-2 text-xs leading-snug text-slate-500">
          {cell.sublabel}
        </p>
      ) : null}
    </div>
  );
}

function CellContent({ cell }: { cell: RequirementGridCell }) {
  if (cell.kind === "code-chip") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1">
        <AlertCircle className="h-3.5 w-3.5 text-red-600" strokeWidth={2.75} aria-hidden />
        <span className="font-mono text-xs font-semibold text-red-700">
          {cell.text}
        </span>
      </span>
    );
  }

  if (cell.kind === "text-emphasis") {
    return (
      <span className="text-base font-semibold text-red-700">{cell.text}</span>
    );
  }

  if (cell.kind === "link") {
    if (cell.href) {
      const isInternal = cell.href.startsWith("/");
      if (isInternal) {
        return (
          <Link
            to={cell.href}
            className="inline-flex items-center gap-1.5 text-base font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
          >
            {cell.text}
            <Pencil className="h-3.5 w-3.5" aria-hidden />
          </Link>
        );
      }
      return (
        <a
          href={cell.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-base font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
        >
          {cell.text}
          <Pencil className="h-3.5 w-3.5" aria-hidden />
        </a>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-base font-medium text-blue-700 underline underline-offset-2">
        {cell.text}
        <Pencil className="h-3.5 w-3.5" aria-hidden />
      </span>
    );
  }

  if (cell.kind === "chips") {
    if (!cell.chips.length) {
      return <span className="text-sm text-slate-400">—</span>;
    }
    return (
      <div className="flex flex-wrap gap-1.5">
        {cell.chips.map((c) => (
          <span
            key={c}
            className="rounded-sm bg-blue-100 px-2 py-0.5 text-[13px] font-bold text-blue-800"
          >
            {c}
          </span>
        ))}
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold",
        cell.tone === "danger" && "border-red-200 bg-red-50 text-red-700",
        cell.tone === "warning" &&
          "border-amber-200 bg-amber-50 text-amber-700",
        cell.tone === "info" && "border-blue-200 bg-blue-50 text-blue-700",
        cell.tone === "neutral" &&
          "border-slate-200 bg-slate-50 text-slate-700",
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          cell.tone === "danger" && "bg-red-600",
          cell.tone === "warning" && "bg-amber-500",
          cell.tone === "info" && "bg-blue-600",
          cell.tone === "neutral" && "bg-slate-500",
        )}
        aria-hidden
      />
      {cell.text}
    </span>
  );
}

function DetectionRow({ row }: { row: DetectionSummaryRowVM }) {
  const showBar = typeof row.score === "number";
  return (
    <div className="grid grid-cols-[180px_1fr_2.5rem_150px] items-center gap-4 px-6 py-3">
      <span className="text-sm font-semibold text-slate-700">{row.label}</span>

      <div className="flex min-w-0 items-center">
        {showBar ? (
          <div className="h-1 w-full max-w-[480px] overflow-hidden rounded-full bg-red-100">
            <div
              className="h-full bg-red-600"
              style={{
                width: `${Math.min(100, Math.round((row.score ?? 0) * 100))}%`,
              }}
            />
          </div>
        ) : null}
      </div>

      <span className="w-10 text-right text-sm font-semibold tabular-nums text-red-700">
        {row.scoreDisplay ?? ""}
      </span>

      <div className="flex w-[150px] justify-end">
        {row.pill ? (
          <DetectionPill label={row.pill.label} tone={row.pill.tone} />
        ) : null}
      </div>
    </div>
  );
}

function DetectionPill({
  label,
  tone,
}: {
  label: string;
  tone: DetectionPillTone;
}) {
  return (
    <span
      className={cn(
        "shrink-0 whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
        tone === "alert" && "bg-red-700 text-white",
        tone === "info" && "bg-blue-100 text-blue-700",
        tone === "muted" && "bg-red-50 text-red-700",
      )}
    >
      {label}
    </span>
  );
}

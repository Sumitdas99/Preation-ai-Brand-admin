import type { MetadataValidationCheck } from "@/api/schemas/proof";
import { cn } from "@/lib/utils";

interface Props {
  header: string;
  checks: MetadataValidationCheck[];
}

export function MetadataValidationCard({ header, checks }: Props) {
  return (
    <div className="rounded-md border border-border bg-card">
      <div className="border-b border-border px-4 py-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {header}
        </h4>
      </div>

      <ul className="divide-y divide-border">
        {checks.map((check) => (
          <CheckRow key={check.id} check={check} />
        ))}
      </ul>
    </div>
  );
}

function CheckRow({ check }: { check: MetadataValidationCheck }) {
  const tone = toneFor(check.status);
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <StatusIcon tone={tone} />
        <span className="text-sm font-semibold text-foreground">
          {check.label}
        </span>
      </div>
      {check.detail ? (
        <span
          className={cn(
            "shrink-0 whitespace-nowrap text-xs",
            tone === "pass" && "font-bold text-slate-600",
            tone === "fail" && "font-semibold text-red-700",
            tone === "pending" && "font-semibold text-muted-foreground",
            tone === "skipped" && "font-bold italic text-muted-foreground",
          )}
        >
          {check.detail}
        </span>
      ) : null}
    </li>
  );
}

type Tone = "pass" | "fail" | "pending" | "skipped";

function toneFor(status: MetadataValidationCheck["status"]): Tone {
  if (status === "PASS") return "pass";
  if (status === "FAIL") return "fail";
  if (status === "NOT_APPLICABLE") return "skipped";
  return "pending";
}

function StatusIcon({ tone }: { tone: Tone }) {
  if (tone === "pass") {
    return (
      <span
        aria-hidden
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white"
      >
        <Check />
      </span>
    );
  }
  if (tone === "fail") {
    return (
      <span
        aria-hidden
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-white"
      >
        <Cross />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground/40"
    />
  );
}

function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={12}
      height={12}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 13.5l5 5L21 5" />
    </svg>
  );
}

function Cross() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={12}
      height={12}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

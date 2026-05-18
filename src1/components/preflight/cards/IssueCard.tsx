import { cn } from "@/lib/utils";

export type IssueTone = "danger" | "warning";

interface Props {
  code: string;
  description: string;
  linkLabel: string;
  linkHref: string;
  tone: IssueTone;
}

const TONES: Record<IssueTone, { container: string; code: string }> = {
  danger: {
    container: "border-l-4 border-l-red-600 bg-red-50",
    code: "text-red-900",
  },
  warning: {
    container: "border-l-4 border-l-amber-600 bg-amber-50",
    code: "text-amber-900",
  },
};

export function IssueCard({
  code,
  description,
  linkLabel,
  linkHref,
  tone,
}: Props) {
  const t = TONES[tone];
  return (
    <div className={cn("rounded-r-md p-4", t.container)}>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <code
          className={cn(
            "min-w-0 max-w-full truncate font-mono text-sm font-bold uppercase tracking-wider",
            t.code,
          )}
          title={code}
        >
          {code}
        </code>
        <a
          href={linkHref}
          className="shrink-0 text-xs font-semibold text-blue-600 hover:underline"
        >
          {linkLabel}
        </a>
      </div>
      <p className="text-sm font-medium leading-relaxed text-foreground/90">
        {description}
      </p>
    </div>
  );
}

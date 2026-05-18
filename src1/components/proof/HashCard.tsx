interface Props {
  header: string;
  hint: string;
  hash?: string;
  pending?: boolean;
}

export function HashCard({ header, hint, hash, pending }: Props) {
  const display = hash ? stripPrefix(hash) : pending ? "computing…" : "—";
  return (
    <div className="flex items-start gap-3 rounded-md border border-emerald-400 bg-emerald-50 px-4 py-3">
      <span
        aria-hidden
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white"
      >
        <CheckGlyph />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900">
          {header}
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <code
            className="truncate font-mono text-sm font-bold text-emerald-700"
            title={hash}
          >
            {display}
          </code>
          <span className="text-[12px] font-bold text-emerald-900/80">
            {hint}
          </span>
        </div>
      </div>
    </div>
  );
}

function CheckGlyph() {
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

function stripPrefix(hash: string): string {
  return hash.startsWith("sha256:") ? hash.slice(7) : hash;
}

import type { ComplianceChecksList } from "../types";

interface Props {
  data: ComplianceChecksList;
}

export function ComplianceChecksCard({ data }: Props) {
  return (
    <section className="px-6 py-5">
      <header className="mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {data.header}
        </h2>
      </header>

      <div className="space-y-2.5">
        {data.items.map((item) => (
          <div
            key={item.title}
            className="rounded-r-md border-l-4 border-l-emerald-600 bg-emerald-50 p-4"
          >
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"
                aria-hidden
              >
                <AcuteCheck />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold text-emerald-900 [font-family:Arial,Helvetica,sans-serif]">
                  {item.title}
                </div>
                <p className="mt-1 text-[13px] font-semibold leading-relaxed text-foreground/80">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AcuteCheck() {
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

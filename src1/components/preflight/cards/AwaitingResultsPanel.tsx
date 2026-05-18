import { Loader2 } from "lucide-react";

interface Props {
  title: string;
  description: string;
}

export function AwaitingResultsPanel({ title, description }: Props) {
  return (
    <div className="rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted px-6 py-10">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-2 text-center">
        <Loader2
          className="mb-2 h-6 w-6 animate-spin text-muted-foreground"
          aria-hidden
        />
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <p className="text-sm font-semibold leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

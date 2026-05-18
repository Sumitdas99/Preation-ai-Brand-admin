import { Ban, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface C2paEmbeddingCardProps {
  pendingValue: boolean;
  onChange: (next: boolean) => void;
}

export function C2paEmbeddingCard({
  pendingValue,
  onChange,
}: C2paEmbeddingCardProps) {
  return (
    <Card className="overflow-hidden">
      <header className="flex items-start justify-between gap-4 border-b bg-muted/30 px-5 py-4">
        <h2 className="text-xl font-[550] text-slate-700">
          C2PA Embedding Behavior
        </h2>
      </header>

      <div className="space-y-5 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4 sm:gap-6">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-[550] text-slate-700">
              Embed C2PA provenance on human-generated assets
            </h3>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-foreground/75">
              When enabled, all reviewed assets receive a C2PA provenance
              record, including assets assessed as human-generated. When
              disabled, provenance embedding is limited to assets assessed as
              AI-generated.
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Recommended setting: enabled
            </p>
          </div>
          <div className="flex w-14 shrink-0 flex-col items-end gap-1.5">
            <Switch
              checked={pendingValue}
              onCheckedChange={onChange}
              aria-label="Embed C2PA provenance on human-generated assets"
            />
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wide",
                pendingValue ? "text-[#0A1F44]" : "text-muted-foreground",
              )}
            >
              {pendingValue ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ExplainerPanel
            tone="positive"
            active={pendingValue}
            onSelect={() => onChange(true)}
            icon={<Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
            title="Enabled by default"
            body="Every reviewed asset carries provenance metadata in the Evidence Pack. This provides the strongest audit trail and is recommended for EU AI Act compliance."
          />
          <ExplainerPanel
            tone="muted"
            active={!pendingValue}
            onSelect={() => onChange(false)}
            icon={<Ban className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
            title="Disabled"
            body="Human-generated assets will not receive embedded provenance metadata. Evidence Packs will show provenance as absent for those assets. This is not recommended for EU market publishing."
          />
        </div>
      </div>
    </Card>
  );
}

function ExplainerPanel({
  tone,
  active,
  onSelect,
  icon,
  title,
  body,
}: {
  tone: "positive" | "muted";
  active: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const toneActive =
    tone === "positive"
      ? "bg-[#0A1F44] text-white"
      : "bg-[#0A1F44] text-white";
  const toneInactive = "bg-muted/30";
  const iconActive =
    tone === "positive"
      ? "bg-white/15 text-white"
      : "bg-white/15 text-white";
  const iconInactive = "bg-muted text-muted-foreground";
  const titleActive =
    tone === "positive" ? "text-white" : "text-white";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onSelect}
      className={cn(
        "rounded-lg p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active ? toneActive : toneInactive,
        !active && "opacity-90 hover:bg-muted/50",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "grid h-5 w-5 place-items-center rounded-full",
            active ? iconActive : iconInactive,
          )}
        >
          {icon}
        </span>
        <span
          className={cn(
            "text-base",
            active ? "font-semibold" : "font-bold",
            active ? titleActive : "text-foreground/80",
          )}
        >
          {title}
        </span>
      </div>
      <p
        className={cn(
          "mt-2 text-xs leading-relaxed",
          active ? "font-semibold text-white/85" : "font-bold text-foreground/70",
        )}
      >
        {body}
      </p>
    </button>
  );
}

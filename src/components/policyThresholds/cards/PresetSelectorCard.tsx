import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import type {
  GeoPresetId,
  PolicyPreset,
} from "@/api/schemas/policyThresholds";
import { PresetCard } from "../primitives/PresetCard";

interface PresetSelectorCardProps {
  presets: PolicyPreset[];
  pendingPresetId: GeoPresetId;
  activePresetId: GeoPresetId;
  onSelect: (presetId: GeoPresetId) => void;
  intro?: ReactNode;
}

export function PresetSelectorCard({
  presets,
  pendingPresetId,
  activePresetId,
  onSelect,
  intro,
}: PresetSelectorCardProps) {
  const pendingLabel =
    presets.find((p) => p.preset_id === pendingPresetId)?.label ?? pendingPresetId;

  return (
    <Card className="overflow-hidden">
      <header className="flex items-center justify-between gap-3 border-b bg-muted/30 px-5 py-4">
        <h2 className="min-w-0 flex-1 text-xl font-[550] text-slate-700">
          Select Active Geo Preset
        </h2>
        <p className="shrink-0 text-right text-xs font-bold uppercase leading-tight tracking-wide text-foreground/70">
          Selected:{" "}
          <span className="text-xs font-bold uppercase text-[#0A1F44]">
            {pendingLabel}
          </span>
        </p>
      </header>
      {intro ? (
        <div className="px-4 py-4 sm:px-5">
          <div className="rounded-lg bg-muted/40 px-4 py-4 sm:px-5">
            {intro}
          </div>
        </div>
      ) : null}
      <div
        role="radiogroup"
        aria-label="Active geo preset"
        className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5"
      >
        {presets.map((preset) => (
          <PresetCard
            key={preset.preset_id}
            presetId={preset.preset_id}
            label={preset.label}
            description={preset.description}
            selected={pendingPresetId === preset.preset_id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </Card>
  );
}

import type { AssetContextStripView } from "./types";

interface Props {
  data: AssetContextStripView;
}

export function AssetContextStrip({ data }: Props) {
  const fields: Array<{ label: string; value: string }> = [];

  fields.push({ label: "Asset", value: data.assetLabel });

  if (data.modalityLabel || data.durationLabel) {
    fields.push({
      label: "Modality",
      value: [data.modalityLabel, data.durationLabel]
        .filter(Boolean)
        .join(" · "),
    });
  }
  if (data.geoLabel) fields.push({ label: "Geo context", value: data.geoLabel });
  if (data.geoPresetLabel)
    fields.push({ label: "Active geo preset", value: data.geoPresetLabel });
  if (data.policyPackLabel)
    fields.push({ label: "Policy pack", value: data.policyPackLabel });
  if (data.evaluatedAtLabel)
    fields.push({ label: "Evaluated at", value: data.evaluatedAtLabel });

  return (
    <section className="rounded-md border border-border bg-white">
      <dl className="m-0 grid gap-x-6 gap-y-2 px-4 py-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] sm:gap-x-8 sm:px-6">
        {fields.map((field) => (
          <div
            key={field.label}
            className="flex min-w-0 items-baseline gap-x-2"
          >
            <dt className="shrink-0 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {field.label}
            </dt>
            <dd
              className="min-w-0 truncate text-sm font-semibold tracking-tight text-foreground"
              title={field.value}
            >
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

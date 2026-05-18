import { ActionsSection } from "../actions/ActionsSection";
import { IssueCard } from "../cards/IssueCard";
import { VerdictPill } from "../primitives/VerdictPill";
import type { Advisory, PreFlightData } from "../types";

interface Props {
  data: PreFlightData;
}

export function AllowWithWarningsBottom({ data }: Props) {
  if (data.verdict.kind !== "advisories") return null;

  return (
    <section className="space-y-6 px-6 py-5">
      <VerdictPill
        tone="warning"
        label={data.verdict.pillLabel}
        note={data.verdict.pillNote}
      />

      <AdvisoriesList
        header={data.verdict.listHeader}
        items={data.verdict.advisories}
      />

      {data.actionSections.map((section, i) => (
        <ActionsSection key={i} title={section.title} items={section.items} />
      ))}
    </section>
  );
}

function AdvisoriesList({
  header,
  items,
}: {
  header: string;
  items: Advisory[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {header}
      </h3>
      <div className="space-y-2.5">
        {items.map((a) => (
          <IssueCard
            key={a.code}
            code={a.code}
            description={a.description}
            linkLabel={a.linkLabel}
            linkHref={a.linkHref}
            tone="warning"
          />
        ))}
      </div>
    </div>
  );
}

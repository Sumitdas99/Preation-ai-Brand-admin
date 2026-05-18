import { usePreFlightActions } from "@/features/preflight/actions/PreFlightActionsContext";
import { ActionsSection } from "../actions/ActionsSection";
import type { ActionExpansion } from "../actions/ActionsSection";
import { IssueCard } from "../cards/IssueCard";
import { ChallengePanel } from "../challenge/ChallengePanel";
import { VerdictPill } from "../primitives/VerdictPill";
import type { PreFlightData, Violation } from "../types";

interface Props {
  data: PreFlightData;
}

export function BlockBottom({ data }: Props) {
  const { challengePanelExpanded } = usePreFlightActions();

  if (data.verdict.kind !== "violations") return null;

  const challengeExpansion: ActionExpansion | undefined = data.challengePanel
    ? {
        itemId: "challenge-detection",
        expanded: challengePanelExpanded,
        content: <ChallengePanel data={data.challengePanel} />,
      }
    : undefined;

  return (
    <section className="space-y-6 px-6 py-5">
      <VerdictPill
        tone="block"
        label={data.verdict.pillLabel}
        note={data.verdict.pillNote}
      />

      <ViolationsList
        header={data.verdict.listHeader}
        items={data.verdict.violations}
      />

      {data.actionSections.map((section, i) => {
        const ownsChallenge = section.items.some(
          (it) => it.id === "challenge-detection",
        );
        return (
          <ActionsSection
            key={i}
            title={section.title}
            items={section.items}
            expansion={ownsChallenge ? challengeExpansion : undefined}
          />
        );
      })}
    </section>
  );
}

function ViolationsList({
  header,
  items,
}: {
  header: string;
  items: Violation[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {header}
      </h3>
      <div className="space-y-2.5">
        {items.map((v) => (
          <IssueCard
            key={v.code}
            code={v.code}
            description={v.description}
            linkLabel={v.linkLabel}
            linkHref={v.linkHref}
            tone="danger"
          />
        ))}
      </div>
    </div>
  );
}

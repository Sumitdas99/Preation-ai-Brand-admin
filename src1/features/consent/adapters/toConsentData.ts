import type { ConsentSpec } from "@/api/schemas/consent";
import type { ConsentPageData } from "@/components/consent/types";
import { toBriefing } from "./sections/toBriefing";
import { toHumanPresenceSection } from "./sections/toHumanPresenceSection";
import { toRplSection } from "./sections/toRplSection";
import { toTopBar } from "./sections/toTopBar";

interface Args {
  spec: ConsentSpec;
  role: "Reviewer" | "Legal";
}

export function toConsentData({ spec, role }: Args): ConsentPageData {
  return {
    topBar: toTopBar({ spec, role }),
    briefing: toBriefing(spec),
    rpl: toRplSection(spec),
    humanPresence: toHumanPresenceSection(spec),
    organisationName: spec.organisation_name ?? "[Organisation Name]",
    candidates: spec.rpl_section?.rpl_identities_snapshot ?? [],
  };
}

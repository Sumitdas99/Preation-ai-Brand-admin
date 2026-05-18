import type {
  ApprovalPriority,
  ApprovalState,
} from "@/api/schemas/approvals";
import type { LegalRowStatusTone } from "@/components/legalReview/types";

const AMBER_THRESHOLD_MIN = 480;
const RED_THRESHOLD_MIN = 1440;

export function formatAge(minutes: number | undefined): string | undefined {
  if (minutes == null || Number.isNaN(minutes)) return undefined;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins.toString().padStart(2, "0")}m`;
}

export function ageTone(
  minutes: number | undefined,
): "neutral" | "amber" | "red" {
  if (minutes == null) return "neutral";
  if (minutes >= RED_THRESHOLD_MIN) return "red";
  if (minutes >= AMBER_THRESHOLD_MIN) return "amber";
  return "neutral";
}

export function ageCaption(
  minutes: number | undefined,
  priority: ApprovalPriority | undefined,
): string | undefined {
  if (minutes == null) return undefined;
  if (minutes >= RED_THRESHOLD_MIN) {
    return priority === 1
      ? "Overdue escalated to admin"
      : "Overdue";
  }
  if (minutes >= AMBER_THRESHOLD_MIN) return "Approaching deadline";
  return undefined;
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function isSameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function formatSubmittedAt(
  iso: string | undefined,
  now: Date = new Date(),
): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  const time = `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
  if (isSameUtcDay(d, now)) return `Today ${time}`;
  return `${d.getUTCDate()} ${MONTH_SHORT[d.getUTCMonth()]} ${time}`;
}

export function formatResolvedAt(
  iso: string | undefined,
  now: Date = new Date(),
): string | undefined {
  return formatSubmittedAt(iso, now);
}

export function shortApprovalId(approvalId: string): string {
  if (approvalId.length <= 12) return approvalId;
  const head = approvalId.slice(0, 7);
  const tail = approvalId.slice(-3);
  return `${head}...${tail}`;
}

const VERDICT_LABELS: Record<string, string> = {
  ALLOW: "ALLOW",
  ALLOW_WITH_WARNINGS: "ALLOW_WITH_WARNINGS",
  BLOCK_UNTIL_REMEDIATED: "BLOCK_UNTIL_REMEDIATED",
  BLOCK_NON_OVERRIDABLE: "BLOCK_NON_OVERRIDABLE",
};

export function policyVerdictLabel(
  verdict: string | undefined,
): string | undefined {
  if (!verdict) return undefined;
  return VERDICT_LABELS[verdict] ?? verdict;
}

export type StatusBadgeView = {
  label: string;
  tone: LegalRowStatusTone;
  subline?: string;
};

export function statusBadgeForReviewedRow(
  state: ApprovalState,
  isForcePass: boolean | undefined,
  role: "Legal" | "Reviewer",
): StatusBadgeView {
  switch (state) {
    case "APPROVED_PENDING_PROOF":
      return role === "Legal"
        ? { label: "Awaiting proof", tone: "amber" }
        : {
            label: "Legal approved",
            tone: "amber",
            subline: "upload proof",
          };
    case "APPROVED":
      return role === "Legal"
        ? { label: "Approved", tone: "green" }
        : {
            label: "Approved",
            tone: "green",
            subline: "publish cleared",
          };
    case "OVERRIDE_APPROVED":
    case "FORCE_PASSED":
      return {
        label: isForcePass ? "Override approved" : "Approved",
        tone: "red",
      };
    case "REJECTED":
    case "REJECTED_BACK_TO_REVIEWER":
      return role === "Legal"
        ? { label: "Rejected", tone: "red" }
        : { label: "Rejected — action required", tone: "red" };
    case "UNDER_REVIEW":
    case "PENDING_REVIEW":
    case "SUBMITTED_FOR_APPROVAL":
      return role === "Reviewer"
        ? { label: "Hard block escalated to Legal", tone: "red" }
        : { label: "Under review", tone: "neutral" };
    default:
      return { label: state, tone: "neutral" };
  }
}

export function verdictTone(
  verdict: string | undefined,
): "red" | "amber" | "green" | "neutral" {
  if (verdict === "BLOCK_NON_OVERRIDABLE") return "red";
  if (verdict === "BLOCK_UNTIL_REMEDIATED") return "amber";
  if (verdict === "ALLOW_WITH_WARNINGS") return "amber";
  if (verdict === "ALLOW") return "green";
  return "neutral";
}

export function actionChipsFromSummary(
  action_summary: string | undefined,
): string[] {
  return action_summary ? [action_summary] : [];
}

export function greetingPrefix(now: Date = new Date()): string {
  const h = now.getUTCHours();
  if (h < 5) return "Good evening";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const LONG_MONTH = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatLongDate(now: Date = new Date()): string {
  const day = now.getUTCDate();
  const year = now.getUTCFullYear();
  return `${day} ${LONG_MONTH[now.getUTCMonth()]} ${year}`;
}

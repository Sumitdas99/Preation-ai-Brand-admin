import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import {
  BILLING_SCENARIO_IDS,
  useBillingScenario,
  setBillingScenario,
  type BillingScenarioId,
} from "@/api/billingScenario";
import { USE_MSW } from "@/lib/env";
import { cn } from "@/lib/utils";
import { getDevRole, setDevRole, subscribeDevRole, type DevRole } from "./devRole";
import { getDevShowCardOnFile, setDevShowCardOnFile, subscribeDevShowCardOnFile } from "./devCardOnFile";

const SCENARIO_LABELS: Record<BillingScenarioId, string> = {
  default: "Default",
  "welcome-payment-required": "Welcome · Payment required",
  "welcome-activate": "Welcome · Activate",
  "trial-active": "Trial active",
  "paid-active": "Paid active",
  "paid-overage": "Paid · Overage",
  "past-due": "Past due",
  suspended: "Suspended",
};

const ROLE_OPTIONS: { id: DevRole; label: string }[] = [
  { id: "brand-admin", label: "Brand Admin" },
  { id: "super-admin", label: "Super Admin" },
];

export interface StateGroupVariant {
  id: BillingScenarioId;
  label: string;
  showCardOnFile?: boolean;
}

export interface StateGroup {
  key: string;
  variants: StateGroupVariant[];
}

export const BILLING_STATE_GROUPS: StateGroup[] = [
  {
    key: "A",
    variants: [
      { id: "welcome-payment-required", label: "Payment" },
      { id: "welcome-activate", label: "Activate" },
    ],
  },
  {
    key: "B",
    variants: [
      { id: "trial-active", label: "Trial active", showCardOnFile: true },
    ],
  },
  {
    key: "C",
    variants: [
      { id: "paid-overage", label: "Paid · Overage", showCardOnFile: true },
    ],
  },
  {
    key: "D",
    variants: [
      { id: "past-due", label: "Past due" },
      { id: "suspended", label: "Suspended" },
    ],
  },
];

const COLLAPSED_KEY = "praetion.devBillingPanel.collapsed";
const POSITION_KEY = "praetion.devBillingPanel.position";
const DRAG_THRESHOLD_PX = 4;

interface Position {
  x: number;
  y: number;
}

function readCollapsed(): boolean {
  try {
    const v = localStorage.getItem(COLLAPSED_KEY);
    return v === null ? true : v === "true";
  } catch {
    return true;
  }
}

function readPosition(): Position | null {
  try {
    const raw = localStorage.getItem(POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Position;
    if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function findGroupForScenario(
  groups: StateGroup[],
  scenario: BillingScenarioId,
  cardOnFile: boolean,
): { groupIdx: number; variantIdx: number } {
  for (let g = 0; g < groups.length; g++) {
    const exact = groups[g].variants.findIndex(
      (v) => v.id === scenario && v.showCardOnFile === cardOnFile,
    );
    if (exact !== -1) return { groupIdx: g, variantIdx: exact };
    const loose = groups[g].variants.findIndex((v) => v.id === scenario);
    if (loose !== -1) return { groupIdx: g, variantIdx: loose };
  }
  return { groupIdx: 0, variantIdx: 0 };
}

interface Props {
  scenarioIds?: BillingScenarioId[];
  stateGroups?: StateGroup[];
  showRoleToggle?: boolean;
}

export function DevBillingPanel({
  scenarioIds,
  stateGroups,
  showRoleToggle = false,
}: Props = {}) {
  const scenario = useBillingScenario();
  const [role, setRoleState] = useState<DevRole>(() => getDevRole());
  const [showCard, setShowCard] = useState<boolean>(() => getDevShowCardOnFile());
  const [collapsed, setCollapsed] = useState<boolean>(() => readCollapsed());
  const [position, setPosition] = useState<Position | null>(() => readPosition());
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    originX: number;
    originY: number;
    startLeft: number;
    startTop: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => subscribeDevRole(setRoleState), []);
  useEffect(() => subscribeDevShowCardOnFile(setShowCard), []);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, String(collapsed));
    } catch { void 0; }
  }, [collapsed]);

  useEffect(() => {
    if (!position) return;
    try {
      localStorage.setItem(POSITION_KEY, JSON.stringify(position));
    } catch { void 0; }
  }, [position]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      dragStateRef.current = {
        pointerId: event.pointerId,
        originX: event.clientX,
        originY: event.clientY,
        startLeft: rect.left,
        startTop: rect.top,
        moved: false,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const dx = event.clientX - drag.originX;
      const dy = event.clientY - drag.originY;
      if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      drag.moved = true;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nextX = clamp(
        drag.startLeft + dx,
        8,
        window.innerWidth - rect.width - 8,
      );
      const nextY = clamp(
        drag.startTop + dy,
        8,
        window.innerHeight - rect.height - 8,
      );
      setPosition({ x: nextX, y: nextY });
    },
    [],
  );

  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const wasDrag = drag.moved;
      dragStateRef.current = null;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch { void 0; }
      if (!wasDrag) {
        setCollapsed((c) => !c);
      }
    },
    [],
  );

  const containerStyle: CSSProperties = position
    ? { left: position.x, top: position.y, right: "auto", bottom: "auto" }
    : { right: 16, bottom: 16 };

  if (!USE_MSW) return null;

  if (collapsed) {
    return (
      <div ref={containerRef} style={containerStyle} className="fixed z-50">
        <button
          type="button"
          aria-label="Open billing dev panel"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="flex h-10 w-10 cursor-grab touch-none items-center justify-center rounded-full border border-white/10 bg-[#0f1d3b] text-white shadow-lg active:cursor-grabbing"
        >
          <FlaskConical className="h-4 w-4 text-white/80" aria-hidden />
        </button>
      </div>
    );
  }

  const dragHandle = (
    <button
      type="button"
      aria-label="Drag billing dev panel or click to collapse"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="flex h-7 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white active:cursor-grabbing"
    >
      <FlaskConical className="h-4 w-4" aria-hidden />
    </button>
  );

  if (stateGroups) {
    const { groupIdx, variantIdx } = findGroupForScenario(stateGroups, scenario, showCard);
    const activeGroup = stateGroups[groupIdx];
    const totalGroups = stateGroups.length;

    const selectVariant = (v: StateGroupVariant) => {
      setBillingScenario(v.id);
      if (v.showCardOnFile !== undefined) setDevShowCardOnFile(v.showCardOnFile);
    };

    const selectGroup = (idx: number) => {
      selectVariant(stateGroups[idx].variants[0]);
    };
    const prevGroup = () =>
      selectGroup((groupIdx - 1 + totalGroups) % totalGroups);
    const nextGroup = () =>
      selectGroup((groupIdx + 1) % totalGroups);

    return (
      <div
        ref={containerRef}
        style={containerStyle}
        className="fixed z-50 flex items-center gap-3 rounded-full border border-white/10 bg-[#0f1d3b] px-3 py-2 text-white shadow-lg"
      >
        {dragHandle}

        <button
          type="button"
          onClick={prevGroup}
          aria-label="Previous state"
          className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {stateGroups.map((g, i) => (
            <button
              key={g.key}
              type="button"
              onClick={() => selectGroup(i)}
              aria-label={`State ${g.key}`}
              aria-current={i === groupIdx}
              className={cn(
                "h-2 w-2 rounded-full transition",
                i === groupIdx ? "bg-white" : "bg-white/30 hover:bg-white/60",
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={nextGroup}
          aria-label="Next state"
          className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="ml-1 flex min-w-[5rem] flex-col border-l border-white/10 pl-3 leading-tight">
          <span className="text-[10px] uppercase tracking-wider text-white/50">
            State {activeGroup.key}
          </span>
          <span className="text-xs font-medium">
            {activeGroup.variants[variantIdx]?.label ?? activeGroup.variants[0].label}
          </span>
        </div>

        {activeGroup.variants.length > 1 && (
          <div
            className="flex items-stretch overflow-hidden rounded-full border border-white/15 bg-white/5"
            role="radiogroup"
            aria-label={`State ${activeGroup.key} variant`}
          >
            {activeGroup.variants.map((v, i) => {
              const active = i === variantIdx;
              return (
                <button
                  key={`${v.id}-${i}`}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => selectVariant(v)}
                  className={cn(
                    "px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition",
                    active
                      ? "bg-white text-[#0f1d3b]"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const ids = scenarioIds ?? BILLING_SCENARIO_IDS;
  const total = ids.length;
  const index = Math.max(0, ids.indexOf(scenario));

  const prev = () => setBillingScenario(ids[(index - 1 + total) % total]);
  const next = () => setBillingScenario(ids[(index + 1) % total]);

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className="fixed z-50 flex items-center gap-3 rounded-full border border-white/10 bg-[#0f1d3b] px-3 py-2 text-white shadow-lg"
    >
      {dragHandle}

      <button
        type="button"
        onClick={prev}
        aria-label="Previous billing scenario"
        className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1.5">
        {ids.map((id, i) => (
          <button
            key={id}
            type="button"
            onClick={() => setBillingScenario(id)}
            aria-label={SCENARIO_LABELS[id]}
            aria-current={i === index}
            className={cn(
              "h-2 w-2 rounded-full transition",
              i === index ? "bg-white" : "bg-white/30 hover:bg-white/60",
            )}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={next}
        aria-label="Next billing scenario"
        className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="ml-1 flex min-w-[11rem] flex-col border-l border-white/10 pl-3 leading-tight">
        <span className="text-[10px] uppercase tracking-wider text-white/50">
          Billing · {index + 1} / {total}
        </span>
        <span className="text-xs font-medium">{SCENARIO_LABELS[scenario]}</span>
      </div>

      {showRoleToggle && (
        <div
          className="flex items-stretch overflow-hidden rounded-full border border-white/15 bg-white/5"
          role="radiogroup"
          aria-label="Dev role"
        >
          {ROLE_OPTIONS.map((option) => {
            const active = role === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setDevRole(option.id)}
                className={cn(
                  "px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition",
                  active
                    ? "bg-white text-[#0f1d3b]"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

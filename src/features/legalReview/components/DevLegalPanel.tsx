import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import { USE_MSW } from "@/lib/env";
import {
  LEGAL_SCENARIO_IDS,
  getLegalScenario,
  setLegalScenario,
  subscribeLegalScenario,
  type LegalReviewScenarioId,
} from "@/api/legalScenario";
import { cn } from "@/lib/utils";
import type { ViewerRole } from "@/components/preflight/viewerRole";

const COLLAPSED_KEY = "praetion.devLegalPanel.collapsed";
const POSITION_KEY = "praetion.devLegalPanel.position";
const DRAG_THRESHOLD_PX = 4;

const SCENARIO_LABELS: Record<LegalReviewScenarioId, string> = {
  "under-review-state-a": "State A — Items pending",
  "under-review-state-b": "State B — Ready to attest",
  "under-review-clean": "Clean — Standard attestation",
  "post-attestation-success": "Post-attestation success",
  "hard-block-escalation": "Hard block escalation",
};

const ROLE_OPTIONS: ViewerRole[] = ["Reviewer", "Legal"];

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

interface Props {
  role: ViewerRole;
  onRoleChange: (next: ViewerRole) => void;
  canSwitchRole?: boolean;
}

export function DevLegalPanel({
  role,
  onRoleChange,
  canSwitchRole = true,
}: Props) {
  const [scenario, setScenario] = useState<LegalReviewScenarioId>(() =>
    getLegalScenario(),
  );
  const [collapsed, setCollapsed] = useState<boolean>(() => readCollapsed());
  const [position, setPosition] = useState<Position | null>(() =>
    readPosition(),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    originX: number;
    originY: number;
    startLeft: number;
    startTop: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => subscribeLegalScenario(setScenario), []);

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

  useEffect(() => {
    if (!position) return;
    const onResize = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPosition((prev) => {
        if (!prev) return prev;
        return {
          x: clamp(prev.x, 8, window.innerWidth - rect.width - 8),
          y: clamp(prev.y, 8, window.innerHeight - rect.height - 8),
        };
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [position]);

  const ids = LEGAL_SCENARIO_IDS;
  const total = ids.length;
  const index = Math.max(0, ids.indexOf(scenario));

  const change = (next: LegalReviewScenarioId) => setLegalScenario(next);
  const prev = () => change(ids[(index - 1 + total) % total]);
  const next = () => change(ids[(index + 1) % total]);

  const onHandlePointerDown = useCallback(
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

  const onHandlePointerMove = useCallback(
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
      setPosition({
        x: clamp(drag.startLeft + dx, 8, window.innerWidth - rect.width - 8),
        y: clamp(drag.startTop + dy, 8, window.innerHeight - rect.height - 8),
      });
    },
    [],
  );

  const onHandlePointerUp = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const wasDrag = drag.moved;
      dragStateRef.current = null;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch { void 0; }
      if (!wasDrag) setCollapsed((c) => !c);
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
          aria-label="Open legal dev panel"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
          className="flex h-10 w-10 cursor-grab touch-none items-center justify-center rounded-full border border-white/10 bg-[#0f1d3b] text-white shadow-lg active:cursor-grabbing"
        >
          <FlaskConical className="h-4 w-4 text-white/80" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className="fixed z-50 flex items-center gap-3 rounded-full border border-white/10 bg-[#0f1d3b] px-3 py-2 text-white shadow-lg"
    >
      <button
        type="button"
        aria-label="Drag legal dev panel or click to collapse"
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        onPointerCancel={onHandlePointerUp}
        className="flex h-7 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white active:cursor-grabbing"
      >
        <FlaskConical className="h-4 w-4" aria-hidden />
      </button>

      <button
        type="button"
        onClick={prev}
        aria-label="Previous scenario"
        className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1.5">
        {ids.map((id, i) => (
          <button
            key={id}
            type="button"
            onClick={() => change(id)}
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
        aria-label="Next scenario"
        className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="ml-1 flex min-w-[14rem] flex-col border-l border-white/10 pl-3 leading-tight">
        <span className="text-[10px] uppercase tracking-wider text-white/50">
          Legal · {index + 1} / {total}
        </span>
        <span className="text-xs font-medium">
          {SCENARIO_LABELS[scenario]}
        </span>
      </div>

      {canSwitchRole && (
        <div
          className="flex items-stretch overflow-hidden rounded-full border border-white/15 bg-white/5"
          role="radiogroup"
          aria-label="Viewer role"
        >
          {ROLE_OPTIONS.map((option) => {
            const active = role === option;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onRoleChange(option)}
                className={cn(
                  "px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition",
                  active
                    ? "bg-white text-[#0f1d3b]"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

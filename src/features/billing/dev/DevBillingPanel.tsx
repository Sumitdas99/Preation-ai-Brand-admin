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
  getBillingScenario,
  setBillingScenario,
  subscribeBillingScenario,
  type BillingScenarioId,
} from "@/api/billingScenario";
import { USE_MSW } from "@/lib/env";
import { cn } from "@/lib/utils";

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

export function DevBillingPanel() {
  const [scenario, setScenarioState] = useState<BillingScenarioId>(() =>
    getBillingScenario(),
  );
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

  useEffect(() => subscribeBillingScenario(setScenarioState), []);

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

  const ids = BILLING_SCENARIO_IDS;
  const total = ids.length;
  const index = Math.max(0, ids.indexOf(scenario));

  const handleChange = (next: BillingScenarioId) => {
    setBillingScenario(next);
  };

  const prev = () => handleChange(ids[(index - 1 + total) % total]);
  const next = () => handleChange(ids[(index + 1) % total]);

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

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className="fixed z-50 flex items-center gap-3 rounded-full border border-white/10 bg-[#0f1d3b] px-3 py-2 text-white shadow-lg"
    >
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
            onClick={() => handleChange(id)}
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
    </div>
  );
}

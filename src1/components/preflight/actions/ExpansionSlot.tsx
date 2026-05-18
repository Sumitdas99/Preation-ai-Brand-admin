import * as Collapsible from "@radix-ui/react-collapsible";
import { useEffect, useRef } from "react";

export interface ActionExpansion {
  itemId: string;
  expanded: boolean;
  content: React.ReactNode;
}

interface ExpansionSlotProps {
  expanded: boolean;
  children: React.ReactNode;
}

const ANIMATION_MS = 250;
const SCROLL_MARGIN = 24;

export function ExpansionSlot({ expanded, children }: ExpansionSlotProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const prevHeight = useRef(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const node = contentRef.current;
    if (!node) return;

    const scroller = getScrollParent(node);
    const start = performance.now();
    let frame = 0;

    if (expanded) {
      const tick = () => {
        const rect = node.getBoundingClientRect();
        const visibleBottom = scroller
          ? scroller.getBoundingClientRect().bottom
          : window.innerHeight;
        const overflow = rect.bottom - (visibleBottom - SCROLL_MARGIN);
        if (overflow > 0) {
          if (scroller) {
            scroller.scrollTop += overflow;
          } else {
            window.scrollBy({ top: overflow, left: 0, behavior: "auto" });
          }
        }
        prevHeight.current = node.offsetHeight;
        if (performance.now() - start < ANIMATION_MS + 60) {
          frame = requestAnimationFrame(tick);
        }
      };
      frame = requestAnimationFrame(tick);
    } else {
      const tick = () => {
        const currentHeight = node.offsetHeight;
        const delta = prevHeight.current - currentHeight;
        if (delta > 0 && scroller) {
          scroller.scrollTop -= delta;
        } else if (delta > 0) {
          window.scrollBy({ top: -delta, left: 0, behavior: "auto" });
        }
        prevHeight.current = currentHeight;
        if (performance.now() - start < ANIMATION_MS + 60) {
          frame = requestAnimationFrame(tick);
        }
      };
      frame = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(frame);
  }, [expanded]);

  return (
    <Collapsible.Root open={expanded}>
      <Collapsible.Content
        ref={contentRef}
        className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
      >
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function getScrollParent(node: HTMLElement): HTMLElement | null {
  let parent = node.parentElement;
  while (parent) {
    const overflowY = getComputedStyle(parent).overflowY;
    const isScrollable = overflowY === "auto" || overflowY === "scroll";
    if (isScrollable && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

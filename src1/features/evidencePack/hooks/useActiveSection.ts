import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  rootRef: React.RefObject<HTMLElement>;
  sectionKeys: string[];
}

export function useActiveSection({ rootRef, sectionKeys }: Options) {
  const [observedKey, setObservedKey] = useState<string | undefined>(
    sectionKeys[0],
  );
  const [forcedKey, setForcedKey] = useState<string | undefined>();
  const forcedTimer = useRef<ReturnType<typeof setTimeout>>();

  const forceKey = useCallback((key: string, durationMs = 850) => {
    setForcedKey(key);
    if (forcedTimer.current) clearTimeout(forcedTimer.current);
    forcedTimer.current = setTimeout(() => setForcedKey(undefined), durationMs);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || sectionKeys.length === 0) return;

    const lastKey = sectionKeys[sectionKeys.length - 1];
    const visible = new Map<string, IntersectionObserverEntry>();

    const pickBest = () => {
      if (visible.size === 0) return;
      let bestKey: string | undefined;
      let bestRatio = -1;
      for (const [key, entry] of visible) {
        if (entry.intersectionRatio > bestRatio) {
          bestRatio = entry.intersectionRatio;
          bestKey = key;
        }
      }
      if (bestKey) setObservedKey(bestKey);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) visible.set(id, entry);
          else visible.delete(id);
        }
        pickBest();
      },
      {
        root,
        rootMargin: "-80px 0px -40% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    const handleScroll = () => {
      const atBottom =
        root.scrollHeight - root.scrollTop - root.clientHeight < 4;
      if (atBottom) setObservedKey(lastKey);
    };
    root.addEventListener("scroll", handleScroll, { passive: true });

    for (const key of sectionKeys) {
      const node = root.querySelector(`#${CSS.escape(key)}`);
      if (node) observer.observe(node);
    }
    return () => {
      observer.disconnect();
      root.removeEventListener("scroll", handleScroll);
    };
  }, [rootRef, sectionKeys]);

  return { activeKey: forcedKey ?? observedKey, forceKey };
}

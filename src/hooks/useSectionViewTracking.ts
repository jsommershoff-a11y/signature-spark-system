import { useEffect, useRef } from 'react';
import { trackSectionView, type FunnelStage } from '@/lib/analytics';

/**
 * Trackt einmalig pro Mount, wenn die referenzierte Section sichtbar wird (>=40 %).
 * Nutzt IntersectionObserver, damit nur tatsächlich gesehene CTA-Bereiche zählen.
 */
export function useSectionViewTracking<T extends HTMLElement = HTMLElement>(
  stage: FunnelStage,
  context?: string,
) {
  const ref = useRef<T | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !fired.current) {
            fired.current = true;
            trackSectionView(stage, context);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [stage, context]);

  return ref;
}

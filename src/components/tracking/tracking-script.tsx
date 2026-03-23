'use client';

import { useEffect, useRef, useCallback } from 'react';

interface TrackingScriptProps {
  proposalId: string;
  sectionIds: string[];
}

type TrackingEventPayload =
  | { type: 'section_view'; proposalId: string; sectionId: string; durationMs: number }
  | { type: 'scroll_depth'; proposalId: string; depth: number }
  | { type: 'time_on_page'; proposalId: string; durationMs: number };

export function TrackingScript({ proposalId, sectionIds }: TrackingScriptProps) {
  const sessionStartRef = useRef<number>(Date.now());
  const sectionEnterTimesRef = useRef<Map<string, number>>(new Map());
  const flushedRef = useRef<boolean>(false);

  const sendEvent = useCallback((payload: TrackingEventPayload) => {
    const url = '/api/track/events';
    const body = JSON.stringify({ events: [payload] });

    // Prefer sendBeacon for reliability on page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    } else {
      void fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      });
    }
  }, []);

  // Section view tracking via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    for (const sectionId of sectionIds) {
      const el = document.querySelector(`[data-section-id="${sectionId}"]`);
      if (!el) continue;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              sectionEnterTimesRef.current.set(sectionId, Date.now());
            } else {
              const enterTime = sectionEnterTimesRef.current.get(sectionId);
              if (enterTime !== undefined) {
                const durationMs = Date.now() - enterTime;
                sectionEnterTimesRef.current.delete(sectionId);
                // Only record if viewed for at least 1 second
                if (durationMs >= 1000) {
                  sendEvent({
                    type: 'section_view',
                    proposalId,
                    sectionId,
                    durationMs,
                  });
                }
              }
            }
          }
        },
        { threshold: 0.5 },
      );

      observer.observe(el);
      observers.push(observer);
    }

    return () => {
      for (const obs of observers) {
        obs.disconnect();
      }
    };
  }, [proposalId, sectionIds, sendEvent]);

  // Scroll depth tracking
  useEffect(() => {
    let maxDepth = 0;
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) {
          ticking = false;
          return;
        }
        const depth = Math.min(Math.round((scrollTop / docHeight) * 100), 100);
        if (depth > maxDepth) {
          maxDepth = depth;
        }
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (maxDepth > 0) {
        sendEvent({ type: 'scroll_depth', proposalId, depth: maxDepth });
      }
    };
  }, [proposalId, sendEvent]);

  // Time on page — flush on unload
  useEffect(() => {
    function flush() {
      if (flushedRef.current) return;
      flushedRef.current = true;

      const durationMs = Date.now() - sessionStartRef.current;
      sendEvent({ type: 'time_on_page', proposalId, durationMs });
    }

    window.addEventListener('pagehide', flush);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });

    return () => {
      window.removeEventListener('pagehide', flush);
    };
  }, [proposalId, sendEvent]);

  // No visible output — purely behavioral
  return null;
}

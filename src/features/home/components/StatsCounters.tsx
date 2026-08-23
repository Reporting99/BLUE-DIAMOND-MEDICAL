"use client";

import { useEffect, useRef } from "react";

export interface StatCounterSpec {
  label: string;
  from: number;
  to: number;
  /** e.g. "+" after the number for English ("28+"). */
  suffix?: string;
  /** e.g. "+" before the number for Arabic ("+28") — numerals themselves stay Western/Latin either way. */
  prefix?: string;
}

const ANIMATION_DURATION_MS = 1000;
const REPEAT_INTERVAL_MS = 5000;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Approved-values counter strip ("HEADER, DISCLAIMER REMOVAL, COUNTERS
 * AND SERVICE-CARD INTERACTIONS" pass §12). Deliberately built around a
 * single shared IntersectionObserver and a single shared
 * requestAnimationFrame loop driving all `stats.length` numbers at once
 * via direct DOM text mutation (`ref.current.textContent = ...`) —
 * *not* per-number React state updated every frame, which the brief
 * explicitly asks to avoid ("a lighter shared implementation").
 *
 * Behavior: starts counting the moment the section enters the viewport,
 * repeats every 5s while it stays visible, pauses when the section
 * scrolls out of view or the tab is hidden (`visibilitychange`), and
 * resumes with a fresh cycle when visible again — never running two
 * overlapping timers, never leaking an interval/rAF/observer past
 * unmount. Values never change; only the counting animation is new.
 */
export function StatsCounters({ stats }: { stats: readonly StatCounterSpec[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rafId = useRef<number | null>(null);
  const intervalId = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setFinalValues = () => {
      stats.forEach((stat, i) => {
        const el = valueRefs.current[i];
        if (el) el.textContent = `${stat.prefix ?? ""}${stat.to}${stat.suffix ?? ""}`;
      });
    };

    if (prefersReducedMotion) {
      // Accessibility takes priority over animation — final values only,
      // no timers ever started.
      setFinalValues();
      return;
    }

    const runOneCycle = () => {
      if (rafId.current !== null) return; // never overlap an in-progress animation
      const start = performance.now();
      const step = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / ANIMATION_DURATION_MS);
        const eased = easeOutCubic(t);
        stats.forEach((stat, i) => {
          const el = valueRefs.current[i];
          if (!el) return;
          const current = Math.round(stat.from + (stat.to - stat.from) * eased);
          const showAffixes = t >= 1;
          el.textContent = `${showAffixes ? (stat.prefix ?? "") : ""}${current}${showAffixes ? (stat.suffix ?? "") : ""}`;
        });
        if (t < 1) {
          rafId.current = requestAnimationFrame(step);
        } else {
          rafId.current = null;
        }
      };
      rafId.current = requestAnimationFrame(step);
    };

    const startCycling = () => {
      if (intervalId.current !== null) return; // never create a second timer
      runOneCycle();
      intervalId.current = window.setInterval(runOneCycle, REPEAT_INTERVAL_MS);
    };

    const stopCycling = () => {
      if (intervalId.current !== null) {
        window.clearInterval(intervalId.current);
        intervalId.current = null;
      }
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };

    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && document.visibilityState === "visible") {
          startCycling();
        } else {
          stopCycling();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopCycling();
        return;
      }
      // Tab became visible again — resume only if the section is
      // currently the one actually in view.
      const rect = node.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) startCycling();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopCycling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `stats` is a stable literal array from the caller each render; re-subscribing on every render would tear down/recreate the observer and timers for no reason.
  }, []);

  return (
    <div ref={sectionRef} className="grid grid-cols-3 gap-6 text-center">
      {stats.map((stat, i) => (
        <div key={stat.label} data-reveal="up" data-reveal-delay={String(Math.min(i, 3))}>
          <div className="ltr-run font-heading text-[clamp(2.75rem,6vw,4.5rem)] leading-none text-primary-hover">
            <span
              ref={(el) => {
                valueRefs.current[i] = el;
              }}
            >
              {/* Server-rendered as the real approved final value, not
                  the animation's starting point — correct for crawlers,
                  no-JS visitors, and reduced-motion, and never wrong
                  even for the instant before hydration/the
                  IntersectionObserver fires. */}
              {stat.prefix}
              {stat.to}
              {stat.suffix}
            </span>
          </div>
          <div className="mt-2 text-xs font-semibold tracking-[0.08em] text-primary uppercase">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

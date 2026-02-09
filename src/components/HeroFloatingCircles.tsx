import React, { useRef, useEffect, useMemo } from 'react';

const CIRCLE_COUNT = 25;
const CIRCLE_SIZE_PX = 6;
/** Extended area: movement bounds are larger than the visible hero (150% each axis, centered). */
const EXTEND_RATIO = 1.5;
const EXTEND_OFFSET = (EXTEND_RATIO - 1) / 2; // 0.25 so left/top -25%

/** Slow base speed (percent of stage per frame at 60fps). */
const BASE_SPEED = 0.018;
/** Acceleration magnitude (how much velocity changes per frame). */
const ACCEL_MAG = 0.00085;
/** Angular speed for acceleration variation (rad per frame). */
const OMEGA = 0.00042;
/** Max velocity (percent per frame). */
const MAX_V = 0.045;

interface CircleState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phaseX: number;
  phaseY: number;
  omegaX: number;
  omegaY: number;
}

function createInitialState(): CircleState {
  return {
    x: Math.random() * 100,
    y: Math.random() * 100,
    vx: (Math.random() - 0.5) * 2 * BASE_SPEED,
    vy: (Math.random() - 0.5) * 2 * BASE_SPEED,
    phaseX: Math.random() * Math.PI * 2,
    phaseY: Math.random() * Math.PI * 2,
    omegaX: OMEGA * (0.7 + Math.random() * 0.6),
    omegaY: OMEGA * (0.7 + Math.random() * 0.6),
  };
}

export interface HeroFloatingCirclesProps {
  /** 'light' = mint/light hero (darker circles). 'dark' = dark hero (lighter circles). */
  variant?: 'light' | 'dark';
}

const LIGHT_STYLES = {
  background: 'rgba(168, 195, 175, 0.82)',
  boxShadow: '0 0 0 1px rgba(120, 155, 130, 0.15)',
};

const DARK_STYLES = {
  background: 'rgba(255, 255, 255, 0.22)',
  boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.08)',
};

export function HeroFloatingCircles({ variant = 'light' }: HeroFloatingCirclesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialCircles = useMemo(() => Array.from({ length: CIRCLE_COUNT }, createInitialState), []);
  const circleStyles = variant === 'dark' ? DARK_STYLES : LIGHT_STYLES;
  const stateRef = useRef<{
    circles: CircleState[];
    t: number;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    stateRef.current = { circles: initialCircles.map((c) => ({ ...c })), t: 0 };

    let rafId: number;

    const tick = () => {
      const state = stateRef.current;
      if (!state || !containerRef.current) return;

      state.t += 1;
      const t = state.t;

      const circleEls = container.querySelectorAll<HTMLDivElement>('[data-hero-circle]');
      if (circleEls.length !== CIRCLE_COUNT) return;

      state.circles.forEach((c, i) => {
        const ax = ACCEL_MAG * Math.sin(t * c.omegaX + c.phaseX);
        const ay = ACCEL_MAG * Math.cos(t * c.omegaY + c.phaseY);

        c.vx += ax;
        c.vy += ay;

        const clamp = (v: number) => Math.max(-MAX_V, Math.min(MAX_V, v));
        c.vx = clamp(c.vx);
        c.vy = clamp(c.vy);

        c.x += c.vx;
        c.y += c.vy;

        const wrap = (p: number) => {
          if (p < 0) return p + 100;
          if (p > 100) return p - 100;
          return p;
        };
        c.x = wrap(c.x);
        c.y = wrap(c.y);

        const el = circleEls[i];
        if (el) {
          el.style.left = `${c.x}%`;
          el.style.top = `${c.y}%`;
          const breath = 0.78 + 0.12 * Math.sin(t * 0.0015 + c.phaseX + c.phaseY);
          el.style.opacity = String(breath);
        }
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{
        left: `${-EXTEND_OFFSET * 100}%`,
        top: `${-EXTEND_OFFSET * 100}%`,
        width: `${EXTEND_RATIO * 100}%`,
        height: `${EXTEND_RATIO * 100}%`,
      }}
      aria-hidden
    >
      {Array.from({ length: CIRCLE_COUNT }, (_, i) => (
        <div
          key={i}
          data-hero-circle
          className="absolute rounded-full will-change-transform"
          style={{
            width: CIRCLE_SIZE_PX,
            height: CIRCLE_SIZE_PX,
            left: `${initialCircles[i].x}%`,
            top: `${initialCircles[i].y}%`,
            ...circleStyles,
          }}
        />
      ))}
    </div>
  );
}

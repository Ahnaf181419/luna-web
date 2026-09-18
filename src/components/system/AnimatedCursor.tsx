import React, { useEffect, useRef, useState } from 'react';

const CROSS_SIZE = 14;
const RING_SIZE = 44;
const RING_LERP = 0.16;
const LOCK_LERP = 0.24;
const MAGNET_RADIUS = 36;
const RING_IDLE_SPEED = 16;
const RING_HOVER_SPEED = 64;
const RING_LOCK_SPEED = 110;
const RING_SCALE_HOVER = 1.38;
const RING_SCALE_PRESS = 0.82;
const CROSS_SCALE_PRESS = 0.78;

const INTERACTIVE_SELECTOR =
  'a, button, [role="tab"], [role="slider"], input[type="range"], summary, [data-cursor-magnet]';
const TEXT_SELECTOR = 'input:not([type="range"]), textarea, select, [contenteditable]';

function queryMedia(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  return window.matchMedia(query);
}

export const AnimatedCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const crossRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = queryMedia('(pointer: fine)');
    const reduced = queryMedia('(prefers-reduced-motion: reduce)');
    if (!fine) return;
    const update = () => setEnabled(fine.matches && !(reduced?.matches ?? false));
    update();
    fine.addEventListener('change', update);
    reduced?.addEventListener('change', update);
    return () => {
      fine.removeEventListener('change', update);
      reduced?.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add('has-reticle-cursor');

    const root = rootRef.current;
    const cross = crossRef.current;
    const ring = ringRef.current;
    if (!root || !cross || !ring) return;

    let raf = 0;
    let pointerX = -100;
    let pointerY = -100;
    let inside = false;
    let pressed = false;
    let textHover = false;
    let interactive = false;
    let lockedCenter: { x: number; y: number } | null = null;
    let ringX = -100;
    let ringY = -100;
    let ringScale = 1;
    let ringSpeed = RING_IDLE_SPEED;
    let angle = 0;
    let magnetEls: Element[] = [];
    let magnetRects: Array<{ x: number; y: number; r: number }> = [];

    const refreshMagnets = () => {
      magnetEls = Array.from(document.querySelectorAll('[data-cursor-magnet]'));
      magnetRects = magnetEls.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          r: Math.max(rect.width, rect.height) / 2,
        };
      });
    };

    const findLock = (): { x: number; y: number } | null => {
      for (let i = 0; i < magnetRects.length; i++) {
        const m = magnetRects[i];
        if (!m) continue;
        const reach = m.r + MAGNET_RADIUS;
        const dx = pointerX - m.x;
        const dy = pointerY - m.y;
        if (dx * dx + dy * dy <= reach * reach) return { x: m.x, y: m.y };
      }
      return null;
    };

    const classify = (target: EventTarget | null) => {
      const el = target instanceof Element ? target : null;
      textHover = !!el?.closest(TEXT_SELECTOR);
      if (!textHover) lockedCenter = findLock();
      interactive = !!el?.closest(INTERACTIVE_SELECTOR) || !!lockedCenter;
    };

    const onMouseMove = (e: MouseEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (!inside) {
        inside = true;
        ringX = pointerX;
        ringY = pointerY;
      }
      classify(e.target);
    };

    const onLeave = () => {
      inside = false;
    };

    const onDown = () => {
      pressed = true;
    };

    const onUp = () => {
      pressed = false;
    };

    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const active = inside && !textHover && (interactive || !!lockedCenter);
      const targetScale = pressed ? RING_SCALE_PRESS : active ? RING_SCALE_HOVER : 1;
      const targetSpeed = lockedCenter
        ? RING_LOCK_SPEED
        : active
          ? RING_HOVER_SPEED
          : RING_IDLE_SPEED;

      const targetX = lockedCenter?.x ?? pointerX;
      const targetY = lockedCenter?.y ?? pointerY;
      const lerp = lockedCenter ? LOCK_LERP : RING_LERP;
      const blend = 1 - Math.pow(1 - lerp, dt * 60);

      ringX += (targetX - ringX) * blend;
      ringY += (targetY - ringY) * blend;
      ringScale += (targetScale - ringScale) * blend;
      ringSpeed += (targetSpeed - ringSpeed) * blend;
      angle = (angle + ringSpeed * dt) % 360;

      const crossScale = pressed ? CROSS_SCALE_PRESS : 1;
      cross.style.transform = `translate3d(${pointerX - CROSS_SIZE / 2}px, ${pointerY - CROSS_SIZE / 2}px, 0) scale(${crossScale})`;
      cross.style.opacity = inside ? '1' : '0';

      ring.style.transform = `translate3d(${ringX - RING_SIZE / 2}px, ${ringY - RING_SIZE / 2}px, 0) rotate(${angle}deg) scale(${ringScale})`;
      ring.style.opacity = inside ? '1' : '0';
      ring.style.color = active ? 'var(--primary)' : 'var(--accent)';

      root.dataset.text = textHover ? 'true' : 'false';

      raf = requestAnimationFrame(tick);
    };

    refreshMagnets();
    const magnetTimer = window.setInterval(refreshMagnets, 400);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('mousedown', onDown, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });
    window.addEventListener('scroll', refreshMagnets, { passive: true });
    window.addEventListener('resize', refreshMagnets, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove('has-reticle-cursor');
      window.clearInterval(magnetTimer);
      window.cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('scroll', refreshMagnets);
      window.removeEventListener('resize', refreshMagnets);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={rootRef} className="reticle-cursor" aria-hidden="true">
      <div ref={ringRef} className="reticle-layer reticle-ring" style={{ opacity: 0 }}>
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          fill="none"
        >
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={19}
            stroke="currentColor"
            strokeWidth={1}
            strokeDasharray="2.5 4.5"
          />
          <line
            x1={RING_SIZE / 2}
            y1={0}
            x2={RING_SIZE / 2}
            y2={5}
            stroke="currentColor"
            strokeWidth={1.25}
          />
          <line
            x1={RING_SIZE / 2}
            y1={RING_SIZE - 5}
            x2={RING_SIZE / 2}
            y2={RING_SIZE}
            stroke="currentColor"
            strokeWidth={1.25}
          />
          <line
            x1={0}
            y1={RING_SIZE / 2}
            x2={5}
            y2={RING_SIZE / 2}
            stroke="currentColor"
            strokeWidth={1.25}
          />
          <line
            x1={RING_SIZE - 5}
            y1={RING_SIZE / 2}
            x2={RING_SIZE}
            y2={RING_SIZE / 2}
            stroke="currentColor"
            strokeWidth={1.25}
          />
        </svg>
      </div>
      <div ref={crossRef} className="reticle-layer reticle-cross" style={{ opacity: 0 }}>
        <svg
          width={CROSS_SIZE}
          height={CROSS_SIZE}
          viewBox={`0 0 ${CROSS_SIZE} ${CROSS_SIZE}`}
          fill="none"
        >
          <line x1={7} y1={0} x2={7} y2={4.5} stroke="currentColor" strokeWidth={1.5} />
          <line x1={7} y1={9.5} x2={7} y2={14} stroke="currentColor" strokeWidth={1.5} />
          <line x1={0} y1={7} x2={4.5} y2={7} stroke="currentColor" strokeWidth={1.5} />
          <line x1={9.5} y1={7} x2={14} y2={7} stroke="currentColor" strokeWidth={1.5} />
          <circle cx={7} cy={7} r={0.9} fill="currentColor" />
        </svg>
      </div>
    </div>
  );
};

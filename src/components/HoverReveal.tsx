"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor-following spotlight reveal (the "hover-reveal" effect).
 *
 * A fixed-size layer holding the fierce character art sits above the hero
 * background but BELOW every piece of text/UI (the DOM order enforces this:
 * this component is rendered before the hero's content stack). Visibility is
 * driven entirely by a CSS radial-gradient mask centred on an eased cursor
 * position, so:
 *  - outside the 260px radius the layer is fully transparent;
 *  - the edge is a soft feather, not a hard circle;
 *  - `pointer-events: none` means it can never intercept a click.
 *
 * Movement is eased with an exponential lerp in rAF (the same damping the 3D
 * scene uses), so the spotlight trails the cursor slightly instead of snapping.
 * When the cursor leaves the hero, the mask collapses and the image vanishes.
 *
 * There is deliberately no React state per mousemove — updating a CSS custom
 * property avoids a re-render per event.
 */
export default function HoverReveal() {
  const layerRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const host = hostRef.current;
    if (!layer || !host) return;

    const layerEl = layer;
    const hostEl = host;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const RADIUS = 260;
    const EASE = 14; // lerp factor per second; higher = tighter tracking

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let inside = false;
    let revealed = 0; // 0..1, eased in/out so the spotlight never pops
    let raf = 0;
    let last = performance.now();

    function setMask(cx: number, cy: number, alpha: number) {
      const value =
        `radial-gradient(circle ${RADIUS}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px,` +
        ` rgba(0,0,0,${alpha.toFixed(3)}) 0%,` +
        ` rgba(0,0,0,${(alpha * 0.92).toFixed(3)}) 42%,` +
        ` rgba(0,0,0,${(alpha * 0.55).toFixed(3)}) 68%,` +
        ` rgba(0,0,0,0) 100%)`;
      layerEl.style.webkitMaskImage = value;
      layerEl.style.maskImage = value;
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const k = 1 - Math.exp(-EASE * dt);
      x += (targetX - x) * k;
      y += (targetY - y) * k;

      const wanted = inside ? 1 : 0;
      revealed += (wanted - revealed) * (1 - Math.exp(-9 * dt));

      layerEl.style.opacity = revealed < 0.004 ? "0" : String(revealed);
      if (revealed > 0.004) setMask(x, y, revealed);

      if (!inside && revealed < 0.004) {
        raf = 0; // fully hidden; stop the loop until the cursor returns
      }
    }

    function onMove(event: PointerEvent) {
      const rect = hostEl.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
      if (!inside && raf === 0) {
        // Snap to the entry point so the spotlight doesn't sweep in from 0,0.
        x = targetX;
        y = targetY;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
      inside = true;
    }

    function onLeave() {
      inside = false;
    }

    hostEl.addEventListener("pointermove", onMove);
    hostEl.addEventListener("pointerleave", onLeave);

    return () => {
      hostEl.removeEventListener("pointermove", onMove);
      hostEl.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0 z-[5]">
      {/* The reveal layer. Below every UI element by DOM order and z-index. */}
      <div
        ref={layerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 will-change-[mask-position,opacity]"
        style={{
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      >
        {/* Mask-positioned every frame; next/image's layout machinery adds
            nothing here, and the art is decorative. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/hero-reveal.webp"
          alt=""
          draggable={false}
          className="absolute right-[6%] bottom-0 h-[86%] w-auto max-w-none object-contain select-none"
        />
      </div>
    </div>
  );
}

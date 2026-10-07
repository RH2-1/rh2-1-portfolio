"use client";

import { useEffect, useRef } from "react";

/**
 * CURSOR — the RH2-1 "target lock" hunter reticle.
 *
 * Replaces the native cursor on fine-pointer devices with a precision
 * targeting system:
 *
 *   - a cream dot rides the exact pointer position (the "truth");
 *   - an amber bracket reticle follows with damped lag, slowly rotating;
 *   - six phosphor ghosts trail behind, brightness tied to pointer speed —
 *     idle is a clean dot, motion is a comet;
 *   - a tiny mono readout prints the live pointer coordinates;
 *   - hover an interactive element (a, button, [data-cursor]) and the
 *     brackets SNAP onto the element's real bounding box — measured live
 *     every frame, so hover zooms make the lock breathe — turning red-hot
 *     with the element's label ("INSPECT", "ENTER", "OPEN"…);
 *   - mousedown contracts the reticle; mouseup fires an expanding pulse.
 *
 * Touch devices never mount it; prefers-reduced-motion drops the trail,
 * rotation and lag (the reticle still follows instantly). The component
 * adds `cur-on` to <html>, which is what hides the native cursor.
 */

const TRAIL_K = [17, 13.5, 10.8, 8.6, 6.9, 5.5]; // damping per ghost
const TRAIL_SIZE = [7, 6, 5, 4.5, 3.5, 3]; // px per ghost
const REST = 26; // reticle rest size (px)

export default function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const retRef = useRef<HTMLDivElement>(null);
  const retInRef = useRef<HTMLDivElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const trailRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const root = rootRef.current;
    const dot = dotRef.current;
    const ret = retRef.current;
    const retIn = retInRef.current;
    const coord = coordRef.current;
    const label = labelRef.current;
    if (!root || !dot || !ret || !retIn || !coord || !label) return;

    document.documentElement.classList.add("cur-on");
    const ghosts = trailRef.current.filter(Boolean) as HTMLDivElement[];

    let tx = window.innerWidth / 2; // pointer truth
    let ty = window.innerHeight / 2;
    let rx = tx; // reticle position (damped)
    let ry = ty;
    let rw = REST; // reticle size (damped)
    let rh = REST;
    let rot = -34; // reticle rotation (deg)
    let rotVel = 26; // deg/s at rest
    let sc = 1; // click contraction
    let shown = false;
    let locked: Element | null = null;
    let down = false;
    let raf = 0;
    let last = performance.now();
    const gpos = ghosts.map(() => ({ x: tx, y: ty }));

    const setLabel = (text: string, on: boolean) => {
      label.textContent = text;
      label.dataset.on = on ? "true" : "false";
    };

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        shown = true;
        rx = tx;
        ry = ty;
        root.style.opacity = "1";
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = (e.target as Element | null)?.closest?.(
        "a, button, [data-cursor]",
      ) as Element | null;
      if (t && t !== locked) {
        locked = t;
        const custom = t.getAttribute("data-cursor");
        const fallback = t.tagName === "BUTTON" ? "RUN" : (t.getAttribute("href") ?? "").startsWith("#") ? "JUMP" : "OPEN";
        setLabel(custom ?? fallback, true);
      } else if (!t && locked) {
        locked = null;
        setLabel("", false);
      }
    };

    const onDown = () => {
      down = true;
    };
    const onUp = (e: MouseEvent) => {
      if (!down) return;
      down = false;
      if (reduce) return;
      const pulse = document.createElement("span");
      pulse.className = "cur-pulse";
      pulse.style.left = `${e.clientX}px`;
      pulse.style.top = `${e.clientY}px`;
      root.appendChild(pulse);
      pulse.addEventListener("animationend", () => pulse.remove(), { once: true });
    };
    const onLeave = () => {
      root.style.opacity = "0";
      shown = false;
    };
    const onEnter = () => {
      root.style.opacity = "1";
      shown = true;
    };

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Dot: the truth, instantly.
      dot!.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;

      // Lock target: an element's live bounding box, or the pointer.
      let cx = tx;
      let cy = ty;
      let cw = REST;
      let ch = REST;
      if (locked) {
        const r = locked.getBoundingClientRect();
        cx = r.left + r.width / 2;
        cy = r.top + r.height / 2;
        cw = r.width + 16;
        ch = r.height + 16;
      }

      const k = reduce ? 1 : 1 - Math.exp(-16 * dt);
      const ks = reduce ? 1 : 1 - Math.exp(-11 * dt);
      rx += (cx - rx) * k;
      ry += (cy - ry) * k;
      rw += (cw - rw) * ks;
      rh += (ch - rh) * ks;
      rotVel += ((locked || reduce ? 0 : 26) - rotVel) * (1 - Math.exp(-6 * dt));
      rot += rotVel * dt;
      sc += ((down ? 0.82 : 1) - sc) * (1 - Math.exp(-18 * dt));

      ret!.style.width = `${rw.toFixed(1)}px`;
      ret!.style.height = `${rh.toFixed(1)}px`;
      ret!.style.transform = `translate3d(${(rx - rw / 2).toFixed(1)}px, ${(ry - rh / 2).toFixed(1)}px, 0)`;
      retIn!.style.transform = `rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      ret!.dataset.lock = locked ? "true" : "false";

      // Phosphor comet: each ghost chases the previous, brightness by speed.
      const speed = Math.hypot(tx - rx, ty - ry);
      const boost = Math.min(1, speed / 26);
      for (let i = 0; i < ghosts.length; i += 1) {
        const prev = i === 0 ? { x: tx, y: ty } : gpos[i - 1];
        const gk = reduce ? 1 : 1 - Math.exp(-TRAIL_K[i] * dt);
        gpos[i].x += (prev.x - gpos[i].x) * gk;
        gpos[i].y += (prev.y - gpos[i].y) * gk;
        const g = ghosts[i];
        g.style.transform = `translate3d(${(gpos[i].x - TRAIL_SIZE[i] / 2).toFixed(1)}px, ${(gpos[i].y - TRAIL_SIZE[i] / 2).toFixed(1)}px, 0)`;
        g.style.opacity = reduce
          ? "0"
          : ((0.1 + 0.4 * boost) * (1 - i / ghosts.length)).toFixed(3);
      }

      // Live coordinate readout, offset below-right of the dot.
      coord!.style.transform = `translate3d(${(tx + 16).toFixed(1)}px, ${(ty + 20).toFixed(1)}px, 0)`;
      const text = `x:${String(Math.round(tx)).padStart(4, "0")} y:${String(Math.round(ty)).padStart(4, "0")}`;
      if (coord!.textContent !== text) coord!.textContent = text;

      // Lock label rides the reticle's top edge.
      label!.style.transform = `translate3d(${rx.toFixed(1)}px, ${(ry - rh / 2 - 12).toFixed(1)}px, 0) translate(-50%, -100%)`;
    }

    raf = requestAnimationFrame(frame);
    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mousedown", onDown, { passive: true });
    document.addEventListener("mouseup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("cur-on");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="cur-root pointer-events-none fixed inset-0 z-[100] opacity-0"
    >
      {/* phosphor trail */}
      {TRAIL_SIZE.map((s, i) => (
        <div
          key={i}
          ref={(el) => {
            trailRef.current[i] = el;
          }}
          className="cur-ghost"
          style={{ width: s, height: s }}
        />
      ))}

      {/* targeting reticle */}
      <div ref={retRef} data-lock="false" className="cur-ret">
        <div ref={retInRef} className="cur-ret-in">
          <span className="cur-c cur-c-tl" />
          <span className="cur-c cur-c-tr" />
          <span className="cur-c cur-c-bl" />
          <span className="cur-c cur-c-br" />
          <span className="cur-cross" />
        </div>
      </div>

      {/* the pointer truth */}
      <div ref={dotRef} className="cur-dot" />

      {/* readouts */}
      <span ref={coordRef} className="cur-coord" />
      <span ref={labelRef} data-on="false" className="cur-label" />
    </div>
  );
}

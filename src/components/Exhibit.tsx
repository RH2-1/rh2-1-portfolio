"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

/**
 * EXHIBIT — the RH2-1 terminal.
 *
 * The section IS a terminal on pure black. No editorial chrome: no heading
 * fragments, no labels, no coordinates — just the terminal, top-left at
 * rest. Nothing else moves except the terminal being alive.
 *
 * It is never static, even unexpanded: an idle typewriter loops forever —
 * an amber [|] block cursor tip-tip-types a boot log, pauses, thinks,
 * blinks, clears and does it again. Scroll takes over the same session:
 *
 *   scroll p 0.05–0.60  the scroll-scrubbed session types (whoami → the
 *                       operator's identity), drifting toward center;
 *   p 0.46–0.58         CRT power-on flash;
 *   p 0.62–0.88         the session fades, full-screen identity blooms —
 *                       giant glitch RIYAAD HASAN + typed subtitle;
 *   p 0.88–1.00         hold — borderless, nothing else on screen.
 *
 * Idle typing owns the lines until scroll progress reaches each line's
 * window, so the handoff between idle-mode and scroll-mode is invisible:
 * the same session, two masters.
 *
 * Performance: one rAF loop (text written directly, no React state per
 * frame). Reduced motion: no idle typing loop, no flash, no damping;
 * scroll still scrubs the session (navigation, not decoration).
 */

const EXIT_EASE = 9; // damping for the scroll→progress mapping

type Line = { pre: string; cmd: string; kind: string; at: number; dur: number };

const LINES: Line[] = [
  { pre: "root@rh2-1:~$ ", cmd: "whoami", kind: "cmd", at: 0.05, dur: 0.07 },
  { pre: "", cmd: "Riyaad Hasan — 17", kind: "out out-hi", at: 0.13, dur: 0.07 },
  { pre: "root@rh2-1:~$ ", cmd: "cat role.txt", kind: "cmd", at: 0.21, dur: 0.07 },
  { pre: "", cmd: "independent bug hunter", kind: "out", at: 0.28, dur: 0.06 },
  { pre: "", cmd: "& security researcher", kind: "out out-dim", at: 0.34, dur: 0.06 },
  { pre: "root@rh2-1:~$ ", cmd: "./mission --run", kind: "cmd", at: 0.4, dur: 0.07 },
  { pre: "", cmd: "scanning targets… analyzing responses…", kind: "out out-dim", at: 0.47, dur: 0.06 },
  { pre: "", cmd: "documenting findings… disclosing responsibly…", kind: "out out-dim", at: 0.53, dur: 0.06 },
  { pre: "root@rh2-1:~$ ", cmd: "echo $MOTTO", kind: "cmd", at: 0.59, dur: 0.06 },
  { pre: "", cmd: "\u201cSmaller surface. Deeper questions.\u201d", kind: "out out-amber", at: 0.65, dur: 0.07 },
];

const NAME_A = "RIYAAD";
const NAME_B = "HASAN";
const SUB = "17 — independent bug hunter & security researcher";

/** The idle boot log the terminal types by itself, forever. */
const IDLE = [
  "root@rh2-1:~$ ./session --attach",
  "binding tty0 … ok",
  "loading profile: RH2-1 … ok",
  "operator: RIYAAD HASAN (17)",
  "clearance: public — status: watching",
  "root@rh2-1:~$ _",
];

type LineRef = {
  cmdEl: HTMLSpanElement;
  curEl: HTMLSpanElement;
  cmd: string;
  at: number;
  dur: number;
};

export default function Exhibit() {
  const sectionRef = useRef<HTMLElement>(null);
  const termRef = useRef<HTMLDivElement>(null);
  const idleRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLSpanElement>(null);
  const promptRef = useRef<HTMLParagraphElement>(null);
  const crtRef = useRef<HTMLSpanElement>(null);
  const phosRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<LineRef[]>([]);
  const letterRefs = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const term = termRef.current;
    const name = nameRef.current;
    if (!section || !term || !name) return;

    const sectionEl = section;
    const termEl = term;
    const nameEl = name;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let last = performance.now();
    let smooth = -1;
    let anchorStart = 24; // % vw — top-left on desktop
    let scaleEnd = 1.55;

    function measure() {
      const vw = window.innerWidth;
      const isDesktop = vw >= 768;
      anchorStart = isDesktop ? 24 : 50;
      scaleEnd = isDesktop ? 1.55 : 1.22;
      // A touch lower than dead top-left, per composition.
      termEl.style.setProperty("--ax", `${anchorStart}%`);
      termEl.style.setProperty("--ty", isDesktop ? "40%" : "50%");
    }
    measure();

    const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const rect = sectionEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = Math.max(rect.height - vh, 1);
      const target = Math.min(Math.max(-rect.top / total, 0), 1);

      if (smooth < 0 || reduceMotion) {
        smooth = target;
      } else {
        smooth += (target - smooth) * (1 - Math.exp(-EXIT_EASE * dt));
      }
      const p = smooth;

      // Anchor drift toward center + gentle growth of the session block.
      const e = ease(Math.min(Math.max((p - 0.05) / 0.55, 0), 1));
      const ax = anchorStart + (50 - anchorStart) * e;
      const ts = 1 + (scaleEnd - 1) * e;
      const py = (reduceMotion ? 0 : p * -2.5).toFixed(3);
      termEl.style.setProperty("--ax", `${ax.toFixed(3)}%`);
      termEl.style.setProperty("--ts", ts.toFixed(4));
      termEl.style.setProperty("--py", `${py}vh`);
      // Idle log fades out as scroll takes over the session.
      if (idleRef.current) {
        idleRef.current.style.opacity = Math.min(1, Math.max(0, 1.6 - p * 4)).toFixed(3);
      }
      // The session retires once the identity takes over.
      const tOut = 1 - ease(Math.min(Math.max((p - 0.6) / 0.1, 0), 1));
      termEl.style.opacity = tOut.toFixed(3);

      // Scroll-scrubbed typing.
      for (const l of lineRefs.current) {
        const span = reduceMotion ? 1 : ease(Math.min(Math.max((p - l.at) / l.dur, 0), 1));
        const n = Math.round(span * l.cmd.length);
        const text = l.cmd.slice(0, n);
        if (l.cmdEl.textContent !== text) l.cmdEl.textContent = text;
        const typing = n > 0 && n < l.cmd.length;
        l.curEl.classList.toggle("on", typing);
      }

      // Full-screen identity bloom.
      const nIn = ease(Math.min(Math.max((p - 0.62) / 0.14, 0), 1));
      nameEl.style.opacity = nIn.toFixed(3);
      nameEl.style.transform = `translate(-50%, -50%) scale(${(1.06 - 0.06 * nIn).toFixed(4)})`;
      for (let i = 0; i < letterRefs.current.length; i += 1) {
        const th = 0.63 + i * 0.011;
        letterRefs.current[i].classList.toggle("on", p >= th);
      }
      if (subRef.current) {
        const ss = reduceMotion ? 1 : ease(Math.min(Math.max((p - 0.78) / 0.08, 0), 1));
        const text = SUB.slice(0, Math.round(ss * SUB.length));
        if (subRef.current.textContent !== text) subRef.current.textContent = text;
      }
      if (promptRef.current) {
        promptRef.current.style.opacity = p >= 0.87 ? "1" : "0";
      }

      // CRT power-on flash (skipped for reduced motion).
      if (crtRef.current) {
        if (reduceMotion) {
          crtRef.current.style.opacity = "0";
        } else {
          const q = (p - 0.46) / 0.12;
          if (q <= 0 || q >= 1) {
            crtRef.current.style.opacity = "0";
          } else {
            const line = Math.min(q / 0.42, 1); // horizontal line grows
            const open = Math.min(Math.max((q - 0.42) / 0.58, 0), 1); // screen opens
            crtRef.current.style.opacity = (open > 0.75 ? (1 - open) / 0.25 : 1).toFixed(3);
            crtRef.current.style.setProperty("--cx", (0.12 + 0.88 * line).toFixed(4));
            crtRef.current.style.setProperty("--cy", (0.006 + 0.994 * open * open).toFixed(4));
          }
        }
      }

      // Phosphor bed brightens as the terminal comes alive.
      if (phosRef.current) {
        phosRef.current.style.opacity = (0.3 + 0.45 * p).toFixed(3);
      }
    }

    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // -------------------------------------------------------------- idle life
  // A fast typewriter types the boot log once, crisp and mechanical, with
  // a [|] cursor blinking while it works. When complete it STAYS — no
  // clear/restart loop — and the settled text gets an occasional glitch
  // burst. The moment the user scrolls (scrollTakesOver flips), all idle
  // activity halts: the log just fades with the session, never blinks.
  useEffect(() => {
    const el = idleRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.textContent = IDLE.join("\n");
      el.dataset.glitch = "false";
      return;
    }

    let scrollTakesOver = false;
    const pulse = () => {
      scrollTakesOver = true;
    };
    window.addEventListener("wheel", pulse, { passive: true, once: true });
    window.addEventListener("touchmove", pulse, { passive: true, once: true });

    let line = 0;
    let col = 0;
    let timer: ReturnType<typeof setTimeout>;

    const step = () => {
      if (scrollTakesOver) return; // never type or blink again after scroll
      const full = IDLE[line];
      col += 1;
      el.textContent =
        IDLE.slice(0, line).join("\n") + (line > 0 ? "\n" : "") + full.slice(0, col);
      if (col < full.length) {
        // fast typewriter: crisp, near-mechanical, tiny jitter
        timer = setTimeout(step, 14 + Math.random() * 16);
      } else if (line < IDLE.length - 1) {
        line += 1;
        col = 0;
        timer = setTimeout(step, 110 + Math.random() * 90);
      } else {
        // complete: stay settled, occasional glitch bursts only
        el.dataset.glitch = "true";
      }
    };
    timer = setTimeout(step, 600);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("wheel", pulse);
      window.removeEventListener("touchmove", pulse);
    };
  }, []);

  let letterIndex = 0;

  return (
    <section
      ref={sectionRef}
      id="gallery"
      aria-label="Exhibit — the RH2-1 terminal, owned by Riyaad Hasan"
      className="relative h-[420vh] bg-black"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Phosphor bed — the faint amber light of a live screen. */}
        <div
          ref={phosRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(85% 65% at 50% 50%, rgba(242,163,94,0.09), transparent 72%)",
            opacity: 0.3,
          }}
        />

        {/* ---------------------------------------------------------- */}
        {/* The terminal — borderless, top-left, never static          */}
        {/* ---------------------------------------------------------- */}
        <div
          ref={termRef}
          data-exhibit-term=""
          aria-hidden="true"
          className="absolute z-20 w-[min(560px,86vw)]"
          style={
            {
              left: "var(--ax, 24%)",
              top: "var(--ty, 40%)",
              transform:
                "translate(-50%, -50%) translateY(var(--py, 0vh)) scale(var(--ts, 1))",
              willChange: "transform, opacity",
            } as CSSProperties
          }
        >
          {/* Scroll-scrubbed session (drives the identity bloom). */}
          <div className="exh-term">
            {LINES.map((l, i) => (
              <div key={i} className={`tl ${l.kind}`}>
                <span className="tl-pre">{l.pre}</span>
                <span
                  className="tl-cmd"
                  ref={(el) => {
                    if (el) {
                      lineRefs.current[i] = {
                        cmdEl: el,
                        curEl: el.parentElement!.querySelector(".tl-cur")!,
                        cmd: l.cmd,
                        at: l.at,
                        dur: l.dur,
                      };
                    }
                  }}
                />
                <span className="tl-cur" aria-hidden="true">
                  ▊
                </span>
              </div>
            ))}
          </div>

          {/* Idle boot log — the terminal's own life, tip-tip + [|] blinks. */}
          <div ref={idleRef} data-glitch="false" className="exh-idle" aria-hidden="true" />
        </div>

        {/* ---------------------------------------------------------- */}
        {/* The identity — full-screen glitch typography               */}
        {/* ---------------------------------------------------------- */}
        <div
          ref={nameRef}
          data-exhibit-name=""
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 z-20 w-full opacity-0"
          style={{ transform: "translate(-50%, -50%) scale(1.06)", willChange: "transform, opacity" }}
        >
          <h2 className="exh-name text-center text-[15vw] leading-[0.85] font-black tracking-[0.01em] sm:text-[13vw] lg:text-[10.5rem]">
            {NAME_A.split("").map((ch, i) => (
              <span
                key={`a${i}`}
                className="nl"
                ref={(el) => {
                  if (el) letterRefs.current[letterIndex++] = el;
                }}
              >
                {ch}
              </span>
            ))}
            <br />
            {NAME_B.split("").map((ch, i) => (
              <span
                key={`b${i}`}
                className={`nl ${i % 2 === 1 ? "nl-outline" : ""}`}
                ref={(el) => {
                  if (el) letterRefs.current[letterIndex++] = el;
                }}
              >
                {ch}
              </span>
            ))}
          </h2>

          <p className="mt-6 text-center font-mono text-xs tracking-[0.3em] text-[#f2a35e] uppercase sm:text-sm">
            <span ref={subRef} />
            <span className="exh-cur" aria-hidden="true">
              ▊
            </span>
          </p>

          <p
            ref={promptRef}
            className="exh-prompt mt-14 text-center font-mono text-[11px] tracking-[0.35em] text-white/40 uppercase opacity-0"
          >
            root@rh2-1:~$ session kept alive
          </p>
        </div>

        {/* CRT power-on flash. */}
        <span ref={crtRef} aria-hidden="true" className="exh-crt pointer-events-none absolute inset-0 z-40 opacity-0" />

        {/* Scanlines + flicker over the whole screen. */}
        <span aria-hidden="true" className="exh-scanlines pointer-events-none absolute inset-0 z-40" />
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * FOOTER — the final page of the art book.
 *
 * Oversized RH2-1 glitch typography, generous negative space, a short brand
 * statement, navigation + social links, and one small copyright line. The
 * wordmark drifts up gently as it enters the viewport (staggered per letter,
 * once); everything else is static and quiet on purpose.
 *
 * Reduced motion: the wordmark is shown immediately, no drift.
 */

const WORD = "RH2-1";

const NAV = [
  { label: "Home", href: "/home" },
  { label: "About", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Writeups", href: "/writeups" },
];

const SOCIAL = [
  { label: "GitHub", href: "https://github.com/RH2-1" },
  { label: "X / Twitter", href: "https://x.com/RH2_1x" },
  { label: "HackerOne", href: "https://hackerone.com/rh2-1" },
  { label: "Email", href: "mailto:rh2-1@wearehackerone.com" },
];

export default function Footer() {
  const pathname = usePathname();
  const rootRef = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);
  const [contactFocused, setContactFocused] = useState(false);

  useEffect(() => {
    if (pathname !== "/contact") return;
    const focusTimeout = window.setTimeout(() => setContactFocused(true), 0);
    const timeout = window.setTimeout(() => setContactFocused(false), 2600);
    return () => {
      window.clearTimeout(focusTimeout);
      window.clearTimeout(timeout);
    };
  }, [pathname]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      root.dataset.revealed = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        root.dataset.revealed = "true";
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // Scroll-scrubbed wordmark: as the footer rises through the viewport the
  // giant RH2-1 starts skewed/split (a corrupted transmission) and resolves
  // into register exactly as the page ends. One rAF loop, CSS vars only.
  useEffect(() => {
    const root = rootRef.current;
    const word = wordRef.current;
    if (!root || !word) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
    function frame() {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const r = root!.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.top > vh || r.bottom < 0) return;
      // 0 when the footer's top touches the fold, 1 when its wordmark is
      // comfortably in view.
      const t = Math.min(Math.max((vh * 0.96 - r.top) / (vh * 0.55), 0), 1);
      const e = t * t * (3 - 2 * t);
      word!.style.setProperty("--fx", (1 - e).toFixed(4));
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <footer
      ref={rootRef}
      id="contact"
      aria-label="RH2-1 — site footer"
      data-footer=""
      className="relative overflow-hidden border-t border-white/10 bg-black"
    >
      {/* faint horizon line, like the last page of a book */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f2a35e]/40 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-10 sm:px-10 sm:pt-32">
        {/* ---------------------------------------------------------- */}
        {/* Oversized wordmark — centered                               */}
        {/* ---------------------------------------------------------- */}
        <div className="relative flex select-none flex-col items-center text-center">
          <p
            aria-hidden="true"
            className="mb-6 flex items-center gap-3 font-mono text-[11px] tracking-[0.4em] text-white/35 uppercase"
          >
            <span className="block h-px w-10 bg-white/25" />
            End of transmission
            <span className="block h-px w-10 bg-white/25" />
          </p>

          <h2
            ref={wordRef}
            className="ft-word text-center text-[26vw] leading-[0.8] font-black tracking-[0.02em] sm:text-[22vw] lg:text-[19rem]"
          >
            {WORD.split("").map((ch, i) => (
              <span
                key={i}
                className="ft-letter inline-block"
                style={{ ["--l" as string]: i }}
              >
                {ch === "2" ? <span className="text-[#f2a35e]">{ch}</span> : ch}
              </span>
            ))}
            <span
              aria-hidden="true"
              className="ft-letter ml-4 hidden align-top font-mono text-[0.1em] leading-[1.1] font-normal tracking-[0.3em] text-white/30 sm:ml-8 sm:inline-block"
              style={{ ["--l" as string]: WORD.length }}
            >
              independent
              <br />
              bug&nbsp;hunter
            </span>
          </h2>

          {/* glitch echo behind the wordmark */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#f2a35e]/[0.07] to-transparent"
          />
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Statement + links                                          */}
        {/* ---------------------------------------------------------- */}
        <div className="mt-20 grid gap-14 sm:mt-28 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="max-w-sm text-xl leading-snug font-semibold text-[#f7ede1] sm:text-2xl">
              Every vulnerability is a story.
              <br />
              And every system has one.
            </p>
            <p className="mt-5 max-w-md font-mono text-[11px] leading-relaxed tracking-[0.2em] text-white/40 uppercase">
              Find · investigate · disclose — smaller surface, deeper questions.
            </p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-3 lg:col-start-7">
            <h3 className="font-mono text-[10px] tracking-[0.35em] text-white/35 uppercase">
              Index
            </h3>
            <ul className="mt-5 space-y-3">
              {NAV.map((n) => (
                <li key={n.label}>
                  <a
                    href={n.href}
                    className="group inline-flex items-center gap-2 text-sm text-white/60 transition-colors duration-300 hover:text-[#f2a35e]"
                  >
                    <span
                      aria-hidden="true"
                      className="block h-px w-0 bg-[#f2a35e] transition-all duration-300 group-hover:w-5"
                    />
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h3 className="font-mono text-[10px] tracking-[0.35em] text-white/35 uppercase">
              Elsewhere
            </h3>
            <ul className="mt-5 space-y-3">
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a
                    id={s.label === "Email" ? "contact-email" : undefined}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`group inline-flex items-center gap-2 text-sm text-white/60 transition-colors duration-300 hover:text-[#f2a35e] ${s.label === "Email" && contactFocused ? "contact-email--glow" : ""}`}
                  >
                    <span
                      aria-hidden="true"
                      className="block h-px w-0 bg-[#f2a35e] transition-all duration-300 group-hover:w-5"
                    />
                    {s.label}
                    <span
                      aria-hidden="true"
                      className="font-mono text-[9px] text-white/25 transition-colors duration-300 group-hover:text-[#f2a35e]"
                    >
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Colophon                                                   */}
        {/* ---------------------------------------------------------- */}
        <div className="mt-24 flex flex-col gap-3 border-t border-white/10 pt-6 font-mono text-[10px] tracking-[0.25em] text-white/30 uppercase sm:mt-32 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 RH2-1 — all fractures reserved</p>
          <p className="flex items-center gap-2">
            <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-[#ff5c3d]" />
            responsible disclosure only
          </p>
        </div>
      </div>
    </footer>
  );
}
